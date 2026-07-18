// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {TestYieldPool} from "../src/testnet/TestYieldPool.sol";
import {SupportedAssetRegistry} from "../src/SupportedAssetRegistry.sol";

/// @notice MONAD TESTNET (10143) ONLY — deploy the labeled demo yield pool and
///         re-register the demo tUSD token with yield enabled against it. This
///         intentionally deploys a simulated-yield contract for demonstration;
///         it is chain-guarded to testnet and must never touch mainnet.
///
/// Env:
///   TEST_YIELD_TOKEN     the tUSD demo token address
///   TEST_YIELD_REGISTRY  the SupportedAssetRegistry address (owned by deployer)
///   TEST_YIELD_APY_BPS   fixed demo APY in bps (e.g. 500 = 5%)
///   TEST_YIELD_RESERVE   reserve to pre-fund, in token base units
contract DeployTestYield is Script {
    function run() external {
        require(block.chainid == 10143, "DeployTestYield: Monad Testnet (10143) only");

        address token = vm.envAddress("TEST_YIELD_TOKEN");
        address registryAddr = vm.envAddress("TEST_YIELD_REGISTRY");
        uint16 apyBps = uint16(vm.envUint("TEST_YIELD_APY_BPS"));
        uint256 reserve = vm.envUint("TEST_YIELD_RESERVE");

        vm.startBroadcast();

        TestYieldPool pool = new TestYieldPool();
        pool.init(token, apyBps);
        address aToken = address(pool.aToken());
        pool.fundReserve(reserve);

        // re-register the demo token with yield enabled, pointing at the pool.
        // Generous demo caps (0 = uncapped) since the asset is valueless.
        SupportedAssetRegistry(registryAddr).configureAsset(token, true, address(pool), aToken, 0, 0);

        vm.stopBroadcast();

        console2.log("== MonSave testnet DEMO yield pool ==");
        console2.log("TestYieldPool: ", address(pool));
        console2.log("TestYieldAToken:", aToken);
        console2.log("APY bps (demo):", apyBps);
        console2.log("Reserve funded:", reserve);
        console2.log("tUSD re-registered with yield enabled.");

        string memory manifest = string.concat(
            "{\n",
            '  "network": "monad-testnet",\n',
            '  "chainId": 10143,\n',
            '  "note": "SIMULATED test yield for demonstration on a valueless testnet token. Not a real market.",\n',
            '  "apyBps": ', vm.toString(uint256(apyBps)), ",\n",
            '  "contracts": {\n',
            '    "TestYieldPool": "', vm.toString(address(pool)), '",\n',
            '    "TestYieldAToken": "', vm.toString(aToken), '"\n',
            "  }\n}\n"
        );
        vm.writeFile("deployments-out/monad-testnet-yield.json", manifest);
    }
}
