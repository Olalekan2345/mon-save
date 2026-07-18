"use client";

import { use, useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { isAddress } from "viem";
import { savingsCircleAbi, erc20Abi, CIRCLE_STATES } from "@/lib/abis";
import { useCircleSummary, useCircleMember } from "@/hooks/useCircles";
import { useContractAction } from "@/hooks/useContractAction";
import { TxStatus } from "@/components/TxStatus";
import { EmptyState } from "@/components/EmptyState";
import { formatToken, formatDate, shortAddress, frequencyLabel } from "@/lib/format";
import { addressUrl, type SupportedChainId } from "@monsave/config";
import { activeChain } from "@/lib/chains";

export default function CirclePage({ params }: { params: Promise<{ address: string }> }) {
  const { address: raw } = use(params);

  if (!isAddress(raw)) {
    return <EmptyState title="Invalid circle address" body="The address in the URL is not a valid contract address." />;
  }
  return <CircleDetail circle={raw as `0x${string}`} />;
}

function CircleDetail({ circle }: { circle: `0x${string}` }) {
  const { address: account } = useAccount();
  const summaryQ = useCircleSummary(circle);
  const memberQ = useCircleMember(circle, account);
  const orderQ = useReadContract({ address: circle, abi: savingsCircleAbi, functionName: "getPayoutOrder" });
  const tokenQ = useReadContract({ address: circle, abi: savingsCircleAbi, functionName: "token" });
  const organizerQ = useReadContract({ address: circle, abi: savingsCircleAbi, functionName: "organizer" });

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

  const refetchAll = () => {
    void summaryQ.refetch();
    void memberQ.refetch();
    void allowanceQ.refetch();
  };
  const action = useContractAction(refetchAll);

  const summary = summaryQ.data;
  const member = memberQ.data;
  const decimals = (decimalsQ.data as number | undefined) ?? 6;
  const symbol = (symbolQ.data as string | undefined) ?? "";

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
  const needsAllowance =
    typeof allowanceQ.data === "bigint" && summary.memberCommitment > (allowanceQ.data as bigint);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Savings circle</h1>
          <a
            href={addressUrl(activeChain.id as SupportedChainId, circle)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block font-mono text-xs text-violet-400 underline-offset-2 hover:underline"
          >
            {circle} ↗
          </a>
        </div>
        <span className="rounded-pill bg-violet-500/15 px-4 py-1.5 text-sm font-medium text-violet-300">
          {stateName}
        </span>
      </header>

      {stateName === "Emergency" && (
        <div className="rounded-lg border border-critical/40 bg-critical/10 p-4 text-sm text-critical" role="alert">
          <p className="font-semibold">This circle is in emergency mode.</p>
          <p className="mt-1 opacity-90">
            Recoverable assets fell below the remaining committed principal. Normal payouts are frozen. Every unpaid
            member can redeem an equal pro-rata share of the recovered assets below. No administrator can prioritize
            anyone.
          </p>
        </div>
      )}

      {/* key figures — all from the contract */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Fig label="Contribution / round" value={formatToken(summary.contributionPerRound, decimals, symbol)} />
        <Fig label="Member commitment" value={formatToken(summary.memberCommitment, decimals, symbol)} />
        <Fig label="Round pot" value={formatToken(summary.roundPot, decimals, symbol)} />
        <Fig label="Round" value={`${summary.currentRound} / ${summary.totalRounds}`} />
        <Fig label="Principal escrowed" value={formatToken(summary.totalPrincipalFunded, decimals, symbol)} />
        <Fig label="Principal paid out" value={formatToken(summary.totalPrincipalPaid, decimals, symbol)} />
        <Fig
          label="Yield allocated (net)"
          value={summary.totalYieldAllocated > 0n ? formatToken(summary.totalYieldAllocated, decimals, symbol) : "None recorded"}
        />
        <Fig label="Next payout" value={summary.nextDueTime > 0n ? formatDate(summary.nextDueTime) : "—"} />
      </section>

      {/* member actions */}
      {!account && (
        <EmptyState title="Connect your wallet" body="Connect the wallet that belongs to this circle to see your actions." />
      )}

      {account && isMember && member && (
        <section className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold">Your position</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Fig label="Payout position" value={`#${member.position + 1}`} />
            <Fig label="Rules approved" value={member.approved ? "Yes — locked onchain" : "Not yet"} />
            <Fig label="Escrow funded" value={member.funded ? "Yes" : "Not yet"} />
            <Fig
              label="Claimable yield"
              value={
                member.yieldAllocated - member.yieldClaimed > 0n
                  ? formatToken(member.yieldAllocated - member.yieldClaimed, decimals, symbol)
                  : "Nothing to claim"
              }
            />
          </dl>

          <div className="flex flex-wrap gap-3 border-t border-white/5 pt-4">
            {stateName === "Awaiting approvals" && !member.approved && (
              <button
                className="btn-primary"
                disabled={action.isBusy}
                onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "approveRules" })}
              >
                Approve the rules onchain
              </button>
            )}

            {stateName === "Funding" && !member.funded && needsAllowance && tokenAddr && (
              <button
                className="btn-primary"
                disabled={action.isBusy}
                onClick={() =>
                  action.execute({
                    address: tokenAddr,
                    abi: erc20Abi,
                    functionName: "approve",
                    args: [circle, summary.memberCommitment],
                  })
                }
              >
                Step 1 — Allow the contract to escrow {formatToken(summary.memberCommitment, decimals, symbol)}
              </button>
            )}
            {stateName === "Funding" && !member.funded && !needsAllowance && (
              <button
                className="btn-primary"
                disabled={action.isBusy}
                onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "fund" })}
              >
                Fund your full commitment ({formatToken(summary.memberCommitment, decimals, symbol)})
              </button>
            )}

            {stateName === "Funding" && (
              <button
                className="btn-secondary"
                disabled={action.isBusy}
                onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "activate" })}
              >
                Activate circle (requires everyone funded)
              </button>
            )}

            {stateName === "Active" && dueNow && (
              <button
                className="btn-primary"
                disabled={action.isBusy}
                onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "settleRound" })}
              >
                Execute round {String(summary.currentRound)} payout
              </button>
            )}

            {member.yieldAllocated - member.yieldClaimed > 0n && (stateName === "Active" || stateName === "Completed") && (
              <button
                className="btn-secondary"
                disabled={action.isBusy}
                onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "claimYield" })}
              >
                Claim yield ({formatToken(member.yieldAllocated - member.yieldClaimed, decimals, symbol)})
              </button>
            )}

            {stateName === "Cancelled" && member.funded && !member.refunded && (
              <button
                className="btn-primary"
                disabled={action.isBusy}
                onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "claimRefund" })}
              >
                Claim your refund
              </button>
            )}

            {stateName === "Emergency" && !member.emergencyRedeemed && (
              <button
                className="btn-primary"
                disabled={action.isBusy}
                onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "emergencyRedeem" })}
              >
                Redeem your pro-rata share
              </button>
            )}

            {account === organizerQ.data && stateName === "Draft" && (
              <button
                className="btn-primary"
                disabled={action.isBusy}
                onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "lockRules" })}
              >
                Lock rules &amp; open approvals
              </button>
            )}
            {account === organizerQ.data &&
              (stateName === "Draft" || stateName === "Awaiting approvals" || stateName === "Funding") && (
                <button
                  className="btn-secondary !border-critical/40 !text-critical hover:!bg-critical/10"
                  disabled={action.isBusy}
                  onClick={() => action.execute({ address: circle, abi: savingsCircleAbi, functionName: "cancel" })}
                >
                  Cancel circle
                </button>
              )}
          </div>

          <TxStatus phase={action.phase} hash={action.hash} error={action.error} />
        </section>
      )}

      {account && !isMember && (
        <EmptyState
          title="This wallet is not a member of this circle"
          body="Only wallets in the locked member list can act on a circle. If you were invited, connect the invited wallet."
        />
      )}

      {/* payout order */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Payout order — locked onchain</h2>
        <p className="mt-1 text-xs text-ink-faint">
          Position {String(summary.currentRound)} is next. The order can never change after activation.
        </p>
        <ol className="mt-4 space-y-2">
          {(orderQ.data as readonly `0x${string}`[] | undefined)?.map((memberAddr, i) => {
            const isPast = BigInt(i) < summary.currentRound;
            const isNext = BigInt(i) === summary.currentRound && stateName === "Active";
            return (
              <li
                key={memberAddr}
                className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${
                  isNext
                    ? "border-violet-500/40 bg-violet-500/10"
                    : isPast
                      ? "border-white/5 bg-white/[0.02] text-ink-faint"
                      : "border-white/5"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-ink-faint">#{i + 1}</span>
                  <span className="font-mono text-xs">{shortAddress(memberAddr)}</span>
                  {memberAddr === account && <span className="text-xs text-violet-300">(you)</span>}
                </span>
                <span className="text-xs">
                  {isPast ? "Paid ✓" : isNext ? "Next collector" : "Waiting"}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function Fig({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-[11px] uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
