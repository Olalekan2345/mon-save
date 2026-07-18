"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { shortAddress } from "@/lib/format";
import { reownProjectId } from "@/lib/wagmi";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (!reownProjectId) {
    return (
      <span className="rounded-pill border border-caution/40 px-4 py-2 text-xs text-caution">
        Wallet connection unavailable — NEXT_PUBLIC_REOWN_PROJECT_ID is not configured
      </span>
    );
  }

  return <ConnectedWalletButton address={address} isConnected={isConnected} onDisconnect={() => disconnect()} />;
}

function ConnectedWalletButton({
  address,
  isConnected,
  onDisconnect,
}: {
  address?: `0x${string}`;
  isConnected: boolean;
  onDisconnect: () => void;
}) {
  const { open } = useAppKit();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => open({ view: "Account" })}
          className="btn-secondary font-mono text-xs"
          aria-label={`Wallet ${address} — open account`}
        >
          {shortAddress(address)}
        </button>
        <button onClick={onDisconnect} className="text-xs text-ink-faint hover:text-ink" aria-label="Disconnect wallet">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => open()} className="btn-primary">
      Connect wallet
    </button>
  );
}
