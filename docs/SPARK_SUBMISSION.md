# Spark Hackathon Submission — MonSave

## One-liner

Ajo, onchain — the trustless savings circle that earns while it waits.

## Problem

Millions of people save through rotating savings circles (ajo/esusu in
Nigeria, susu, tandas, chit funds elsewhere). The model works — but it runs on
one person: the collector, who holds everyone's money, keeps the records,
remembers the order, and must not disappear. Money also sits idle between
payouts, losing value.

## Solution

MonSave puts the whole circle onchain as a **Secure Circle**:

1. The group approves the exact rules onchain — contribution, schedule, payout
   order. Any edit resets all approvals.
2. Every member escrows their **full commitment** before activation
   (contribution × rounds). This is the honest fix for the classic ROSCA
   failure mode: an early collector can't stop paying, because their future
   contributions are already collateralized.
3. Each round, one contribution unit is consumed from every member's escrow and
   the full pot pays the scheduled recipient. Settlement is permissionless.
4. Idle principal can earn **variable** yield via a per-circle, supply-only
   Aave V3 adapter. Principal and yield are accounted separately; the protocol
   fee applies only to realized yield and is hard-capped at 10% onchain.
5. If recoverable assets ever fall below what members are owed, the circle
   freezes and every member redeems an equal pro-rata share — shortfalls are
   recorded onchain, never hidden.

## Why Monad

Savings circles are many small, frequent, cost-sensitive transactions —
approvals, funding, settlements, claims across thousands of groups. Monad's
throughput and low fees make per-round onchain settlement economically
sensible, with full EVM tooling (Foundry, viem, Aave V3) and MonadScan
verifiability.

## What's built (this repo)

- **Contracts (Foundry, Solidity 0.8.28):** CircleFactory, SavingsCircle
  (explicit state machine: Draft → AwaitingApprovals → Funding → Active →
  Completed / Cancelled / Emergency), AaveV3MonadAdapter (supply/withdraw
  only), ProtocolConfig, SupportedAssetRegistry, ProtocolTreasury.
  **73 passing tests**: unit, fuzz (lifecycle across decimals/members/
  frequencies, yield conservation), and 6 invariants over a randomized handler.
- **Web (Next.js 15, Reown AppKit, wagmi/viem):** landing + education pages,
  wallet connect with strict network guarding, dashboard, my-circles, 5-step
  create wizard (validated with Zod, simulation before signing), full circle
  detail page (approve → allowance → fund → activate → settle → claim yield →
  refund → emergency redeem) with a complete transaction-lifecycle UI
  (preparing / awaiting signature / pending / confirmed / reverted / rejected)
  and explorer links. Honest empty states everywhere; zero fabricated data.
- **API (Fastify + Prisma/PostgreSQL):** SIWE (EIP-4361) auth with single-use
  nonces and revocable HTTP-only sessions, circles/notifications/admin
  modules, health endpoints, rate limiting, full ops schema (20 models incl.
  audit logs, risk flags, deployment records).
- **Indexer (Envio HyperIndex):** dynamic circle registration from factory
  events, 19 events indexed, reorg-aware, idempotent ids.
- **Worker:** permissionless-settlement automation with simulate-first,
  confirm-after semantics and observe-only mode; zero privileges by design.
- **Ops & docs:** CI (build, tests, fuzz/invariants, Slither, secret scan),
  protected manual-approval Mainnet deploy workflow, deploy runbook, threat
  model, security architecture, emergency/shortfall spec, Monad integration
  audit.

## Honesty features (what makes this different)

- We tell users what full pre-funding costs and why it's required.
- We never show "success" before onchain confirmation.
- We never display an APY we didn't fetch or an asset we didn't verify —
  address slots ship empty until multi-source verification, and the UI says so.
- We don't call ourselves audited. We ship the threat model instead.

## Demo script (Testnet)

1. Connect wallet → network guard demonstrates Testnet-only isolation.
2. Create a 3-member circle in the wizard → simulate → sign → watch the real
   tx confirm → open it on MonadScan Testnet.
3. Second/third wallets approve rules, fund escrow (allowance → fund).
4. Activate; fast-forward to the due time; settle round 1 from a *fourth,
   non-member* wallet to prove permissionlessness.
5. Show principal/yield separation and the honest "no yield market verified on
   this network" state.

## Team & links

- Repo: this repository (monorepo, MIT).
- Contact: hackathon submission profile.

## What's next

External audit → verified Testnet pilot → capped Mainnet pilot (Safe-owned,
low deposit caps) → NGN estimate rails and Community Circles once the risk
model, default handling and legal review are complete.
