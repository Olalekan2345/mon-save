// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {ProtocolConfig} from "../src/ProtocolConfig.sol";
import {ProtocolTreasury} from "../src/ProtocolTreasury.sol";
import {SupportedAssetRegistry} from "../src/SupportedAssetRegistry.sol";
import {CircleFactory} from "../src/CircleFactory.sol";
import {TestERC20} from "../test/mocks/TestERC20.sol";

/// @notice LOCAL-ONLY deployment for Anvil (chain 31337). Deploys a test token
///         for development. This script is guarded so it can NEVER run against
///         a public network — the test token must never reach Testnet/Mainnet.
contract DeployLocal is Script {
    function run() external {
        require(block.chainid == 31337, "DeployLocal: local Anvil only (chainid 31337)");

        vm.startBroadcast();

        address deployer = msg.sender;
        TestERC20 token = new TestERC20("Local Test USD", "ltUSD", 6);
        ProtocolTreasury treasury = new ProtocolTreasury(deployer);
        ProtocolConfig config = new ProtocolConfig(deployer, address(treasury), 500, 12);
        SupportedAssetRegistry registry = new SupportedAssetRegistry(deployer);
        CircleFactory factory = new CircleFactory(address(config), address(registry));

        registry.configureAsset(address(token), false, address(0), address(0), 0, 0);

        vm.stopBroadcast();

        console2.log("== MonSave local deployment ==");
        console2.log("TestERC20 (local only):", address(token));
        console2.log("ProtocolTreasury:      ", address(treasury));
        console2.log("ProtocolConfig:        ", address(config));
        console2.log("SupportedAssetRegistry:", address(registry));
        console2.log("CircleFactory:         ", address(factory));

        string memory manifest = string.concat(
            "{\n",
            '  "network": "local",\n',
            '  "chainId": 31337,\n',
            '  "contracts": {\n',
            '    "TestERC20": "', vm.toString(address(token)), '",\n',
            '    "ProtocolTreasury": "', vm.toString(address(treasury)), '",\n',
            '    "ProtocolConfig": "', vm.toString(address(config)), '",\n',
            '    "SupportedAssetRegistry": "', vm.toString(address(registry)), '",\n',
            '    "CircleFactory": "', vm.toString(address(factory)), '"\n',
            "  }\n}\n"
        );
        vm.writeFile("deployments-out/local.json", manifest);
    }
}
