/**
 * Supported settlement assets per network.
 *
 * POLICY (see prompt sections 11 & 15, docs/MONAD_INTEGRATION_AUDIT.md):
 *  - Mainnet: only verified, non-rebasing, non-fee-on-transfer stablecoins that
 *    exist on Monad Mainnet AND are registered in the onchain
 *    SupportedAssetRegistry. Addresses must be confirmed against official Monad
 *    token sources, the Aave Address Book, and onchain bytecode at deploy time.
 *  - Testnet: only officially issued testnet tokens; clearly labeled valueless.
 *  - Addresses are NEVER guessed. Until verification is completed and recorded
 *    in the integration audit, the lists below stay empty and the app shows
 *    honest "no supported asset configured" states.
 */
import { MONAD_MAINNET_ID, MONAD_TESTNET_ID, LOCAL_ANVIL_ID, type SupportedChainId } from "./chains";

export interface SettlementToken {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  /** whether the Aave V3 Monad market supports supplying this asset */
  yieldSupported: boolean;
  /** true only for testnet/local assets — drives the "no monetary value" label */
  isTestAsset: boolean;
}

export const SETTLEMENT_TOKENS: Record<SupportedChainId, SettlementToken[]> = {
  // Mainnet stays empty until multi-source verification is recorded in
  // docs/MONAD_INTEGRATION_AUDIT.md. Never guessed.
  [MONAD_MAINNET_ID]: [],
  // Testnet demo token deployed by this repo (deployments/monad-testnet/):
  // clearly labeled valueless, open capped mint, decimals verified onchain.
  [MONAD_TESTNET_ID]: [
    {
      address: "0xAB542a297D8192a1FEb25f2dbc054f3Cf4a832Bb",
      symbol: "tUSD",
      name: "MonSave Testnet USD (no monetary value)",
      decimals: 6,
      // Yield here comes from a LABELED SIMULATED test pool, not a real market.
      // See simulatedYield below and docs/MONAD_INTEGRATION_AUDIT.md.
      yieldSupported: true,
      isTestAsset: true,
    },
  ],
  // Local list is populated at runtime from the local deployment manifest.
  [LOCAL_ANVIL_ID]: [],
};

/**
 * Simulated ("test") yield sources per network. Its presence marks a network's
 * yield as a LABELED DEMONSTRATION, not a real market — the UI must say so and
 * never present the rate as a real APY.
 *  - Testnet: a MonSave TestYieldPool (fixed demo rate, reserve-funded) so the
 *    full yield lifecycle can be exercised on valueless testnet tokens.
 *  - Mainnet: none — real yield comes from the verified Aave V3 market.
 */
export interface SimulatedYield {
  pool: `0x${string}`;
  aToken: `0x${string}`;
  fixedApyBps: number;
}

export const SIMULATED_YIELD: Partial<Record<SupportedChainId, SimulatedYield>> = {
  [MONAD_TESTNET_ID]: {
    pool: "0x77b565e33CB681893EA21F36454428B5690CcA6A",
    aToken: "0x097FdbE4f9b8A307c04dCe58999161D84bB5afD3",
    fixedApyBps: 800, // 8% fixed DEMO rate — not a market rate
  },
};

export function getSimulatedYield(chainId: SupportedChainId): SimulatedYield | undefined {
  return SIMULATED_YIELD[chainId];
}

export function getTokens(chainId: SupportedChainId): SettlementToken[] {
  return SETTLEMENT_TOKENS[chainId];
}

export function findToken(chainId: SupportedChainId, address: string): SettlementToken | undefined {
  return SETTLEMENT_TOKENS[chainId].find((t) => t.address.toLowerCase() === address.toLowerCase());
}
