"use client";

import { use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { isAddress } from "viem";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EmptyState } from "@/components/EmptyState";
import { SavingsCircleOrbit } from "@/components/illustrations";
import { useCircleSummary, useCircleMember } from "@/hooks/useCircles";
import { CIRCLE_STATES } from "@/lib/abis";
import { formatToken, shortAddress } from "@/lib/format";
import { addressUrl, type SupportedChainId } from "@monsave/config";
import { activeChain } from "@/lib/chains";
import { reownProjectId } from "@/lib/wagmi";

/**
 * Per-member invite landing. The link carries the circle address (path) and the
 * intended member address (?to=). This page is UX only — the SavingsCircle
 * contract is the real gate: only wallets in the circle's locked member list
 * can ever approve or fund, so a shared or leaked link grants nothing.
 */
export default function InvitePage({ params }: { params: Promise<{ circle: string }> }) {
  const { circle } = use(params);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-16">
        <Suspense fallback={<div className="card h-64 animate-pulse" aria-busy="true" />}>
          {isAddress(circle) ? (
            <InviteBody circle={circle as `0x${string}`} />
          ) : (
            <EmptyState title="This invite link is invalid" body="The circle address in the link is not a valid contract address." />
          )}
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

function InviteBody({ circle }: { circle: `0x${string}` }) {
  const searchParams = useSearchParams();
  const toParam = searchParams.get("to") ?? "";
  const to = isAddress(toParam) ? (toParam as `0x${string}`) : undefined;

  const { address: connected, isConnected } = useAccount();
  const summaryQ = useCircleSummary(circle);
  const invitedMemberQ = useCircleMember(circle, to);

  if (!to) {
    return (
      <EmptyState
        title="This invite link is incomplete"
        body="It doesn't specify which wallet it's for. Ask your circle organizer to resend your personal invite link."
      />
    );
  }

  if (summaryQ.isLoading || invitedMemberQ.isLoading) {
    return <div className="card h-64 animate-pulse" aria-busy="true" aria-label="Loading invite" />;
  }

  const summary = summaryQ.data;
  const invited = invitedMemberQ.data;

  if (!summary) {
    return (
      <EmptyState
        title="Circle not found on this network"
        body={`This link points to a circle that didn't respond on ${activeChain.name}. Check you're on the right network.`}
      />
    );
  }

  // The invited address must actually be a member of this circle onchain.
  if (!invited?.isMember) {
    return (
      <EmptyState
        title="This invite doesn't match the circle"
        body={`The wallet ${shortAddress(to)} is not a member of this circle. Invite links only work for wallets that were added when the circle was created.`}
        action={
          <a
            href={addressUrl(activeChain.id as SupportedChainId, circle)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mt-2"
          >
            Inspect the circle on {activeChain.blockExplorers?.default.name}
          </a>
        }
      />
    );
  }

  const stateName = CIRCLE_STATES[summary.state] ?? "Unknown";
  const matched = isConnected && connected?.toLowerCase() === to.toLowerCase();

  const nextAction =
    stateName === "Awaiting approvals" && !invited.approved
      ? { text: "Your next step is to approve the circle rules onchain.", tab: "" }
      : stateName === "Funding" && !invited.funded
        ? { text: "Your next step is to fund your commitment.", tab: "?tab=funding" }
        : stateName === "Active"
          ? { text: "The circle is active. Open it to track rounds and payouts.", tab: "" }
          : { text: "Open the circle to see what's next.", tab: "" };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <SavingsCircleOrbit size={240} members={Number(summary.memberCount)} className="mx-auto" label={`${summary.memberCount} members`} />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-lavender">You&apos;re invited</p>
        <h1 className="mt-2 text-3xl font-bold">Join this savings circle</h1>
        <p className="mt-2 text-sm text-ink-dim">
          You were added as position #{invited.position + 1} of {String(summary.memberCount)}. Your invite is for wallet{" "}
          <span className="font-mono text-ink">{shortAddress(to)}</span>.
        </p>
      </div>

      {/* circle facts (real, from the contract) */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact label="Contribution / round" value={formatToken(summary.contributionPerRound, 6)} />
        <Fact label="Your commitment" value={formatToken(summary.memberCommitment, 6)} />
        <Fact label="Members" value={String(summary.memberCount)} />
        <Fact label="Status" value={stateName} />
      </dl>

      {/* wallet gate */}
      <div className="card p-6">
        {!isConnected ? (
          <ConnectPrompt to={to} />
        ) : matched ? (
          <div className="text-center">
            <p className="text-sm font-semibold text-mint">Wallet matched ✓</p>
            <p className="mt-1 text-sm text-ink-dim">{nextAction.text}</p>
            <Link href={`/app/circles/${circle}${nextAction.tab}`} className="btn-primary mt-5">
              Continue to your circle
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-semibold text-caution">This invite is for a different wallet</p>
            <p className="mt-1 text-sm text-ink-dim">
              You&apos;re connected as <span className="font-mono">{connected && shortAddress(connected)}</span>, but this
              invite is for <span className="font-mono text-ink">{shortAddress(to)}</span>. Switch to that wallet to
              continue — the contract only lets the invited wallet act.
            </p>
            <SwitchWalletButton />
          </div>
        )}
      </div>

      <p className="text-center text-xs text-ink-faint">
        Invite links are a convenience. The circle&apos;s smart contract is the real gate: only wallets added when the
        circle was created can approve or fund, so this link can never let the wrong person in.
      </p>
    </div>
  );
}

function ConnectPrompt({ to }: { to: `0x${string}` }) {
  const { open } = useAppKit();
  if (!reownProjectId) {
    return (
      <p className="text-center text-sm text-caution">
        Wallet connection isn&apos;t configured on this deployment. Connect the wallet {shortAddress(to)} once it&apos;s
        available.
      </p>
    );
  }
  return (
    <div className="text-center">
      <p className="text-sm text-ink-dim">
        Connect wallet <span className="font-mono text-ink">{shortAddress(to)}</span> to continue.
      </p>
      <button onClick={() => open()} className="btn-primary mt-4">
        Connect wallet
      </button>
    </div>
  );
}

function SwitchWalletButton() {
  const { open } = useAppKit();
  if (!reownProjectId) return null;
  return (
    <button onClick={() => open({ view: "Account" })} className="btn-secondary mt-5">
      Switch wallet
    </button>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-[11px] uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="num mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
