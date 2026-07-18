# Incident Response

## Severity levels

- **SEV-1** — funds at risk or shortfall recorded (EmergencyTriggered, exploit
  suspected, Aave reserve incident affecting circles).
- **SEV-2** — service degraded but funds safe (indexer lag > 10 min, RPC
  failover active, settlement worker failing — users can still self-settle).
- **SEV-3** — cosmetic/functional bugs without financial impact.

## On-call flow

1. **Detect** — RiskFlags from indexer/worker health checks, Sentry alerts,
   user reports.
2. **Triage** — confirm onchain reality first (cast/explorer), not dashboards.
3. **Contain** —
   - Protocol level: Safe may pause *new circle creation* only. Existing
     circles cannot be paused by design — this is a feature, not a gap.
   - Yield level: a circle in genuine shortfall self-freezes via the solvency
     gate; verify Emergency state is reachable (anyone can trigger it when the
     condition truly holds).
   - Interface level: banner + disable affected flows (never fake data).
4. **Communicate** — in-app incident banner, status note, direct notification
   to affected circle members. State facts, amounts and next steps; no
   minimizing.
5. **Recover** — follow EMERGENCY_AND_SHORTFALL.md for shortfalls; redeploy
   services from clean images for infra compromise; rotate any affected
   credentials (session secret, RPC keys, worker signer).
6. **Post-mortem** — within 5 working days: timeline, root cause, user impact,
   invariant/test added to prevent recurrence.

## Key rotation

- Worker signer: generate new key, fund minimal gas, update secret manager,
  drain old key, done — it holds no roles.
- Safe signer loss: follow the documented Safe owner-rotation procedure;
  threshold must remain ≥ 2/3 of owners.
- Session secret: rotate → all sessions invalidated → users re-authenticate.

## Security contact

Responsible disclosure via the repository security policy (SECURITY.md).
Acknowledge within 48h; no legal threats against good-faith researchers.
