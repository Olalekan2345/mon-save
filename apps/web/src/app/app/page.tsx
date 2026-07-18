"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useMyCircles, useCircleSummaries } from "@/hooks/useCircles";
import { isProtocolDeployed } from "@/lib/addresses";
import { EmptyState } from "@/components/EmptyState";
import { CircleCard } from "@/components/CircleCard";
import { formatToken } from "@/lib/format";
import { CIRCLE_STATES } from "@/lib/abis";

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const { data: circleAddresses, isLoading } = useMyCircles();
  const summaries = useCircleSummaries(circleAddresses as readonly `0x${string}`[] | undefined);

  if (!isConnected) {
    return (
      <EmptyState
        title="Connect your wallet to view your dashboard"
        body="MonSave reads everything directly from the Monad blockchain. Nothing is shown until your wallet is connected — there is no sample data here."
      />
    );
  }

  if (!isProtocolDeployed) {
    return (
      <EmptyState
        title="MonSave is not deployed on this network yet"
        body="The circle factory address has not been configured for this deployment. Once contracts are deployed and verified, this dashboard will show live onchain data."
      />
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const addresses = (circleAddresses ?? []) as readonly `0x${string}`[];

  if (addresses.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <EmptyState
          title="You have not created or joined a circle yet"
          body="Start a Secure Circle with people you save with, or ask an organizer to add your wallet address to theirs."
          action={
            <Link href="/app/circles/new" className="btn-primary mt-2">
              Create your first circle
            </Link>
          }
        />
      </div>
    );
  }

  // aggregate real onchain values only
  let totalCommitted = 0n;
  let totalPaid = 0n;
  let totalYieldAllocated = 0n;
  let activeCount = 0;
  const rows = addresses.map((address, i) => {
    const result = summaries.data?.[i];
    const summary = result?.status === "success" ? result.result : undefined;
    if (summary) {
      totalCommitted += summary.totalPrincipalFunded;
      totalPaid += summary.totalPrincipalPaid;
      totalYieldAllocated += summary.totalYieldAllocated;
      if (CIRCLE_STATES[summary.state] === "Active") activeCount++;
    }
    return { address, summary };
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Decimals vary by circle token; per-card values are precise. These
            aggregates only render when all circles share one token. */}
        <Stat label="Active circles" value={String(activeCount)} />
        <Stat label="Circles total" value={String(addresses.length)} />
        <Stat label="Principal escrowed (all circles)" value={formatToken(totalCommitted, 6)} hint="base units assume 6-decimals; open a circle for exact figures" />
        <Stat label="Yield allocated (all circles)" value={formatToken(totalYieldAllocated, 6)} hint={totalYieldAllocated === 0n ? "No yield has been recorded" : undefined} />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your circles</h2>
          <Link href="/app/circles/new" className="btn-secondary">
            New circle
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map(({ address, summary }) => (
            <CircleCard key={address} address={address} summary={summary} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="mt-1.5 font-mono text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-ink-faint">{hint}</p>}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-8 w-40 animate-pulse rounded bg-white/5" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-24 animate-pulse" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card h-48 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
