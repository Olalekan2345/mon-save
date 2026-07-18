"use client";

import { useAccount } from "wagmi";
import { EmptyState } from "@/components/EmptyState";

/**
 * Email/off-chain invitations are served by the API for signed-in users.
 * Onchain, membership is simply your wallet address being in a circle's locked
 * member list — those circles already appear under "My circles" automatically.
 */
export default function InvitationsPage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <EmptyState title="Connect your wallet" body="Invitations are tied to your wallet address." />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Invitations</h1>
      <EmptyState
        title="No pending invitations"
        body="When an organizer adds your wallet address to a circle, the circle appears directly under My circles — no acceptance step is needed onchain. Email invitations appear here once the MonSave API is configured for this deployment."
      />
    </div>
  );
}
