"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { SiteHeader } from "@/components/SiteHeader";
import { EmptyState } from "@/components/EmptyState";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Operations dashboard. Access is enforced by the API: a valid wallet session
 * AND an AdminUser row are required — this page holds no secrets and no
 * privileged capabilities of its own (there are none to hold: no API endpoint
 * can move funds or alter onchain state).
 */
export default function AdminPage() {
  const { isConnected } = useAccount();

  const overview = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const res = await fetch(`${API}/v1/admin/overview`, { credentials: "include" });
      if (res.status === 403 || res.status === 401) throw new Error("forbidden");
      if (!res.ok) throw new Error("unavailable");
      return res.json() as Promise<{
        circles: number;
        indexedEvents: number;
        failedSettlementJobs: number;
        openRiskFlags: number;
      }>;
    },
    enabled: isConnected && Boolean(API),
    retry: false,
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold">Protocol operations</h1>

        {!isConnected && (
          <div className="mt-8">
            <EmptyState title="Connect an admin wallet" body="Admin access requires wallet sign-in plus an operator role on the API." />
          </div>
        )}

        {isConnected && overview.isError && (
          <div className="mt-8">
            <EmptyState
              title={overview.error.message === "forbidden" ? "Not authorized" : "Operations API unavailable"}
              body={
                overview.error.message === "forbidden"
                  ? "This wallet does not have an operator role. Access is role-based — there is no hidden URL that bypasses it."
                  : "The MonSave API is not reachable from this deployment. Configure NEXT_PUBLIC_API_URL and sign in."
              }
            />
          </div>
        )}

        {overview.data && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Circles indexed" value={overview.data.circles} />
            <Metric label="Events indexed" value={overview.data.indexedEvents} />
            <Metric label="Failed settlement jobs" value={overview.data.failedSettlementJobs} critical={overview.data.failedSettlementJobs > 0} />
            <Metric label="Open risk flags" value={overview.data.openRiskFlags} critical={overview.data.openRiskFlags > 0} />
          </div>
        )}
      </main>
    </>
  );
}

function Metric({ label, value, critical }: { label: string; value: number; critical?: boolean }) {
  return (
    <div className={`card p-5 ${critical ? "border-critical/40" : ""}`}>
      <p className="text-xs uppercase tracking-wider text-ink-faint">{label}</p>
      <p className={`mt-1.5 font-mono text-2xl font-semibold ${critical ? "text-critical" : ""}`}>{value}</p>
    </div>
  );
}
