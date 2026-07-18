/**
 * Deployed MonSave contract addresses per network.
 *
 * These are populated from deployment manifests in /deployments — never
 * hand-typed. Empty (null) means "not deployed on this network yet"; every
 * consumer must handle that state honestly (show "not available", never
 * fabricate).
 */
import { MONAD_MAINNET_ID, MONAD_TESTNET_ID, LOCAL_ANVIL_ID, type SupportedChainId } from "./chains";

export interface ProtocolAddresses {
  circleFactory: `0x${string}` | null;
  protocolConfig: `0x${string}` | null;
  supportedAssetRegistry: `0x${string}` | null;
  protocolTreasury: `0x${string}` | null;
}

const EMPTY: ProtocolAddresses = {
  circleFactory: null,
  protocolConfig: null,
  supportedAssetRegistry: null,
  protocolTreasury: null,
};

/**
 * Addresses are injected at build/deploy time from the deployment manifest via
 * environment (validated in environment.ts) or by updating this map from
 * deployments/<network>/manifest.json. They start null by design: MonSave has
 * not been deployed to a public Monad network from this repository yet.
 */
export const PROTOCOL_ADDRESSES: Record<SupportedChainId, ProtocolAddresses> = {
  [MONAD_MAINNET_ID]: { ...EMPTY },
  // From deployments/monad-testnet/manifest.json (deployed 2026-07-18, block 45937509)
  [MONAD_TESTNET_ID]: {
    circleFactory: "0x35AdCdbFf4AdabF01DFCC698D62F9aA64a8c41E3",
    protocolConfig: "0x429E07d063580045e949d3cD55432FD76ee35E05",
    supportedAssetRegistry: "0x5c115d764F36BDB93ce5626F21C96c8F6980BDB7",
    protocolTreasury: "0x5D9a58670aA21b39506916009f310F91C3F25388",
  },
  [LOCAL_ANVIL_ID]: { ...EMPTY },
};

export function getProtocolAddresses(chainId: SupportedChainId): ProtocolAddresses {
  return PROTOCOL_ADDRESSES[chainId];
}

export function isDeployedOn(chainId: SupportedChainId): boolean {
  return PROTOCOL_ADDRESSES[chainId].circleFactory !== null;
}
