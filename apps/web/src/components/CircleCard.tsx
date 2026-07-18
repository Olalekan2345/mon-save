"use client";

import Link from "next/link";
import { addressUrl, type SupportedChainId } from "@monsave/config";
import { activeChain } from "@/lib/chains";
import { CIRCLE_STATES } from "@/lib/abis";
import { formatToken, formatDate, shortAddress } from "@/lib/format";

interface Summary {
  state: number;
  currentRound: bigint;
  totalRounds: bigint;
  memberCount: bigint;
  contributionPerRound: bigint;
  roundPot: bigint;
  memberCommitment: bigint;
  totalPrincipalFunded: bigint;
  totalPrincipalPaid: bigint;
  totalYieldAllocated: bigint;
  nextDueTime: bigint;
  nextRecipient: `0x${string}`;
  adapter: `0x${string}`;
}

const STATE_TONES: Record<string, string> = {
  Draft: "bg-white/10 text-ink-dim",
  "Awaiting approvals": "bg-info/15 text-info",
  Funding: "bg-caution/15 text-caution",
  Active: "bg-positive/15 text-positive",
  Completed: "bg-violet-500/15 text-violet-300",
  Cancelled: "bg-white/10 text-ink-faint",
  Emergency: "bg-critical/15 text-critical",
};

export function CircleCard({ address, summary }: { address: `0x${string}`; summary?: Summary }) {
  if (!summary) {
    return (
      <div className="card p-5">
        <p className="font-mono text-xs text-ink-faint">{shortAddress(address)}</p>
        <p className="mt-2 text-sm text-ink-dim">Could not load this circle from the blockchain right now.</p>
      </div>
    );
  }

  const stateName = CIRCLE_STATES[summary.state] ?? "Unknown";

  return (
    <Link
      href={`/app/circles/${address}`}
      className="card block p-5 transition-all duration-200 ease-swift hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-ink-faint">{shortAddress(address)}</p>
          <p className="mt-1 text-sm font-semibold">
            Round {String(summary.currentRound)} of {String(summary.totalRounds)}
          </p>
        </div>
        <span className={`rounded-pill px-3 py-1 text-xs font-medium ${STATE_TONES[stateName] ?? "bg-white/10"}`}>
          {stateName}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Field label="Contribution / round" value={formatToken(summary.contributionPerRound, 6)} />
        <Field label="Round pot" value={formatToken(summary.roundPot, 6)} />
        <Field label="Members" value={String(summary.memberCount)} />
        <Field
          label="Next payout"
          value={summary.nextDueTime > 0n ? formatDate(summary.nextDueTime) : "—"}
        />
        {summary.nextRecipient !== "0x0000000000000000000000000000000000000000" && (
          <Field label="Next collector" value={shortAddress(summary.nextRecipient)} mono />
        )}
        <Field
          label="Yield allocated"
          value={summary.totalYieldAllocated > 0n ? formatToken(summary.totalYieldAllocated, 6) : "None recorded"}
        />
      </dl>
      <p className="mt-4 text-right">
        <span
          className="text-xs text-violet-400 underline-offset-2 hover:underline"
          onClick={(e) => {
            e.preventDefault();
            window.open(addressUrl(activeChain.id as SupportedChainId, address), "_blank", "noopener");
          }}
          role="link"
          tabIndex={0}
        >
          View on {activeChain.blockExplorers?.default.name} ↗
        </span>
      </p>
    </Link>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-ink-faint">{label}</dt>
      <dd className={`mt-0.5 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
