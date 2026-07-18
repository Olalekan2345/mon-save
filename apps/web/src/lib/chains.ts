import { defineChain, type Chain } from "viem";
import {
  monadMainnet as cfgMainnet,
  monadTestnet as cfgTestnet,
  localAnvil as cfgLocal,
  type MonSaveChain,
} from "@monsave/config";

function toViemChain(c: MonSaveChain): Chain {
  return defineChain({
    id: c.id,
    name: c.name,
    nativeCurrency: c.nativeCurrency,
    rpcUrls: {
      default: {
        http: [c.rpcUrls.primary, ...(c.rpcUrls.fallback ? [c.rpcUrls.fallback] : [])],
        ...(c.rpcUrls.ws ? { webSocket: [c.rpcUrls.ws] } : {}),
      },
    },
    blockExplorers: {
      default: { name: c.explorer.name, url: c.explorer.url },
    },
    testnet: c.testnet,
  });
}

export const monadMainnet = toViemChain(cfgMainnet);
export const monadTestnet = toViemChain(cfgTestnet);
export const localAnvil = toViemChain(cfgLocal);

const NETWORK = process.env.NEXT_PUBLIC_MONSAVE_NETWORK ?? "monad-testnet";

/** The single active chain for this deployment. Never silently mixed. */
export const activeChain: Chain =
  NETWORK === "monad-mainnet" ? monadMainnet : NETWORK === "local" ? localAnvil : monadTestnet;

export const activeNetworkName = NETWORK;
export const isTestnetDeployment = activeChain.testnet === true;
