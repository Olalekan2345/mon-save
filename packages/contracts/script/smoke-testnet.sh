#!/usr/bin/env bash
# MonSave — Monad Testnet smoke test with REAL transactions.
# Drives a full 2-member Secure Circle up to activation, then settles round 1
# once it is due. Every step prints the real tx hash + explorer link.
#
# Required env:
#   RPC              Monad Testnet RPC (default https://testnet-rpc.monad.xyz)
#   ORGANIZER_KEY    path to organizer private-key file
#   MEMBER2_KEY      path to member-2 private-key file
#   MANIFEST         path to monad-testnet manifest JSON
set -euo pipefail

RPC="${RPC:-https://testnet-rpc.monad.xyz}"
CAST="${CAST:-cast}"
EXPLORER="https://testnet.monadscan.com"

ORGANIZER_KEY="${ORGANIZER_KEY:?path to organizer key file}"
MEMBER2_KEY="${MEMBER2_KEY:?path to member2 key file}"
MANIFEST="${MANIFEST:?path to manifest json}"

k1() { tr -d ' \r\n' < "$ORGANIZER_KEY"; }
k2() { tr -d ' \r\n' < "$MEMBER2_KEY"; }

FACTORY=$(node -e "console.log(require('$MANIFEST').contracts.CircleFactory)")
TOKEN=$(node -e "console.log(require('$MANIFEST').contracts.MonSaveTestUSD)")
ORG=$($CAST wallet address --private-key "$(k1)")
M2=$($CAST wallet address --private-key "$(k2)")

echo "factory:   $FACTORY"
echo "token:     $TOKEN"
echo "organizer: $ORG"
echo "member2:   $M2"

send() { # send <key> <to> <sig> [args...]
  local key="$1"; shift
  local out
  out=$($CAST send --rpc-url "$RPC" --private-key "$key" --json "$@")
  local hash
  hash=$(echo "$out" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).transactionHash))")
  echo "  tx: $EXPLORER/tx/$hash"
}

CONTRIB=20000000            # 20 tUSD (6 decimals)
NOW=$($CAST block latest --rpc-url "$RPC" --field timestamp)
FIRST_PAYOUT=$((NOW + 420)) # first round due ~7 minutes from now
FREQ=86400                  # daily
WINDOW=86400

echo "1) fund member2 with gas (0.3 MON)"
send "$(k1)" "$M2" --value 300000000000000000

echo "2) mint 1000 tUSD to member2 (open demo mint)"
send "$(k1)" "$TOKEN" "mint(address,uint256)" "$M2" 1000000000

echo "3) create circle (2 members, 20 tUSD/round, daily, first payout in ~7min)"
send "$(k1)" "$FACTORY" \
  "createCircle((address,uint256,address[],uint256,uint256,uint256,bool,string))" \
  "($TOKEN,$CONTRIB,[$ORG,$M2],$FREQ,$FIRST_PAYOUT,$WINDOW,false,\"monsave-smoke-test\")"

CIRCLE=$($CAST call --rpc-url "$RPC" "$FACTORY" "circlesByMember(address)(address[])" "$ORG" | tr -d '[]' | tr ',' '\n' | tail -1 | tr -d ' ')
echo "circle: $EXPLORER/address/$CIRCLE"

COMMITMENT=$((CONTRIB * 2))

echo "4) organizer locks rules"
send "$(k1)" "$CIRCLE" "lockRules()"

echo "5) both members approve rules onchain"
send "$(k1)" "$CIRCLE" "approveRules()"
send "$(k2)" "$CIRCLE" "approveRules()"

echo "6) both members approve token + escrow full commitment (40 tUSD each)"
send "$(k1)" "$TOKEN" "approve(address,uint256)" "$CIRCLE" "$COMMITMENT"
send "$(k1)" "$CIRCLE" "fund()"
send "$(k2)" "$TOKEN" "approve(address,uint256)" "$CIRCLE" "$COMMITMENT"
send "$(k2)" "$CIRCLE" "fund()"

echo "7) activate"
send "$(k1)" "$CIRCLE" "activate()"

STATE=$($CAST call --rpc-url "$RPC" "$CIRCLE" "state()(uint8)")
echo "circle state after activation: $STATE (3 = Active)"

echo "8) waiting for round 1 due time ($FIRST_PAYOUT)..."
while true; do
  NOW=$($CAST block latest --rpc-url "$RPC" --field timestamp)
  [ "$NOW" -ge "$FIRST_PAYOUT" ] && break
  sleep 15
done

echo "9) settle round 1 — executed by member2 to prove permissionlessness"
send "$(k2)" "$CIRCLE" "settleRound()"

PAID=$($CAST call --rpc-url "$RPC" "$CIRCLE" "totalPrincipalPaid()(uint256)")
echo "totalPrincipalPaid: $PAID (expected $((CONTRIB * 2)))"
echo "SMOKE TEST COMPLETE — round 2 settles after $FREQ seconds."
echo "circle: $EXPLORER/address/$CIRCLE"
