# Community Circle — design (NOT implemented onchain, NOT enabled)

Community Circle is the future round-by-round contribution mode. It is
**deliberately absent from the deployed contract system**: the factory only
implements Secure Circles, so no feature flag, frontend change or API change
can enable partially-collateralized circles. Enabling them requires designing,
auditing and deploying new contracts — that is the enforcement mechanism the
brief requires.

## Why it is not trustless (and must never be marketed as such)

A member who receives an early payout in a round-by-round circle can stop
contributing. The remaining members bear that loss. Mechanisms below reduce —
but do not eliminate — this risk.

## Planned risk model

- **Security bond**: each member posts a bond of N rounds' contributions
  (partial collateralization). Missed payments draw from the bond first.
- **Grace period**: X hours after a due contribution before default processing.
- **Reputation**: onchain history of completed circles per address; organizers
  set minimum reputation for membership.
- **Guarantors**: another address may co-sign a member's obligation, staking
  its own bond.
- **Default handling**: bond slashing → guarantor draw → pot reduction with
  pro-rata haircut, in that order, all evented.
- **Replacement members**: a vacancy after default may be filled by group vote
  before the next round.
- **Voting**: parameterized member votes (replacement, early dissolution) with
  quorum = all unpaid members.
- **Missed-payment notifications**: worker + API deliver reminders before and
  after due times.

## Gate to production (all required)

1. Complete risk model with worked adversarial scenarios.
2. Default handling implemented and covered by fuzz + invariant tests.
3. External audit of the new contracts.
4. Legal review for target jurisdictions.
5. Explicit product-governance sign-off recorded in the repo.
6. Controlled pilot with caps before public availability.
