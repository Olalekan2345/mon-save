# MonSave — agent notes

Monorepo: pnpm + Turborepo. Apps: web (Next.js 15 + Reown AppKit + wagmi/viem),
api (Fastify + Prisma), indexer (Envio), worker (viem automation). Packages:
contracts (Foundry), config (typed chains/tokens/env).

## Local toolchain quirks (this machine)

- pnpm lives at `C:\npm\pnpm.cmd` — prepend `C:\npm` to PATH.
- forge/cast/anvil live at `C:\Users\USER\.foundry\bin\` — not on PATH.
- Root `package.json` pins `@wagmi/connectors@5.7.7` via pnpm.overrides —
  do not remove, or the AppKit adapter pulls wagmi-v3-line connectors and the
  web build breaks.
- `apps/web/tsconfig.json` pins `"types": ["node","react","react-dom"]` to
  block implicit @types inclusion (chrome/eslint errors otherwise).

## Commands

- Contracts: `forge build`, `forge test` (73 tests) from `packages/contracts`.
- Web: `pnpm --filter @monsave/web build`.
- Full stack deps: `docker compose up -d` (postgres + redis).

## Hard policies (from the product brief — do not violate)

- No fabricated data anywhere: no hardcoded users, balances, APYs, tx hashes,
  rates. Empty states must tell the truth.
- No guessed contract addresses. Aave/token/Safe addresses stay empty until
  verified per `docs/MONAD_INTEGRATION_AUDIT.md`.
- Never describe yield as guaranteed/risk-free; never show an "Audited" badge.
- Test-only contracts live in `packages/contracts/test/` and must never enter
  production deploy scripts (Deploy.s.sol) or manifests.
- Success UI only after onchain confirmation, never on click/hash.
- Secure Circle only onchain; Community Circle is docs-only by design.
