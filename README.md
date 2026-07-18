# MonSave

**Your money. Your turn. Our code.**

Ajo, onchain — the trustless savings circle that earns while it waits. Built on
Monad.

MonSave digitizes the Nigerian ajo/esusu rotating-savings tradition. A group
contributes a fixed amount each round; each round one member collects the whole
pot. Traditionally a human collector holds the money and the trust. MonSave
replaces the collector with smart-contract rules the whole group approved:

- **Secure Circles** — every member escrows their full commitment
  (contribution × rounds) before activation, so nobody can collect early and
  walk away. Genuinely trustless, honestly explained.
- **Earns while it waits** — idle principal can be supplied to Aave V3 on
  Monad; realized variable yield is tracked separately from principal,
  allocated fairly, and claimable per member. Never described as guaranteed.
- **Permissionless settlement** — anyone can execute a due payout; automation
  is a convenience, not a dependency.
- **No admin access to principal** — enforced in code: there is no function
  that lets any role withdraw member funds, change an active payout order, or
  fabricate yield.

## Monorepo

```
apps/
  web/        Next.js app (Reown AppKit + wagmi + viem, dark violet design system)
  api/        Fastify API (SIWE auth, Prisma/PostgreSQL, honest read models)
  indexer/    Envio HyperIndex config + handlers (reorg-aware, idempotent)
  worker/     Settlement automation (simulate → submit → confirm, observe-only without a signer)
packages/
  contracts/  Foundry: SavingsCircle, CircleFactory, AaveV3MonadAdapter,
              ProtocolConfig, SupportedAssetRegistry, ProtocolTreasury
              + 73 tests (unit, fuzz, invariant)
  config/     Single source of truth: chains, tokens, addresses, Zod-validated env
docs/         Integration audit, threat model, security architecture,
              emergency/shortfall spec, deploy runbook, Spark submission
deployments/  Per-network manifests (empty until a real deployment happens)
```

## Quickstart

Prereqs: Node ≥ 20, pnpm 9, Foundry (forge/cast/anvil), Docker (for API deps).

```bash
pnpm install

# contracts — build + full test suite (73 tests)
pnpm contracts:build
pnpm contracts:test

# local chain + deploy (guarded to chain 31337)
anvil                      # separate terminal
pnpm contracts:deploy:local

# web app
cp apps/web/.env.example apps/web/.env.local   # fill in values
pnpm --filter @monsave/web dev

# api (needs docker compose up -d for postgres/redis)
docker compose up -d
cp apps/api/.env.example apps/api/.env
pnpm --filter @monsave/api prisma:generate
pnpm --filter @monsave/api dev
```

## Networks

| Network | Chain ID | RPC | Explorer |
| --- | --- | --- | --- |
| Monad Mainnet | 143 | https://rpc.monad.xyz | https://monadscan.com |
| Monad Testnet | 10143 | https://testnet-rpc.monad.xyz | https://testnet.monadscan.com |
| Local Anvil | 31337 | http://127.0.0.1:8545 | — |

Each deployment serves exactly one network; the app never mixes networks and
blocks with a switch prompt on mismatch.

## Honest-data policy

No hardcoded users, balances, APYs, hashes or rates anywhere in production
paths. Every displayed value comes from confirmed contract state, indexed
events, or authenticated records — otherwise the UI shows a truthful empty
state. Test fixtures exist only inside isolated automated tests and the
chain-31337-guarded local deploy script.

## Status & disclosures

- Contracts compile and pass 73 Foundry tests (unit, fuzz, invariant) on
  Foundry stable 1.7.1.
- **Not yet deployed** to Monad Testnet/Mainnet from this repo — deployment
  requires the verification steps in `docs/RUNBOOK_DEPLOY.md` and
  `docs/MONAD_INTEGRATION_AUDIT.md` (Aave addresses and settlement assets are
  never guessed; the registries ship empty until verified).
- **No external audit yet.** Required before unrestricted public deposits.
- Community Circles (partial collateralization) are documented but not
  implemented onchain by design — a frontend flag cannot enable them.

## Docs

- [docs/MONAD_INTEGRATION_AUDIT.md](docs/MONAD_INTEGRATION_AUDIT.md)
- [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md)
- [docs/SECURITY_ARCHITECTURE.md](docs/SECURITY_ARCHITECTURE.md)
- [docs/EMERGENCY_AND_SHORTFALL.md](docs/EMERGENCY_AND_SHORTFALL.md)
- [docs/INCIDENT_RESPONSE.md](docs/INCIDENT_RESPONSE.md)
- [docs/RUNBOOK_DEPLOY.md](docs/RUNBOOK_DEPLOY.md)
- [docs/BUILD_SKILLS.md](docs/BUILD_SKILLS.md)
- [docs/SPARK_SUBMISSION.md](docs/SPARK_SUBMISSION.md)

## License

MIT
