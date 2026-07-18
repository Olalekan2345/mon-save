# MonSave Threat Model

Scope: SavingsCircle, CircleFactory, AaveV3MonadAdapter, ProtocolConfig,
SupportedAssetRegistry, ProtocolTreasury, API, worker, indexer, web app.

Legend: **M** = mitigated in code, **P** = mitigated by process/policy,
**O** = open (requires action before unrestricted Mainnet deposits).

## Onchain actors

| Threat | Vector | Mitigation | Status |
| --- | --- | --- | --- |
| Malicious organizer | Changes rules after approvals | Draft edits reset ALL approvals (`ApprovalsReset`); rules immutable after `lockRules`+activation | M |
| Malicious organizer | Self-favoring payout order | Every member must approve the exact order onchain before funding | M |
| Malicious member | Collects early, stops paying | Secure Circle: full commitment escrowed pre-activation; future contributions already collateralized | M |
| Malicious member | Double payout | `receivedPayout` flag + strictly increasing `currentRound`; invariant-tested | M |
| Anyone | Early settlement / round skipping | `RoundNotDue` check against `firstPayoutTime + round*frequency`; rounds advance one at a time | M |
| Anyone | Reentrancy via token/adapter callbacks | `ReentrancyGuard` on all fund-moving functions + checks-effects-interactions; tested with a reentrant token | M |
| Anyone | Duplicate members / recipients | Constructor rejects duplicates; payout order must be a permutation | M |
| Attacker | Activation front-running | Direct deployments (no proxy initialization to front-run); `setYieldAdapter` factory-only, Draft-only, once-only, adapter must be bound to this circle | M |
| Attacker | Fee-on-transfer / rebasing token drains escrow accounting | Balance-diff check on funding rejects skimming tokens; registry policy excludes rebasing/callback tokens | M |
| Attacker | Timestamp manipulation | Frequencies bounded ≥1 day; ±block-timestamp drift is immaterial at that scale | M |
| Attacker | Rounding exploitation of yield | Integer math; remainder carried in `pendingYield`; conservation fuzz+invariant tested | M |
| Admin | Withdraw principal / change recipients / fake payouts | No such functions exist on any contract; admin surface is: asset listing, caps, creation pause, fee ≤10% hard cap | M |
| Admin | Replace adapter on an active circle | Adapter reference settable only by factory in Draft, once | M |
| Admin key compromise | Config abuse | Ownable2Step to Safe multisig; creation-pause cannot trap funds; fee hard-capped onchain | M/P |

## External protocol risks

| Threat | Vector | Mitigation | Status |
| --- | --- | --- | --- |
| Aave pause/freeze | Withdrawals blocked | Solvency gate before every payout; Emergency state + pro-rata redemption; `maxWithdrawable` respects reserve liquidity | M |
| Aave supply-cap reached | Supply reverts at activation | Deploy-time reserve validation; activation revert is safe (funds stay in circle) | M/P |
| Aave liquidity shortage | Partial recoverability | Never a silent partial payout; `ShortfallRecorded` + deterministic equal pro-rata redemption | M |
| Asset depeg/freeze | Settlement token loses value or freezes | Registry policy: verified, liquid, non-pausable-preferred assets; risk disclosure to users | P |
| Oracle/rate failure | Wrong NGN estimate | NGN is display-only estimate with source+timestamp; never used in contract math | M |

## Offchain

| Threat | Vector | Mitigation | Status |
| --- | --- | --- | --- |
| Compromised backend | Fake balances / fake success | Frontend reads critical state from the chain; backend has no fund-moving endpoints; writes require wallet signatures | M |
| Compromised worker signer | Grief via settlement | Signer can only call permissionless functions; blast radius = gas money | M |
| Compromised RPC | Wrong data / censored txs | Chain-id validation at startup, fallback RPC support, explorer links let users verify independently | M/P |
| Compromised indexer | Poisoned read models | Indexer is never authoritative; action eligibility revalidated onchain | M |
| Session replay | Stolen nonce/signature | Single-use nonces with 5-min expiry, consumed atomically; domain+chain bound (EIP-4361); HTTP-only secure cookies | M |
| Notification spoofing | Phishing via fake emails | Notifications never contain transaction links that request signatures; documented user guidance | P |
| Database compromise | PII leak | Minimal PII (optional email only); no keys, no balances of record | M/P |
| Phishing / lost wallet | User loses key or signs malicious tx | Non-custodial by design; clear-signing assessment (ERC-7730) recommended; user education pages | P/O |

## Open items before unrestricted Mainnet deposits

1. External smart-contract audit (required; not started).
2. Legal review of the savings-circle product per jurisdiction.
3. Monad Foundry distribution validation of gas/opcode parity.
4. Aave Monad reserve verification (see MONAD_INTEGRATION_AUDIT.md).
5. Bug bounty / responsible disclosure program.
