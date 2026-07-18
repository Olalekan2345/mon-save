#!/usr/bin/env bash
# MonSave — contract verification against MonadScan (Etherscan-compatible API).
# Usage: ./script/verify.sh testnet|mainnet
# Reads addresses from the deployment manifest written by Deploy.s.sol.
set -euo pipefail

NETWORK="${1:?usage: verify.sh testnet|mainnet}"

if [ "$NETWORK" = "mainnet" ]; then
  CHAIN_ID=143
  MANIFEST="deployments-out/monad-mainnet.json"
  VERIFIER_URL="${MONAD_MAINNET_VERIFIER_URL:?set MONAD_MAINNET_VERIFIER_URL (MonadScan API endpoint)}"
elif [ "$NETWORK" = "testnet" ]; then
  CHAIN_ID=10143
  MANIFEST="deployments-out/monad-testnet.json"
  VERIFIER_URL="${MONAD_TESTNET_VERIFIER_URL:?set MONAD_TESTNET_VERIFIER_URL (MonadScan API endpoint)}"
else
  echo "unknown network: $NETWORK" >&2; exit 1
fi

[ -f "$MANIFEST" ] || { echo "manifest not found: $MANIFEST — deploy first" >&2; exit 1; }

addr() { python3 -c "import json,sys;print(json.load(open('$MANIFEST'))['contracts']['$1'])" 2>/dev/null \
      || node -e "console.log(require('./$MANIFEST').contracts['$1'])"; }

verify() {
  local name="$1" contract="$2"
  local address; address="$(addr "$name")"
  echo "verifying $name at $address ..."
  forge verify-contract "$address" "$contract" \
    --chain-id "$CHAIN_ID" \
    --verifier etherscan \
    --verifier-url "$VERIFIER_URL" \
    --etherscan-api-key "${MONADSCAN_API_KEY:?set MONADSCAN_API_KEY}" \
    --watch
}

verify ProtocolTreasury src/ProtocolTreasury.sol:ProtocolTreasury
verify ProtocolConfig src/ProtocolConfig.sol:ProtocolConfig
verify SupportedAssetRegistry src/SupportedAssetRegistry.sol:SupportedAssetRegistry
verify CircleFactory src/CircleFactory.sol:CircleFactory

echo "done. SavingsCircle + adapter instances are verified per-deployment via"
echo "forge verify-contract once circles exist (same flags, constructor args from the creation tx)."
