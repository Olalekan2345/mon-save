"use client";

import { use, useMemo, Suspense } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useSearchParams } from "next/navigation";
import { isAddress } from "viem";
import { savingsCircleAbi, erc20Abi, testTokenFaucetAbi, CIRCLE_STATES } from "@/lib/abis";
import { useCircleSummary, useCircleMember } from "@/hooks/useCircles";
import { useContractAction } from "@/hooks/useContractAction";
import { TxStatus } from "@/components/TxStatus";
import { EmptyState } from "@/components/EmptyState";
import { ContextTabs, OverflowActionMenu } from "@/components/ContextTabs";
import { CopyInviteButton } from "@/components/CopyInviteButton";
import { CIRCLE_TABS, type CircleTabId } from "@/navigation/config";
import { formatToken, formatDate, shortAddress, frequencyLabel } from "@/lib/format";
import { addressUrl, findToken, type SupportedChainId } from "@monsave/config";
import { activeChain } from "@/lib/chains";

export default function CirclePage({ params }: { params: Promise<{ address: string }> }) {
  const { address: raw } = use(params);

  if (!isAddress(raw)) {
    return <EmptyState title="Invalid circle address" body="The address in the URL is not a valid contract address." />;
  }
  return (
    <Suspense fallback={<div className="card h-64 animate-pulse" aria-busy="true" aria-label="Loading circle" />}>
      <CircleDetail circle={raw as `0x${string}`} />
    </Suspense>
  );
}

