# Emergency & Shortfall Handling

## Principle

Never make a silent partial principal payout. If the protocol cannot pay
everyone what they are owed, it freezes, tells everyone, and divides what is
recoverable deterministically.

## Detection

Before every settlement, `SavingsCircle.settleRound()` computes:

```
recoverable = circle token balance + adapter.maxWithdrawable()
```

If `recoverable < remaining principal liabilities` (contribution × remaining
rounds × members), the circle enters **Emergency** instead of paying out.
Anyone can also call `triggerEmergency()` at any time; it validates the same
condition onchain, so it cannot be abused to freeze a healthy circle.

## What happens in Emergency

1. `emergencyWithdrawAll()` recovers everything the adapter can return.
2. The shortfall is recorded onchain (`ShortfallRecorded(required, recoverable, shortfall)`)
   and surfaced prominently in the UI — misleading balance claims are disabled.
3. Normal settlement, yield claims and checkpoints are frozen.
4. Every member may call `emergencyRedeem()` exactly once.

## Pro-rata redemption

In a Secure Circle every member's remaining liability is identical (each round
consumes one contribution unit from everyone), so the deterministic pro-rata
share is an **equal split** of recovered assets:

```
share = recovered assets at trigger / member count
```

- Snapshotted at trigger time — later claims cannot dilute earlier ones.
- One redemption per member, enforced onchain.
- No administrator involvement; no admin function can prioritize anyone.

## Accounting honesty

The normal invariant

```
principal paid + remaining liability + refunds = funded principal
```

is allowed to break **only** when a shortfall has been explicitly recorded and
emitted. `recordedShortfall` is public state, indexed, and displayed.

## Operational response (runbook)

1. `EmergencyTriggered` event fires → indexer creates a critical `RiskFlag` →
   on-call alerted.
2. Verify the trigger cause onchain (Aave reserve state, token status).
3. Publish an incident notice in the app; notify affected members.
4. If the cause is transient upstream liquidity, recovered value may still
   arrive later; any further recovery follows the same pro-rata rule.
5. Post-mortem in `docs/INCIDENT_RESPONSE.md` format.
