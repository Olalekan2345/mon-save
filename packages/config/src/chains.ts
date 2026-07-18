/**
 * Single source of truth for Monad network parameters.
 * Never scatter chain IDs, RPC URLs or explorer URLs anywhere else.
 *
 * Values verified against https://docs.monad.xyz at build time —
 * see docs/MONAD_INTEGRATION_AUDIT.md for the verification record.
 */

export const MONAD_MAINNET_ID = 143 as const;
export const MONAD_TESTNET_ID = 10143 as const;
export const LOCAL_ANVIL_ID = 31337 as const;

export type SupportedChainId =
  | typeof MONAD_MAINNET_ID
  | typeof MONAD_TESTNET_ID
  | typeof LOCAL_ANVIL_ID;

export interface MonSaveChain {
  id: SupportedChainId;
  name: string;
  network: "monad-mainnet" | "monad-testnet" | "local";
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: { primary: string; fallback?: string; ws?: string };
  explorer: { name: string; url: string };
  faucet?: string;
  /** confirmations before an action is treated as final in the UI/indexer */
  confirmations: number;
  testnet: boolean;
}

export const monadMainnet: MonSaveChain = {
  id: MONAD_MAINNET_ID,
  name: "Monad",
  network: "monad-mainnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { primary: "https://rpc.monad.xyz" },
  explorer: { name: "MonadScan", url: "https://monadscan.com" },
  confirmations: 2,
  testnet: false,
};

export const monadTestnet: MonSaveChain = {
  id: MONAD_TESTNET_ID,
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { primary: "https://testnet-rpc.monad.xyz" },
  explorer: { name: "MonadScan Testnet", url: "https://testnet.monadscan.com" },
  faucet: "https://faucet.monad.xyz",
  confirmations: 2,
  testnet: true,
};

export const localAnvil: MonSaveChain = {
  id: LOCAL_ANVIL_ID,
  name: "Local Anvil",
  network: "local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { primary: "http://127.0.0.1:8545" },
  explorer: { name: "Local", url: "http://127.0.0.1:8545" },
  confirmations: 1,
  testnet: true,
};

export const CHAINS: Record<SupportedChainId, MonSaveChain> = {
  [MONAD_MAINNET_ID]: monadMainnet,
  [MONAD_TESTNET_ID]: monadTestnet,
  [LOCAL_ANVIL_ID]: localAnvil,
};

export function getChain(chainId: number): MonSaveChain | undefined {
  return CHAINS[chainId as SupportedChainId];
}

export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return chainId in CHAINS;
}

/**
 * Guard against silent cross-network data mixing: a UI or service configured
 * for one network must never render data from another.
 */
export function assertChainMatch(expected: SupportedChainId, actual: number): void {
  if (expected !== actual) {
    throw new Error(
      `Chain mismatch: app is configured for ${CHAINS[expected].name} (${expected}) but the connected chain is ${actual}. Refusing to mix networks.`,
    );
  }
}
