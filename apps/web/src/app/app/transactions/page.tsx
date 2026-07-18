"use client";

import { useAccount } from "wagmi";
import { EmptyState } from "@/components/EmptyState";
import { addressUrl, type SupportedChainId } from "@monsave/config";
import { activeChain } from "@/lib/chains";

/**
 * Transaction history comes from the indexer API once it is running against a
 * deployed factory. Until then this page is honest about having nothing: it
 * never shows placeholder rows.
 */
export default function TransactionsPage() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return <EmptyState title="Connect your wallet" body="Connect your wallet to view your transaction history." />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <EmptyState
        title="No transactions have been recorded"
        body="Confirmed circle events for your wallet will appear here once the MonSave indexer is running against a deployed factory on this network. In the meantime, every transaction is always visible on the public explorer."
        action={
          <a
            href={addressUrl(activeChain.id as SupportedChainId, address)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mt-2"
          >
            View your address on {activeChain.blockExplorers?.default.name}
          </a>
        }
      />
    </div>
  );
}
