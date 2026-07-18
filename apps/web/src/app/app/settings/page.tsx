"use client";

import { useAccount } from "wagmi";
import { EmptyState } from "@/components/EmptyState";
import { NetworkBadge } from "@/components/NetworkGuard";
import { activeChain } from "@/lib/chains";

export default function SettingsPage() {
  const { address, isConnected, connector } = useAccount();

  if (!isConnected) {
    return <EmptyState title="Connect your wallet" body="Settings are tied to your connected wallet." />;
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Profile &amp; settings</h1>

      <section className="card space-y-4 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">Wallet</h2>
        <div>
          <p className="label">Connected address</p>
          <p className="break-all font-mono text-sm">{address}</p>
        </div>
        <div>
          <p className="label">Connector</p>
          <p className="text-sm">{connector?.name ?? "Unknown"}</p>
        </div>
        <div>
          <p className="label">Network</p>
          <NetworkBadge />
        </div>
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">Notifications</h2>
        <p className="text-sm text-ink-dim">
          Email and push notifications (payout reminders, funding requests, circle updates) are managed by the MonSave
          backend and require signing in with your wallet. Notification preferences will appear here once the API is
          configured for this deployment.
        </p>
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">Non-custodial by design</h2>
        <p className="text-sm leading-relaxed text-ink-dim">
          MonSave never holds your keys and never has access to your principal. Funds move from your wallet directly
          into your circle&apos;s own contract on {activeChain.name}. Disconnecting your wallet here never affects your
          funds onchain.
        </p>
      </section>
    </div>
  );
}
