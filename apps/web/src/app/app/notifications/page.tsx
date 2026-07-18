"use client";

import { useAccount } from "wagmi";
import { EmptyState } from "@/components/EmptyState";

/**
 * Notifications come from the MonSave API for signed-in users. No counts or
 * items are ever fabricated — until the API is configured for this deployment
 * and real notification records exist, this page says so honestly.
 */
export default function NotificationsPage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <EmptyState title="Connect your wallet" body="Notifications are tied to your wallet account." />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <EmptyState
        title="No notifications"
        body="Payout reminders, funding requests and circle updates will appear here once the MonSave API is configured for this deployment. Nothing is shown until real notification records exist."
      />
    </div>
  );
}
