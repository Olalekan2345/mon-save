# MonSave — Judge Demo Guide (Monad Testnet)

Everything below runs against the **live Monad Testnet deployment** — no mocks,
no seeded data. Testnet assets have no monetary value and the UI says so.

## Zero-setup: inspect the live protocol

Already onchain, executed with real transactions on 2026-07-18:

1. **Factory:** https://testnet.monadscan.com/address/0x35AdCdbFf4AdabF01DFCC698D62F9aA64a8c41E3
2. **Completed demo flow** on circle `0xCb7CE3bd13A700631F6cC18E7A9844356C303DF1`:
   - `createCircle` → tx `0x7df42320…e955ea68`
   - `lockRules` → `0x04392f84…8fd892b2`
   - both members `approveRules` → `0x7ba758d1…23b778d0`, `0x1c688dd7…f14fed26`
   - both members escrowed the full 40 tUSD commitment → `0x30802958…3c6921ca`, `0x732101f2…70b03a877`
   - `activate` → `0xafd0e28b…4138ba52`
   - `settleRound` executed by the member who was **not** the recipient —
     proving anyone can execute a due payout.

Open the circle address on MonadScan and read the state directly:
`state() = 3 (Active) → 4 (Completed after round 2)`, `totalPrincipalPaid()`,
`getPayoutOrder()`.

## Run the app locally (5 minutes)

```bash
pnpm install
# paste a free Reown project id (dashboard.reown.com) into apps/web/.env.local
pnpm --filter @monsave/web dev
```

Open http://localhost:3000 — the app is pre-wired to the live Testnet factory.

**Walkthrough:**
1. Connect a wallet → note the network guard: the app refuses to show data if
   your wallet is on any chain other than Monad Testnet (10143).
2. Get testnet MON from https://faucet.monad.xyz.
3. Get demo tUSD: call `mint(yourAddress, amount)` on
   `0xAB542a297D8192a1FEb25f2dbc054f3Cf4a832Bb` (open capped mint) — or use the
   circle page after someone adds you to a circle.
4. Create a circle in the 5-step wizard (use a second wallet address as member
   2). Watch the transaction lifecycle: simulate → sign → pending → confirmed,
   with the real hash linked to MonadScan.
5. Approve rules from both wallets, escrow from both, activate.
6. When the round is due, hit "Execute payout" — from either wallet, or any
   third wallet.

## What to look for (the honest-fintech details)

- Empty dashboard says "You have not created or joined a circle yet" — never
  fake activity.
- Principal and yield are separate everywhere; Testnet yield honestly says
  "no verified yield market on this network" instead of faking an APY.
- No "success" until 2 onchain confirmations.
- The admin surface cannot touch funds — not policy, but absent code paths
  (see `docs/THREAT_MODEL.md`).
- 73 Foundry tests incl. 6 invariants: `pnpm contracts:test`.
