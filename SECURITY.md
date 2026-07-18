# Security Policy

## Reporting a vulnerability

Please report suspected vulnerabilities privately — do not open a public issue.

- Email: security reports go to the repository owner (see profile) with the
  subject line `[MonSave Security]`.
- Include: affected component, reproduction steps, and impact assessment.

We will acknowledge within 48 hours and keep you informed of the fix timeline.
We will not pursue legal action against good-faith security research.

## Scope

- Smart contracts in `packages/contracts/src/`
- API in `apps/api/`
- Settlement worker in `apps/worker/`
- Web app in `apps/web/`

## Status

The MonSave contracts have **not yet completed an external audit**. External
audit and legal review are required before unrestricted public deposits — see
`docs/SECURITY_ARCHITECTURE.md` and `docs/THREAT_MODEL.md`.
