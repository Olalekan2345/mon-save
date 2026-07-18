# Security Architecture

## Custody model

- **No master wallet.** Funds move from a member's wallet directly into that
  circle's own `SavingsCircle` contract. Each circle's optional yield adapter is
  a dedicated instance bound to that circle alone — funds are never pooled.
- **No admin principal access.** There is no function on any contract that lets
  any role withdraw member principal, change an active recipient, reopen a
  round, or fabricate yield. The admin surface is exactly: asset listing,
  member-count caps, creation pause (new circles only), fee ≤ 10% hard cap,
  treasury address.
- **Immutability over upgradability.** Circles are plain, direct deployments —
  no proxies, no initializers to front-run, no upgrade path. New protocol
  versions are new factory deployments; old circles finish under their original
  code.

## Contract hardening

- Solidity 0.8.28 (checked arithmetic), custom errors, bounded loops
  (≤12 members), explicit state machine with onchain-enforced transitions.
- OpenZeppelin `SafeERC20`, `ReentrancyGuard`, `Ownable2Step`.
- Checks-effects-interactions everywhere funds move.
- Balance-diff verification on inbound transfers (rejects fee-on-transfer).
- Adapter withdrawals verified amount-exact (`AdapterWithdrawMismatch`).
- Yield adapter is supply/withdraw only: no borrow, no leverage, no flash
  loans, no trading, no bridging, allowance zeroed by `forceApprove` pattern.
- Solvency gate before every payout; emergency state with deterministic
  pro-rata redemption (see EMERGENCY_AND_SHORTFALL.md).
- Full event coverage of financial state transitions.

## Testing

- 73 Foundry tests: unit (lifecycle, yield, emergency, adapter, factory,
  security), fuzz (lifecycle across contribution/members/frequency/decimals,
  yield conservation, double-payout), and 6 invariants over a randomized
  handler (payouts ≤ funded, accounting identity, yield conservation, no double
  payout, completed ⇒ all rounds settled, payout order immutability).
- Slither + gas snapshots wired into CI.
- Mainnet fork tests for Aave integration are gated on verified Aave Monad
  addresses (see MONAD_INTEGRATION_AUDIT.md).

## Governance

- Production ownership: Safe multisig (threshold and owners recorded in the ops
  vault, never in the repo). `Ownable2Step` prevents ownership-transfer
  accidents; the Safe must explicitly accept.
- Sensitive parameter changes should go through a timelock where practical;
  the fee cap and the impossibility of touching principal are enforced onchain
  regardless of governance compromise.
- Deployment signer: encrypted Foundry keystore (`--account`) or hardware
  wallet. No raw private keys in code, env files, scripts, or CI logs.

## Backend/API

- SIWE (EIP-4361) wallet auth: single-use nonces (5-min TTL, consumed
  atomically), domain + chain binding, HTTP-only SameSite cookies, revocable
  sessions, rate-limited auth endpoints.
- Helmet CSP, CORS pinned to the app origin, Zod validation on every input,
  correlation IDs, secret redaction in logs.
- The API has no endpoint that can move funds or mutate blockchain-derived
  financial state.

## Honest-data policy (enforced across the stack)

- No hardcoded users, balances, APYs, transaction hashes, or rates anywhere in
  production code paths.
- Success is only shown after onchain confirmation (configured confirmations),
  never on button click or hash receipt.
- Indexer is a cache, never an authority: action eligibility is revalidated
  against the contract before any write.
- Empty states state the truth ("You have not created or joined a circle yet").

## Known limitations (disclosed, not hidden)

- **No external audit yet.** Required before unrestricted public deposits; the
  UI does not display any audit badge.
- Community Circles (partial collateralization) are designed but disabled — a
  frontend flag cannot enable them because the deployed factory only implements
  the Secure Circle model.
- NGN display depends on an external rate source; it is estimate-only and
  clearly labeled.
