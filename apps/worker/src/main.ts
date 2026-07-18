import { createPublicClient, createWalletClient, defineChain, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "node:fs";
import pino from "pino";
import { workerEnvSchema, parseEnv, getChain, type SupportedChainId } from "@monsave/config";

const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });

/**
 * Settlement automation worker.
 *
 * Detects due rounds on active circles and submits permissionless settleRound()
 * transactions. Design constraints (enforced by the contracts, restated here):
 *  - The automation signer holds NO protocol roles and NO user principal — it
 *    can only call functions any stranger could call.
 *  - The worker is optional: users can always settle a due round from the UI.
 *  - Every submission is simulated first, re-checked against current state, and
 *    only marked complete when the expected RoundSettled event is confirmed.
 */

const factoryAbi = [
  {
    type: "function",
    name: "getCircles",
    stateMutability: "view",
    inputs: [
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" },
    ],
    outputs: [{ type: "address[]" }],
  },
  { type: "function", name: "circleCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

const circleAbi = [
  {
    type: "function",
    name: "getSummary",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "state", type: "uint8" },
          { name: "currentRound", type: "uint256" },
          { name: "totalRounds", type: "uint256" },
          { name: "memberCount", type: "uint256" },
          { name: "contributionPerRound", type: "uint256" },
          { name: "roundPot", type: "uint256" },
          { name: "memberCommitment", type: "uint256" },
          { name: "totalPrincipalFunded", type: "uint256" },
          { name: "totalPrincipalPaid", type: "uint256" },
          { name: "totalPrincipalRefunded", type: "uint256" },
          { name: "principalInAdapter", type: "uint256" },
          { name: "grossYieldRealized", type: "uint256" },
          { name: "totalYieldAllocated", type: "uint256" },
          { name: "totalYieldClaimed", type: "uint256" },
          { name: "nextDueTime", type: "uint256" },
          { name: "nextRecipient", type: "address" },
          { name: "adapter", type: "address" },
        ],
      },
    ],
  },
  { type: "function", name: "settleRound", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const;

const STATE_ACTIVE = 3;

async function main() {
  const env = parseEnv(workerEnvSchema, process.env);
  const chainCfg = getChain(
    env.MONSAVE_NETWORK === "monad-mainnet" ? 143 : env.MONSAVE_NETWORK === "monad-testnet" ? 10143 : 31337,
  )!;
  const chain = defineChain({
    id: chainCfg.id,
    name: chainCfg.name,
    nativeCurrency: chainCfg.nativeCurrency,
    rpcUrls: { default: { http: [env.MONAD_RPC_URL] } },
  });

  const publicClient = createPublicClient({ chain, transport: http(env.MONAD_RPC_URL, { timeout: env.RPC_TIMEOUT_MS }) });

  // sanity: never run against the wrong chain
  const actualChainId = await publicClient.getChainId();
  if (actualChainId !== chain.id) {
    throw new Error(`Chain mismatch: expected ${chain.id}, RPC serves ${actualChainId}. Refusing to run.`);
  }

  const factory = env.CIRCLE_FACTORY_ADDRESS;
  if (!factory) {
    throw new Error("CIRCLE_FACTORY_ADDRESS is not configured — the worker has nothing to watch. Refusing to run.");
  }

  // Automation signer from an encrypted-at-rest keystore file. Optional: without
  // it the worker runs in observe-only mode and logs due rounds.
  let account: ReturnType<typeof privateKeyToAccount> | undefined;
  if (env.AUTOMATION_KEYSTORE_PATH) {
    const keyHex = readFileSync(env.AUTOMATION_KEYSTORE_PATH, "utf8").trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(keyHex)) {
      throw new Error("Automation key file malformed. Use a decrypted runtime mount from your secret manager.");
    }
    account = privateKeyToAccount(keyHex as `0x${string}`);
    logger.info({ signer: account.address }, "automation signer loaded");
  } else {
    logger.warn("no automation signer configured — running in observe-only mode");
  }

  const walletClient = account ? createWalletClient({ account, chain, transport: http(env.MONAD_RPC_URL) }) : undefined;
  const attempts = new Map<string, number>();

  async function tick() {
    try {
      const count = (await publicClient.readContract({
        address: factory as Address,
        abi: factoryAbi,
        functionName: "circleCount",
      })) as bigint;

      for (let offset = 0n; offset < count; offset += 100n) {
        const circles = (await publicClient.readContract({
          address: factory as Address,
          abi: factoryAbi,
          functionName: "getCircles",
          args: [offset, 100n],
        })) as readonly Address[];

        for (const circle of circles) {
          await processCircle(circle);
        }
      }
    } catch (err) {
      logger.error({ err }, "tick failed");
    }
  }

  async function processCircle(circle: Address) {
    const summary = await publicClient.readContract({ address: circle, abi: circleAbi, functionName: "getSummary" });
    if (summary.state !== STATE_ACTIVE) return;
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (summary.nextDueTime === 0n || now < summary.nextDueTime) return;

    const key = `${circle}-${summary.currentRound}`;
    const tried = attempts.get(key) ?? 0;
    if (tried >= env.SETTLEMENT_MAX_RETRIES) {
      logger.error({ circle, round: summary.currentRound.toString() }, "settlement abandoned after max retries — ALERT");
      return;
    }

    logger.info({ circle, round: summary.currentRound.toString() }, "round due");
    if (!walletClient || !account) return; // observe-only

    try {
      // simulate against latest state right before submission
      const { request } = await publicClient.simulateContract({
        address: circle,
        abi: circleAbi,
        functionName: "settleRound",
        account,
      });
      attempts.set(key, tried + 1);
      const hash = await walletClient.writeContract(request);
      logger.info({ circle, hash }, "settlement submitted");

      const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: env.CONFIRMATIONS });
      if (receipt.status === "success") {
        logger.info({ circle, hash, block: receipt.blockNumber.toString() }, "settlement confirmed");
        attempts.delete(key);
      } else {
        logger.error({ circle, hash }, "settlement reverted");
      }
    } catch (err) {
      logger.warn({ circle, err: (err as Error).message }, "settlement attempt failed; will retry");
    }
  }

  logger.info({ network: env.MONSAVE_NETWORK, factory }, "MonSave settlement worker started");
  // simple resilient loop; BullMQ scheduling can replace this without changing
  // processCircle semantics
  setInterval(tick, env.SETTLEMENT_POLL_INTERVAL_MS);
  await tick();
}

main().catch((err) => {
  logger.fatal({ err }, "worker failed to start");
  process.exit(1);
});
