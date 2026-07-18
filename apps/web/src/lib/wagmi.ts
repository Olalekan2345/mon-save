"use client";

import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { defineChain as defineAppKitChain } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { activeChain } from "./chains";

/**
 * Reown AppKit + wagmi wallet layer.
 * Exactly ONE network per deployment — Mainnet data is never shown against a
 * Testnet wallet or vice versa; the UI blocks with a network-switch prompt.
 */
export const reownProjectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";

export const appKitNetwork: AppKitNetwork = defineAppKitChain({
  id: activeChain.id,
  caipNetworkId: `eip155:${activeChain.id}`,
  chainNamespace: "eip155",
  name: activeChain.name,
  nativeCurrency: activeChain.nativeCurrency,
  rpcUrls: activeChain.rpcUrls,
  blockExplorers: activeChain.blockExplorers,
  testnet: activeChain.testnet,
});

export const wagmiAdapter = new WagmiAdapter({
  networks: [appKitNetwork],
  projectId: reownProjectId || "monsave-dev-placeholder",
  ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

let initialized = false;

export function initAppKit(): boolean {
  if (initialized) return true;
  if (!reownProjectId) {
    // Honest degradation: without a Reown project id there is no wallet layer.
    // The UI shows "wallet connection unavailable" — it never fakes a wallet.
    return false;
  }
  createAppKit({
    adapters: [wagmiAdapter],
    networks: [appKitNetwork],
    projectId: reownProjectId,
    metadata: {
      name: "MonSave",
      description: "Ajo, onchain — the trustless savings circle that earns while it waits.",
      url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      icons: [],
    },
    features: {
      analytics: false,
      email: false,
      socials: false,
    },
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#8265EE",
    },
  });
  initialized = true;
  return true;
}

// Initialize at module scope (Reown's documented pattern): useAppKit() must
// find an existing modal instance during both prerender and hydration.
// Safe to call again from Providers' useEffect — initAppKit is idempotent.
initAppKit();
