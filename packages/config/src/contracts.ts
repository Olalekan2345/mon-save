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
  [MONAD_TESTNET_ID]: { ...EMPTY },
  [LOCAL_ANVIL_ID]: { ...EMPTY },
};

export function getProtocolAddresses(chainId: SupportedChainId): ProtocolAddresses {
  return PROTOCOL_ADDRESSES[chainId];
}

export function isDeployedOn(chainId: SupportedChainId): boolean {
  return PROTOCOL_ADDRESSES[chainId].circleFactory !== null;
}