function CircleDetail({ circle }: { circle: `0x${string}` }) {
  const { address: account } = useAccount();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") ?? "overview") as CircleTabId;

  const summaryQ = useCircleSummary(circle);
  const memberQ = useCircleMember(circle, account);
  const orderQ = useReadContract({ address: circle, abi: savingsCircleAbi, functionName: "getPayoutOrder" });
  const tokenQ = useReadContract({ address: circle, abi: savingsCircleAbi, functionName: "token" });
  const organizerQ = useReadContract({ address: circle, abi: savingsCircleAbi, functionName: "organizer" });
  const frequencyQ = useReadContract({ address: circle, abi: savingsCircleAbi, functionName: "frequency" });
  const firstPayoutQ = useReadContract({ address: circle, abi: savingsCircleAbi, functionName: "firstPayoutTime" });
  const approvalCountQ = useReadContract({
    address: circle,
    abi: savingsCircleAbi,
    functionName: "approvalCount",
    query: { refetchInterval: 15_000 },
  });
  const fundedCountQ = useReadContract({
    address: circle,
    abi: savingsCircleAbi,
    functionName: "fundedCount",
    query: { refetchInterval: 15_000 },
  });

  const tokenAddr = tokenQ.data as `0x${string}` | undefined;
  const decimalsQ = useReadContract({
    address: tokenAddr,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: Boolean(tokenAddr) },
  });
  const symbolQ = useReadContract({
    address: tokenAddr,
    abi: erc20Abi,
    functionName: "symbol",
    query: { enabled: Boolean(tokenAddr) },
  });
  const allowanceQ = useReadContract({
    address: tokenAddr,
    abi: erc20Abi,
    functionName: "allowance",
    args: account && [account, circle],
    query: { enabled: Boolean(tokenAddr && account) },
  });
  const balanceQ = useReadContract({
    address: tokenAddr,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: account && [account],
    query: { enabled: Boolean(tokenAddr && account) },
  });

  const refetchAll = () => {
    void summaryQ.refetch();
    void memberQ.refetch();
    void allowanceQ.refetch();
    void balanceQ.refetch();
    void approvalCountQ.refetch();
    void fundedCountQ.refetch();
  };
  const action = useContractAction(refetchAll);

  const summary = summaryQ.data;
  const member = memberQ.data;
  const decimals = (decimalsQ.data as number | undefined) ?? 6;
  const symbol = (symbolQ.data as string | undefined) ?? "";
  const order = orderQ.data as readonly `0x${string}`[] | undefined;
  const frequency = frequencyQ.data as bigint | undefined;
  const firstPayout = firstPayoutQ.data as bigint | undefined;
  const approvalCount = approvalCountQ.data as bigint | undefined;
  const fundedCount = fundedCountQ.data as bigint | undefined;

  const stateName = summary ? (CIRCLE_STATES[summary.state] ?? "Unknown") : undefined;

  const dueNow = useMemo(() => {
    if (!summary || stateName !== "Active" || summary.nextDueTime === 0n) return false;
    return BigInt(Math.floor(Date.now() / 1000)) >= summary.nextDueTime;
  }, [summary, stateName]);

  if (summaryQ.isLoading) {
    return <div className="card h-64 animate-pulse" aria-busy="true" aria-label="Loading circle" />;
  }
  if (!summary) {
    return (
      <EmptyState
        title="Could not load this circle"
        body="The contract did not respond as a MonSave circle on this network. Check the address and network."
      />
    );
  }

  const isMember = member?.isMember ?? false;
  const isOrganizer = account === organizerQ.data;
  // Invite links matter before the circle is live (getting members in + funded).
  const invitesUseful = stateName === "Draft" || stateName === "Awaiting approvals" || stateName === "Funding";
  const balance = balanceQ.data as bigint | undefined;
  const hasEnough = balance !== undefined && balance >= summary.memberCommitment;
  // The labeled testnet demo token has an open faucet mint; real assets never do.
  const isFaucetToken = tokenAddr ? Boolean(findToken(activeChain.id as SupportedChainId, tokenAddr)?.isTestAsset) : false;
  const needsAllowance = typeof allowanceQ.data === "bigint" && summary.memberCommitment > (allowanceQ.data as bigint);
  const claimable = member ? member.yieldAllocated - member.yieldClaimed : 0n;

  const overflowActions = [
    { label: "View on explorer ↗", href: addressUrl(activeChain.id as SupportedChainId, circle) },
    { label: "Emergency information", href: "/how-it-works" },
    { label: "Report an issue", href: "/app/help" },
    ...(isOrganizer && (stateName === "Draft" || stateName === "Awaiting approvals" || stateName === "Funding")
      ? [
          {
            label: "Cancel circle",
            tone: "danger" as const,
            onSelect: () => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "cancel" }),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* 1. title + status */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Savings circle</h1>
            <span className="rounded-pill bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300">{stateName}</span>
          </div>
          <a
            href={addressUrl(activeChain.id as SupportedChainId, circle)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block truncate font-mono text-xs text-violet-400 underline-offset-2 hover:underline"
          >
            {circle} ↗
          </a>
        </div>
        <OverflowActionMenu actions={overflowActions} label="Circle actions" />
      </header>

      {stateName === "Emergency" && (
        <div className="rounded-lg border border-critical/40 bg-critical/10 p-4 text-sm text-critical" role="alert">
          <p className="font-semibold">This circle is in emergency mode.</p>
          <p className="mt-1 opacity-90">
            Recoverable assets fell below the remaining committed principal. Normal payouts are frozen. Every unpaid
            member can redeem an equal pro-rata share below. No administrator can prioritize anyone.
          </p>
        </div>
      )}

      {/* 2. key summary strip (always visible) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Circle summary">
        <Fig label="Round" value={`${summary.currentRound} / ${summary.totalRounds}`} />
        <Fig label="Round pot" value={formatToken(summary.roundPot, decimals, symbol)} />
        <Fig label="Next payout" value={summary.nextDueTime > 0n ? formatDate(summary.nextDueTime) : "—"} />
        <Fig
          label="Next collector"
          value={summary.nextRecipient !== "0x0000000000000000000000000000000000000000" ? shortAddress(summary.nextRecipient) : "—"}
        />
      </section>

      {/* 3. contextual navigation */}
      <ContextTabs tabs={CIRCLE_TABS} defaultTab="overview" layoutId={`circle-tabs-${circle}`} ariaLabel="Circle sections" />

      {/* 4. active section */}
      <div role="tabpanel" aria-label={CIRCLE_TABS.find((t) => t.id === tab)?.label}>
        {tab === "overview" && (
          <div className="space-y-6">
            {/* progress toward activation — shows during approvals & funding */}
            {(stateName === "Awaiting approvals" || stateName === "Funding" || stateName === "Draft") && (
              <ActivationProgress
                stateName={stateName}
                approvalCount={approvalCount}
                fundedCount={fundedCount}
                memberCount={summary.memberCount}
              />
            )}

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Fig label="Contribution / round" value={formatToken(summary.contributionPerRound, decimals, symbol)} />
              <Fig label="Member commitment" value={formatToken(summary.memberCommitment, decimals, symbol)} />
              <Fig label="Members" value={String(summary.memberCount)} />
              <Fig label="Frequency" value={frequency !== undefined ? frequencyLabel(frequency) : "—"} />
            </section>

            {!account && (
              <EmptyState title="Connect your wallet" body="Connect the wallet that belongs to this circle to see your actions." />
            )}
            {account && !isMember && (
              <EmptyState
                title="This wallet is not a member of this circle"
                body="Only wallets in the locked member list can act on a circle. If you were invited, connect the invited wallet."
              />
            )}
            {account && isMember && member && (
              <section className="card space-y-4 p-6">
                <h2 className="text-lg font-semibold">Your position</h2>
                <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <Fig label="Payout position" value={`#${member.position + 1}`} />
                  <Fig label="Rules approved" value={member.approved ? "Yes — locked onchain" : "Not yet"} />
                  <Fig label="Escrow funded" value={member.funded ? "Yes" : "Not yet"} />
                  <Fig label="Claimable yield" value={claimable > 0n ? formatToken(claimable, decimals, symbol) : "Nothing to claim"} />
                </dl>
                <div className="flex flex-wrap gap-3 border-t border-white/5 pt-4">
                  {isOrganizer && stateName === "Draft" && (
                    <button className="btn-primary" disabled={action.isBusy} onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "lockRules" })}>
                      Lock rules &amp; open approvals
                    </button>
                  )}
                  {stateName === "Awaiting approvals" && !member.approved && (
                    <button className="btn-primary" disabled={action.isBusy} onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "approveRules" })}>
                      Approve the rules onchain
                    </button>
                  )}
                  {stateName === "Active" && dueNow && (
                    <button className="btn-primary" disabled={action.isBusy} onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "settleRound" })}>
                      Execute round {String(summary.currentRound)} payout
                    </button>
                  )}
                  {stateName === "Cancelled" && member.funded && !member.refunded && (
                    <button className="btn-primary" disabled={action.isBusy} onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "claimRefund" })}>
                      Claim your refund
                    </button>
                  )}
                  {stateName === "Emergency" && !member.emergencyRedeemed && (
                    <button className="btn-primary" disabled={action.isBusy} onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "emergencyRedeem" })}>
                      Redeem your pro-rata share
                    </button>
                  )}
                  {(stateName === "Funding" || stateName === "Awaiting approvals") && (
                    <span className="text-xs text-ink-faint">Funding steps live in the Funding tab.</span>
                  )}
                </div>
                <TxStatus phase={action.phase} hash={action.hash} error={action.error} />
              </section>
            )}
          </div>
        )}

        {tab === "members" && (
          <section className="card p-6">
            <h2 className="text-lg font-semibold">Payout order — locked onchain</h2>
            <p className="mt-1 text-xs text-ink-faint">
              Position {String(summary.currentRound)} is next. The order can never change after activation.
            </p>
            {invitesUseful && (
              <p className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-xs text-ink-dim">
                Share each member their personal invite link — it opens this circle for their wallet only. The contract
                only lets the added wallets approve or fund, so the links are always safe to send.
              </p>
            )}
            <ol className="mt-4 space-y-2">
              {order?.map((memberAddr, i) => {
                const isPast = BigInt(i) < summary.currentRound;
                const isNext = BigInt(i) === summary.currentRound && stateName === "Active";
                return (
                  <li
                    key={memberAddr}
                    className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-sm ${
                      isNext ? "border-violet-500/40 bg-violet-500/10" : isPast ? "border-white/5 bg-white/[0.02] text-ink-faint" : "border-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-xs text-ink-faint">#{i + 1}</span>
                      <span className="font-mono text-xs">{shortAddress(memberAddr)}</span>
                      {memberAddr === account && <span className="text-xs text-violet-300">(you)</span>}
                    </span>
                    <span className="flex items-center gap-2">
                      {invitesUseful && <CopyInviteButton circle={circle} member={memberAddr} />}
                      <span className="text-xs">{isPast ? "Paid ✓" : isNext ? "Next collector" : "Waiting"}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {tab === "schedule" && (
          <section className="card p-6">
            <h2 className="text-lg font-semibold">Payout schedule</h2>
            {frequency !== undefined && firstPayout !== undefined ? (
              <ol className="mt-4 space-y-2">
                {Array.from({ length: Number(summary.totalRounds) }).map((_, r) => {
                  const due = firstPayout + BigInt(r) * frequency;
                  const settled = BigInt(r) < summary.currentRound;
                  const isNext = BigInt(r) === summary.currentRound && stateName === "Active";
                  return (
                    <li
                      key={r}
                      className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${
                        isNext ? "border-violet-500/40 bg-violet-500/10" : settled ? "border-white/5 bg-white/[0.02] text-ink-faint" : "border-white/5"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="font-mono text-xs text-ink-faint">Round {r + 1}</span>
                        {order?.[r] && <span className="font-mono text-xs">{shortAddress(order[r]!)}</span>}
                      </span>
                      <span className="num text-xs">
                        {settled ? "Settled ✓" : `${formatDate(due)}${isNext && dueNow ? " — due now" : ""}`}
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-ink-dim">Loading schedule from the contract…</p>
            )}
            {isMember && stateName === "Active" && dueNow && (
              <div className="mt-4 border-t border-white/5 pt-4">
                <button className="btn-primary" disabled={action.isBusy} onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "settleRound" })}>
                  Execute round {String(summary.currentRound)} payout
                </button>
                <TxStatus phase={action.phase} hash={action.hash} error={action.error} />
              </div>
            )}
          </section>
        )}

        {tab === "funding" && (
          <section className="card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Funding</h2>
            <FundingProgress funded={summary.totalPrincipalFunded} target={summary.memberCommitment * summary.memberCount} decimals={decimals} symbol={symbol} />
            {account && isMember && member ? (
              <div className="space-y-4 border-t border-white/5 pt-4">
                {/* wallet balance vs commitment — catches "insufficient balance" before it reverts */}
                {stateName === "Funding" && !member.funded && (
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-sm">
                    <div className="flex items-baseline justify-between">
                      <span className="text-ink-faint">Your {symbol} balance</span>
                      <span className={`num font-semibold ${hasEnough ? "text-mint" : "text-caution"}`}>
                        {balance !== undefined ? formatToken(balance, decimals, symbol) : "…"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-ink-faint">Needed to fund</span>
                      <span className="num font-semibold">{formatToken(summary.memberCommitment, decimals, symbol)}</span>
                    </div>
                    {!hasEnough && balance !== undefined && (
                      <p className="mt-2 text-xs text-caution">
                        You don&apos;t have enough {symbol} to fund your commitment yet.
                        {isFaucetToken ? " Grab some test tokens below." : ` Add ${symbol} to this wallet, then fund.`}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {/* testnet faucet — only on the labeled valueless demo token */}
                  {stateName === "Funding" && !member.funded && !hasEnough && isFaucetToken && tokenAddr && (
                    <button
                      className="btn-secondary"
                      disabled={action.isBusy}
                      onClick={() =>
                        action.execute({ address: tokenAddr, abi: testTokenFaucetAbi, functionName: "mint", args: [account, summary.memberCommitment] })
                      }
                    >
                      Get {formatToken(summary.memberCommitment, decimals, symbol)} test {symbol}
                    </button>
                  )}
                  {stateName === "Funding" && !member.funded && hasEnough && needsAllowance && tokenAddr && (
                    <button
                      className="btn-primary"
                      disabled={action.isBusy}
                      onClick={() =>
                        action.execute({ address: tokenAddr, abi: erc20Abi, functionName: "approve", args: [circle, summary.memberCommitment] })
                      }
                    >
                      Step 1 — Allow the contract to escrow {formatToken(summary.memberCommitment, decimals, symbol)}
                    </button>
                  )}
                  {stateName === "Funding" && !member.funded && hasEnough && !needsAllowance && (
                    <button className="btn-primary" disabled={action.isBusy} onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "fund" })}>
                      Step 2 — Fund your full commitment ({formatToken(summary.memberCommitment, decimals, symbol)})
                    </button>
                  )}
                  {stateName === "Funding" && (
                    <button className="btn-secondary" disabled={action.isBusy} onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "activate" })}>
                      Activate circle (requires everyone funded)
                    </button>
                  )}
                  {member.funded && (
                    <p className="text-sm text-mint">Your escrow is funded ✓ — nothing further is needed here.</p>
                  )}
                </div>
                <TxStatus phase={action.phase} hash={action.hash} error={action.error} />
              </div>
            ) : (
              <p className="text-sm text-ink-faint">Connect a member wallet to fund this circle.</p>
            )}
          </section>
        )}

        {tab === "yield" && (
          <section className="card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Yield</h2>
            {summary.adapter === "0x0000000000000000000000000000000000000000" ? (
              <p className="text-sm text-ink-dim">
                Yield is not enabled for this circle — no verified yield market exists for its settlement token on this
                network. Principal simply waits in the circle contract.
              </p>
            ) : (
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <Fig label="Gross yield realized" value={formatToken(summary.grossYieldRealized, decimals, symbol)} />
                <Fig label="Allocated to members" value={formatToken(summary.totalYieldAllocated, decimals, symbol)} />
                <Fig label="Claimed so far" value={formatToken(summary.totalYieldClaimed, decimals, symbol)} />
              </dl>
            )}
            {isMember && claimable > 0n && (stateName === "Active" || stateName === "Completed") && (
              <div className="border-t border-white/5 pt-4">
                <button className="btn-secondary" disabled={action.isBusy} onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "claimYield" })}>
                  Claim yield ({formatToken(claimable, decimals, symbol)})
                </button>
                <TxStatus phase={action.phase} hash={action.hash} error={action.error} />
              </div>
            )}
            <p className="text-xs text-ink-faint">
              Principal and yield are accounted separately in the contract. Yield is variable and never guaranteed.
            </p>
          </section>
        )}

        {tab === "activity" && (
          <section className="space-y-4">
            <EmptyState
              title="Activity feed coming from the indexer"
              body="Confirmed events for this circle will appear here once the MonSave indexer is running against this network. Every transaction is already publicly visible on the explorer."
              action={
                <a
                  href={addressUrl(activeChain.id as SupportedChainId, circle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-2"
                >
                  View all transactions on {activeChain.blockExplorers?.default.name}
                </a>
              }
            />
          </section>
        )}
      </div>
    </div>
  );
}

function ActivationProgress({
  stateName,
  approvalCount,
  fundedCount,
  memberCount,
}: {
  stateName: string;
  approvalCount?: bigint;
  fundedCount?: bigint;
  memberCount: bigint;
}) {
  const total = Number(memberCount);
  const approved = approvalCount !== undefined ? Number(approvalCount) : 0;
  const funded = fundedCount !== undefined ? Number(fundedCount) : 0;

  // Which step is the circle on?
  const approvalsDone = approved >= total;
  const heading =
    stateName === "Draft"
      ? "Waiting for the organizer to lock the rules"
      : stateName === "Awaiting approvals"
        ? "Waiting for every member to approve the rules onchain"
        : "Waiting for every member to fund their commitment";

  return (
    <section className="card space-y-4 p-6" aria-label="Activation progress">
      <div>
        <h2 className="text-lg font-semibold">Getting this circle started</h2>
        <p className="mt-1 text-sm text-ink-dim">{heading}</p>
      </div>

      <ProgressRow
        label="Rules approved"
        done={approved}
        total={total}
        loading={approvalCount === undefined}
        complete={approvalsDone}
        hint={approvalsDone ? "All members approved" : `${total - approved} member${total - approved === 1 ? "" : "s"} still to approve`}
      />
      <ProgressRow
        label="Commitments funded"
        done={funded}
        total={total}
        loading={fundedCount === undefined}
        complete={funded >= total}
        hint={
          !approvalsDone
            ? "Opens once everyone has approved"
            : funded >= total
              ? "Fully funded — ready to activate"
              : `${total - funded} member${total - funded === 1 ? "" : "s"} still to fund`
        }
        muted={!approvalsDone}
      />
    </section>
  );
}

function ProgressRow({
  label,
  done,
  total,
  loading,
  complete,
  hint,
  muted,
}: {
  label: string;
  done: number;
  total: number;
  loading: boolean;
  complete: boolean;
  hint: string;
  muted?: boolean;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className={muted ? "opacity-50" : ""}>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={`num font-semibold ${complete ? "text-mint" : "text-ink-dim"}`}>
          {loading ? "—" : `${done} of ${total}`}
          {complete && !loading && " ✓"}
        </span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-pill bg-white/5"
        role="progressbar"
        aria-valuenow={loading ? undefined : done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${label}: ${loading ? "loading" : `${done} of ${total}`}`}
      >
        <div
          className={`h-full rounded-pill transition-[width] duration-500 ease-swift ${complete ? "bg-mint" : "bg-violet-sheen"}`}
          style={{ width: loading ? "0%" : `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-ink-faint">{hint}</p>
    </div>
  );
}

function FundingProgress({ funded, target, decimals, symbol }: { funded: bigint; target: bigint; decimals: number; symbol: string }) {
  const pct = target > 0n ? Number((funded * 100n) / target) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-ink-faint">Escrowed so far</span>
        <span className="num font-semibold">
          {formatToken(funded, decimals, symbol)} / {formatToken(target, decimals, symbol)}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-pill bg-white/5" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Funding progress">
        <div className="h-full rounded-pill bg-violet-sheen transition-[width] duration-500 ease-swift" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-ink-faint">{pct}% of total circle principal escrowed</p>
    </div>
  );
}

function Fig({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-[11px] uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="num mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
