# Build Skills Record

Record of skills/guides applied while building MonSave, per the build brief.

| Skill / guide | Version / ref | Date used | Decisions influenced | Files affected |
| --- | --- | --- | --- | --- |
| Monad docs — network parameters | docs.monad.xyz (2026-07) | 2026-07-17 | Chain IDs 143/10143, RPC + explorer + faucet URLs, MON gas token | `packages/config/src/chains.ts`, deploy scripts |
| Monad Foundry guidance | docs.monad.xyz/tooling-and-infra/toolkits/monad-foundry | 2026-07-17 | Foundry as the contract toolchain; profiles for local/ci/testnet/mainnet/fork; note to validate with `anvil --monad` pre-Mainnet | `packages/contracts/foundry.toml` |
| Reown AppKit Monad guide | docs.monad.xyz/guides/reown | 2026-07-17 | AppKit + wagmi adapter as wallet layer; single-network AppKit config | `apps/web/src/lib/wagmi.ts` |
| Monad indexer guidance | docs.monad.xyz/guides/indexers | 2026-07-17 | Envio HyperIndex as preferred indexer; dynamic contract registration from factory events | `apps/indexer/*` |
| Monskills (scaffold/addresses/concepts/wallet/indexer/deployment) | github.com/therealharpaljadeja/monskills | 2026-07-17 | Used as guidance for repo layout and Monad-native patterns. **Guidance rejected:** any remembered/copied contract addresses — policy requires independent verification against official sources + onchain bytecode, so all address slots ship empty until verified (see MONAD_INTEGRATION_AUDIT.md) | monorepo layout, docs |
| Impeccable (design quality) | github.com/pbakaus/impeccable | 2026-07-17 | Design-token system (night/violet ramps, semantic status colors), restrained motion, reduced-motion support, focus-visible states, honest empty states | `apps/web/tailwind.config.ts`, `globals.css`, components |
| Aave developer docs + Address Book | aave.com/docs, github.com/aave-dao/aave-address-book | 2026-07-17 | Adapter is supply/withdraw only; 14-point deploy-time reserve validation; addresses never hand-typed | `src/adapters/AaveV3MonadAdapter.sol`, `script/Deploy.s.sol` |
| Spark hackathon brief | buildanything.so/hackathons/spark | 2026-07-17 | Submission package structure | `docs/SPARK_SUBMISSION.md` |

## Environment note

This build ran in a network-restricted environment: skill repos and docs could
not be fetched live at build time, so their guidance was applied from the
brief's stated requirements and the team's knowledge of the referenced tools.
**Action before deploy:** re-run `npx skills add therealharpaljadeja/monskills`
(or the current documented installer), re-read the live Monad/Aave/Reown docs,
and update this table plus MONAD_INTEGRATION_AUDIT.md with anything that
changed.
