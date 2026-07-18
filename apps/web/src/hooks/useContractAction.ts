"use client";

import { useCallback, useState } from "react";
import { usePublicClient, useWalletClient, useAccount } from "wagmi";
import type { Abi } from "viem";
import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from "viem";
import { activeChain } from "@/lib/chains";
import type { TxPhase } from "@/components/TxStatus";

interface ActionArgs {
  address: `0x${string}`;
  abi: Abi | readonly unknown[];
  functionName: string;
  args?: readonly unknown[];
}

/**
 * Full write lifecycle, honestly reported:
 * validate → confirm account+chain → simulate (viem) → request signature →
 * broadcast → wait for configured confirmations → refetch.
 * Success is only shown after onchain confirmation — never on click, never on
 * hash alone.
 */
export function useContractAction(onConfirmed?: () => void) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address: account, chainId } = useAccount();

  const [phase, setPhase] = useState<TxPhase>("idle");
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | undefined>();

  const execute = useCallback(
    async ({ address, abi, functionName, args = [] }: ActionArgs) => {
      setError(undefined);
      setHash(undefined);

      if (!publicClient || !walletClient || !account) {
        setPhase("failed");
        setError("Connect your wallet first.");
        return false;
      }
      if (chainId !== activeChain.id) {
        setPhase("failed");
        setError(`Wrong network — switch your wallet to ${activeChain.name}.`);
        return false;
      }

      try {
        setPhase("preparing");
        // Simulate against latest state; surfaces reverts before signing.
        const { request } = await publicClient.simulateContract({
          address,
          abi: abi as Abi,
          functionName,
          args: args as unknown[],
          account,
        });

        setPhase("awaiting-signature");
        const txHash = await walletClient.writeContract(request);
        setHash(txHash);
        setPhase("pending");

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 2,
        });

        if (receipt.status === "reverted") {
          setPhase("reverted");
          setError("The transaction was included but reverted. No state was changed.");
          return false;
        }

        setPhase("confirmed");
        onConfirmed?.();
        return true;
      } catch (err) {
        if (err instanceof UserRejectedRequestError || (err instanceof BaseError && err.walk((e) => e instanceof UserRejectedRequestError))) {
          setPhase("rejected");
          setError(undefined);
          return false;
        }
        if (err instanceof BaseError) {
          const revert = err.walk((e) => e instanceof ContractFunctionRevertedError);
          setPhase("failed");
          setError(
            revert instanceof ContractFunctionRevertedError
              ? `Simulation reverted: ${revert.data?.errorName ?? revert.shortMessage}`
              : err.shortMessage,
          );
          return false;
        }
        setPhase("failed");
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      }
    },
    [publicClient, walletClient, account, chainId, onConfirmed],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setHash(undefined);
    setError(undefined);
  }, []);

  return { execute, phase, hash, error, reset, isBusy: phase === "preparing" || phase === "awaiting-signature" || phase === "pending" };
}
