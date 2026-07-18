/**
 * Nad Name Service (NNS) — the naming service on Monad (.nad names).
 * NNS ships ENS-compatible adapter contracts, so viem's getEnsAddress /
 * getEnsName resolve .nad names when pointed at the Universal Resolver adapter.
 *
 * ADDRESS POLICY (docs/MONAD_INTEGRATION_AUDIT.md): only addresses verified to
 * contain bytecode on the target network are listed here.
 *  - Mainnet (143): verified onchain at build time — has bytecode. ✔
 *  - Testnet (10143): the addresses published in the NNS docs had NO bytecode
 *    on Monad Testnet when checked, so testnet resolution is intentionally
 *    disabled (null) and degrades honestly. A verified testnet address can be
 *    supplied via env (see resolver override) without a code change.
 *
 * Source: https://docs.nad.domains/developers/contracts/contract-addresses
 */
import { MONAD_MAINNET_ID, MONAD_TESTNET_ID, LOCAL_ANVIL_ID, type SupportedChainId } from "./chains";

export interface NnsConfig {
  /** ENS-compatible Universal Resolver adapter — pass to viem getEnsAddress. */
  universalResolver: `0x${string}` | null;
  tld: string;
}

export const NNS_CONFIG: Record<SupportedChainId, NnsConfig> = {
  // Verified onchain: 0x6ED8…DfC has ~8KB of bytecode on Monad Mainnet.
  [MONAD_MAINNET_ID]: {
    universalResolver: "0x6ED8Ca3E2fEF58A82fc69B4037062445a3a32DfC",
    tld: ".nad",
  },
  // Disabled until a testnet Universal Resolver address is verified onchain.
  [MONAD_TESTNET_ID]: {
    universalResolver: null,
    tld: ".nad",
  },
  [LOCAL_ANVIL_ID]: {
    universalResolver: null,
    tld: ".nad",
  },
};

export function getNnsConfig(chainId: SupportedChainId): NnsConfig {
  return NNS_CONFIG[chainId];
}

/** Whether a string looks like a name to resolve (not a 0x address). */
export function looksLikeName(input: string): boolean {
  const v = input.trim().toLowerCase();
  return v.includes(".") && !v.startsWith("0x");
}
