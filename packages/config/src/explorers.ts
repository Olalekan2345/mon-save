/** Explorer link builders — always derived from the chain config. */
import { getChain, type SupportedChainId } from "./chains";

export function txUrl(chainId: SupportedChainId, hash: string): string {
  const chain = getChain(chainId);
  if (!chain) throw new Error(`Unsupported chain ${chainId}`);
  return `${chain.explorer.url}/tx/${hash}`;
}

export function addressUrl(chainId: SupportedChainId, address: string): string {
  const chain = getChain(chainId);
  if (!chain) throw new Error(`Unsupported chain ${chainId}`);
  return `${chain.explorer.url}/address/${address}`;
}

export function blockUrl(chainId: SupportedChainId, blockNumber: bigint | number): string {
  const chain = getChain(chainId);
  if (!chain) throw new Error(`Unsupported chain ${chainId}`);
  return `${chain.explorer.url}/block/${blockNumber}`;
}
