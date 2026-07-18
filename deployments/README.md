# Deployment manifests

One directory per network. Each deployed contract record must include:

- network name + chain ID
- contract name + address
- constructor/initializer args
- deployment tx hash + block
- deployer address + final owner (Safe)
- git commit, Solidity version, Foundry version
- source-verification status + runtime bytecode hash
- ABI version + deployment timestamp

`deployments/local/` may be overwritten freely. `monad-testnet/` and
`monad-mainnet/` manifests must NEVER be overwritten without explicit
confirmation — add new files with timestamps for redeployments.

No manifests exist yet for public networks: MonSave has not been deployed to
Monad Testnet or Mainnet from this repository. The deploy scripts in
`packages/contracts/script/` generate these records.
