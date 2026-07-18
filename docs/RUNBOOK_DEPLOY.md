# Deployment Runbook

## Signer policy

Use an encrypted Foundry keystore (`cast wallet import monsave-deployer ...`)
or a hardware wallet. Raw private keys must never appear in code, env files,
scripts, shells history or CI logs.

## Local (Anvil, chain 31337)

```bash
# 1. start a local node (use `anvil --monad` when the Monad distribution is installed)
anvil

# 2. deploy — guarded to chain 31337 only; deploys a local-only test token
pnpm contracts:deploy:local

# 3. run the full lifecycle test suite against the same code
pnpm contracts:test
```

The local manifest is written to `packages/contracts/deployments-out/local.json`;
copy it to `deployments/local/` and set `NEXT_PUBLIC_CIRCLE_FACTORY_ADDRESS`
in `apps/web/.env.local` to use the app against Anvil.

## Testnet (chain 10143)

Preconditions — the script stops if any fail:
- `DEPLOY_NETWORK=monad-testnet` and RPC actually serves chain 10143
- `SETTLEMENT_ASSET` is a verified Testnet token with bytecode
- `FINAL_OWNER_SAFE` configured
- deployer has Testnet MON (faucet: https://faucet.monad.xyz)
- working tree clean; all 73 tests green

```bash
export MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
export DEPLOY_NETWORK=monad-testnet
export SETTLEMENT_ASSET=0x...   # verified per MONAD_INTEGRATION_AUDIT.md
export FINAL_OWNER_SAFE=0x...
export YIELD_ENABLED=false      # true only with a verified Testnet Aave market
export PROTOCOL_YIELD_FEE_BPS=500
export MAX_CONTRIBUTION=...     # pilot cap, asset base units
export MAX_CIRCLE_PRINCIPAL=...

pnpm contracts:deploy:testnet
pnpm contracts:verify:testnet   # requires MONADSCAN_API_KEY + verifier URL
```

Post-deploy checklist:
1. Copy `deployments-out/monad-testnet.json` → `deployments/monad-testnet/manifest.json`
   and enrich with deploy block, git commit, solc + foundry versions, bytecode hash.
2. Safe accepts ownership (`acceptOwnership()` on treasury/config/registry).
3. Point `apps/indexer/config.yaml` at the factory address + deployment block; run `envio codegen && envio dev`.
4. Set the factory address in web + api + worker env.
5. Run real smoke tests: create a 2-member circle, approve, fund, activate,
   warp… wait for the due time, settle, verify explorer links.
6. Confirm **no test-only contract** was deployed (the production script cannot
   deploy them — verify the manifest anyway).

## Mainnet (chain 143)

Everything above, plus — in order, stopping on any failure:
1. Full test suite + Slither + gas snapshot in CI, green on the exact commit.
2. Fork tests against Mainnet RPC for the Aave integration.
3. Aave market validation (the deploy script enforces provider→pool resolution
   and bytecode presence; additionally verify reserve active/not paused/not
   frozen/supply cap/liquidity via the Aave Address Book data).
4. Safe address validated (correct owners + threshold, test transaction done).
5. Deposit caps set deliberately low for the pilot (`MAX_CONTRIBUTION`,
   `MAX_CIRCLE_PRINCIPAL`).
6. Explicit human confirmation — Mainnet deployment is never triggered by an
   ordinary push (see `.github/workflows/deploy-mainnet.yml`: protected
   environment + manual approval).
7. Deploy, verify all four contracts, Safe accepts ownership.
8. Read-only smoke tests, then ONE deliberately capped pilot circle after
   explicit authorization.
9. Record the manifest in `deployments/monad-mainnet/` — never overwrite an
   existing manifest without explicit confirmation.
