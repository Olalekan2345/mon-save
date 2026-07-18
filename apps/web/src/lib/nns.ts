import { normalize } from "viem/ens";
import type { PublicClient } from "viem";
import { getNnsConfig, looksLikeName, type SupportedChainId } from "@monsave/config";
import { activeChain } from "./chains";

export { looksLikeName };

/**
 * Resolve a Nad Name Service name (e.g. "tolu.nad") to an address on the active
 * network. Returns null when NNS isn't configured for this network (honest
 * degrade) or the name doesn't resolve. Never guesses — the resolver address
 * comes from verified config only.
 *
 * The resolved ADDRESS is what gets stored in the circle; the name is a display
 * label only, because a .nad name can be transferred to another owner.
 */
export async function resolveNadName(
  publicClient: PublicClient,
  name: string,
): Promise<`0x${string}` | null> {
  const cfg = getNnsConfig(activeChain.id as SupportedChainId);
  if (!cfg.universalResolver) return null;
  try {
    const address = await publicClient.getEnsAddress({
      name: normalize(name.trim()),
      universalResolverAddress: cfg.universalResolver,
    });
    if (!address || address === "0x0000000000000000000000000000000000000000") return null;
    return address;
  } catch {
    return null;
  }
}

/** Whether name resolution is available on the current network. */
export function isNameResolutionAvailable(): boolean {
  return getNnsConfig(activeChain.id as SupportedChainId).universalResolver !== null;
}
