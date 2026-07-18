"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { activeChain } from "@/lib/chains";

/**
 * Blocks app content when the connected wallet is on the wrong network.
 * MonSave never shows Mainnet data against a Testnet wallet or vice versa.
 */
export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (isConnected && chainId !== activeChain.id) {
    return (
      <div className="card mx-auto mt-16 max-w-md p-8 text-center">
        <h2 className="text-lg font-semibold">Wrong network</h2>
        <p className="mt-2 text-sm text-ink-dim">
          This app is configured for <strong>{activeChain.name}</strong> (chain {activeChain.id}), but your wallet is
          connected to chain {chainId}. To protect you, MonSave never mixes data between networks.
        </p>
        <button
          className="btn-primary mt-6"
          disabled={isPending}
          onClick={() => switchChain({ chainId: activeChain.id })}
        >
          {isPending ? "Requesting switch…" : `Switch to ${activeChain.name}`}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

export function NetworkBadge() {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-xs font-medium ${
        activeChain.testnet
          ? "border-caution/40 text-caution"
          : "border-positive/40 text-positive"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {activeChain.name}
      {activeChain.testnet && " — assets have no monetary value"}
    </span>
  );
}
