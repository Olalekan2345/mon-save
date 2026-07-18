"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useMyCircles, useCircleSummaries } from "@/hooks/useCircles";
import { isProtocolDeployed } from "@/lib/addresses";
import { EmptyState } from "@/components/EmptyState";
import { CircleCard } from "@/components/CircleCard";

export default function CirclesPage() {
  const { isConnected } = useAccount();
  const { data: circleAddresses, isLoading } = useMyCircles();
  const summaries = useCircleSummaries(circleAddresses as readonly `0x${string}`[] | undefined);

  if (!isConnected) {
    return <EmptyState title="Connect your wallet" body="Your circles are read directly from the Monad blockchain." />;
  }
  if (!isProtocolDeployed) {
    return (
      <EmptyState
        title="MonSave is not deployed on this network yet"
        body="Once the factory contract is deployed and configured, your circles will appear here."
      />
    );
  }
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  const addresses = (circleAddresses ?? []) as readonly `0x${string}`[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My circles</h1>
        <Link href="/app/circles/new" className="btn-primary">
          Create circle
        </Link>
      </div>
      {addresses.length === 0 ? (
        <EmptyState
          title="You have not created or joined a circle yet"
          body="When an organizer adds your wallet address to a circle, it appears here automatically."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address, i) => {
            const r = summaries.data?.[i];
            return <CircleCard key={address} address={address} summary={r?.status === "success" ? r.result : undefined} />;
          })}
        </div>
      )}
    </div>
  );
}
