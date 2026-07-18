# Monad Integration Audit

Record of every Monad-related tool, network value, and external dependency used
by MonSave, with its source and verification status.

**Rule:** nothing on this list may be "remembered" or copied from an old
article. Every value must be re-verified against official sources at deploy
time, and this file updated with the verification date.

| Item | Value used | Official source | Why required | Where used | Status |
| --- | --- | --- | --- | --- | --- |
| Monad Mainnet chain ID | `143` | https://docs.monad.xyz | Network identity, chain-mismatch guards | `packages/config/src/chains.ts`, deploy scripts, worker | Configured; re-verify at deploy |
| Monad Testnet chain ID | `10143` | https://docs.monad.xyz | Staging/QA network | same | Configured; re-verify at deploy |
| Mainnet RPC | `https://rpc.monad.xyz` | https://docs.monad.xyz | Default provider | `packages/config` | Configured; verify reachability + chain id at startup |
| Testnet RPC | `https://testnet-rpc.monad.xyz` | https://docs.monad.xyz | Staging provider | `packages/config` | Configured; verified at startup |
| Mainnet explorer | `https://monadscan.com` | https://docs.monad.xyz | Tx/address links, verification | `packages/config/src/explorers.ts`, `script/verify.sh` | Configured |
| Testnet explorer | `https://testnet.monadscan.com` | https://docs.monad.xyz | Staging links | same | Configured |
| Testnet faucet | `https://faucet.monad.xyz` | https://docs.monad.xyz | Testnet MON for QA | docs, onboarding | Configured |
| Native gas token | `MON` (18 decimals) | https://docs.monad.xyz | Gas estimates, balance checks | config, UI | Configured |
| Foundry toolchain | forge/cast/anvil/chisel `1.7.1` (stable) | https://github.com/foundry-rs/foundry / https://docs.monad.xyz/tooling-and-infra/toolkits/monad-foundry | Build, test, deploy, verify | `packages/contracts` | **Installed and used** — 73 tests pass. Monad-specific Foundry distribution should replace/validate this at deploy time per current Monad docs |
| Solidity | `0.8.28` (pinned) | https://soliditylang.org | Contract language | `foundry.toml` | Pinned |
| OpenZeppelin Contracts | `v5.1.0` (pinned git tag) | https://github.com/OpenZeppelin/openzeppelin-contracts | SafeERC20, Ownable2Step, ReentrancyGuard, ERC20 | `packages/contracts/lib` | Vendored at pinned tag |
| forge-std | `v1.9.6` (pinned git tag) | https://github.com/foundry-rs/forge-std | Test framework | `packages/contracts/lib` | Vendored at pinned tag |
| Reown AppKit | `@reown/appkit@1.6.8`, adapter-wagmi `1.6.8` | https://docs.monad.xyz/guides/reown / https://docs.reown.com | Wallet connection layer | `apps/web/src/lib/wagmi.ts` | Installed; requires `NEXT_PUBLIC_REOWN_PROJECT_ID` |
| wagmi / viem | `wagmi@2.14.11`, `viem@2.23.2` | https://wagmi.sh / https://viem.sh | Typed chain clients, simulation, receipts | web, worker | Installed |
| Envio HyperIndex | `envio@2.10.0` | https://docs.monad.xyz/guides/indexers / https://docs.envio.dev | Event indexing with reorg handling | `apps/indexer` | Configured; run `envio codegen` before first start |
| Aave V3 Monad market | **NOT YET VERIFIED** | https://aave.com/docs/resources/addresses + `@aave-dao/aave-address-book` | Yield strategy | `AaveV3MonadAdapter`, deploy script | **Blocked by policy**: addresses must be loaded from the official Aave Address Book at deploy time and verified onchain (bytecode, provider→pool resolution, reserve active/not-paused/not-frozen, supply cap, liquidity). No address is hardcoded anywhere in this repo. |
| Mainnet settlement stablecoin | **NOT YET VERIFIED** | Official Monad token list + Aave reserve data + onchain bytecode | Circle settlement asset | `SupportedAssetRegistry` (onchain), `packages/config/src/tokens.ts` | **Deliberately empty.** The registry is populated per network only after multi-source verification. The app shows honest "no supported asset configured" states until then. |
| Testnet settlement token | **NOT YET VERIFIED** | Official Monad testnet resources | Staging settlement asset | same | Same policy; testnet assets labeled "no monetary value" |
| Safe multisig on Monad | **NOT YET VERIFIED** | https://docs.safe.global + Monad deployment records | Production ownership | deploy scripts (`FINAL_OWNER_SAFE`) | Deploy script refuses to run without a configured Safe address; verify Safe contract support on Monad before Mainnet |
| Monskills | `therealharpaljadeja/monskills` | https://github.com/therealharpaljadeja/monskills | Monad development guidance | See `docs/BUILD_SKILLS.md` | Reviewed as guidance; addresses independently verified per policy above |
| NNS (Nad Name Service) Mainnet Universal Resolver adapter | `0x6ED8Ca3E2fEF58A82fc69B4037062445a3a32DfC` | https://docs.nad.domains/developers/contracts/contract-addresses | Resolve `.nad` names → address when adding circle members | `packages/config/src/nns.ts`, `apps/web/src/lib/nns.ts` | **Verified onchain** 2026-07-18: ~8KB bytecode on Monad Mainnet (143). ENS-compatible → used via viem `getEnsAddress`. |
| NNS Testnet Universal Resolver adapter | docs list `0xE451…d0F7` | same | Testnet name resolution | same | **NOT USED**: that address had **no bytecode** on Monad Testnet (10143) when checked 2026-07-18, so testnet name resolution is disabled and degrades honestly. Supply a verified testnet address to enable. |

## Unresolved configuration (must be closed before Mainnet)

1. **Aave V3 Monad addresses** — load from `@aave-dao/aave-address-book` at
   deploy time; run the 14-point validation in `script/Deploy.s.sol` +
   `docs/RUNBOOK_DEPLOY.md`.
2. **Settlement asset** — select and verify per section 11 policy; record all
   sources here.
3. **Safe address + threshold** — create, record owners/threshold in ops vault
   (never in the repo).
4. **MonadScan verifier API URL + key** — set `MONAD_*_VERIFIER_URL`,
   `MONADSCAN_API_KEY` in CI secrets.
5. **Monad Foundry distribution** — this build used upstream Foundry stable
   1.7.1 (Monad is EVM-equivalent; all tests pass). Before Mainnet, install the
   Monad Foundry distribution per current docs and re-run the full suite with
   `anvil --monad` so local gas/opcode behaviour matches Monad exactly.
