// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ProtocolConfig} from "../src/ProtocolConfig.sol";
import {ProtocolTreasury} from "../src/ProtocolTreasury.sol";
import {SupportedAssetRegistry} from "../src/SupportedAssetRegistry.sol";
import {CircleFactory} from "../src/CircleFactory.sol";

/// @notice Clearly-labeled, valueless Monad TESTNET demo token.
///         Name and symbol state the network and the absence of value.
///         This contract is deployable ONLY by the testnet demo script below
///         (chain-id guarded) and is never part of Mainnet deployment.
contract MonSaveTestUSD is ERC20 {
    constructor() ERC20("MonSave Testnet USD (no monetary value)", "tUSD") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @dev Open faucet-style mint, capped per call. Fine for a valueless
    ///      testnet demo asset; impossible to confuse with a real stablecoin.
    function mint(address to, uint256 amount) external {
        require(amount <= 1_000_000e6, "mint: max 1,000,000 tUSD per call");
        _mint(to, amount);
    }
}

/// @notice MONAD TESTNET (10143) demo deployment.
///
///         Differences from the production Deploy.s.sol, all intentional and
///         acceptable only because Testnet assets have no monetary value:
///           - deploys the labeled MonSaveTestUSD demo token
///           - ownership stays with the deployer (no Safe on a demo)
///           - yield disabled (no verified Aave market on Monad Testnet)
///
///         Hard guard: refuses to run on any chain except 10143.
contract DeployTestnetDemo is Script {
    function run() external {
        require(block.chainid == 10143, "DeployTestnetDemo: Monad Testnet (10143) only");

        vm.startBroadcast();
        address deployer = msg.sender;

        MonSaveTestUSD token = new MonSaveTestUSD();
        ProtocolTreasury treasury = new ProtocolTreasury(deployer);
        ProtocolConfig config = new ProtocolConfig(deployer, address(treasury), 500, 12);
        SupportedAssetRegistry registry = new SupportedAssetRegistry(deployer);
        CircleFactory factory = new CircleFactory(address(config), address(registry));

        // Register the demo token: yield disabled, generous demo caps
        registry.configureAsset(
            address(token),
            false, // yieldEnabled — no verified Aave market on Monad Testnet
            address(0),
            address(0),
            1_000_000e6, // max contribution per round (demo cap)
            100_000_000e6 // max circle principal (demo cap)
        );

        // Seed the deployer with demo tokens for the walkthrough
        token.mint(deployer, 1_000_000e6);

        vm.stopBroadcast();

        console2.log("== MonSave - Monad Testnet demo deployment ==");
        console2.log("MonSaveTestUSD (tUSD, valueless):", address(token));
        console2.log("ProtocolTreasury:               ", address(treasury));
        console2.log("ProtocolConfig:                 ", address(config));
        console2.log("SupportedAssetRegistry:         ", address(registry));
        console2.log("CircleFactory:                  ", address(factory));

        string memory manifest = string.concat(
            "{\n",
            '  "network": "monad-testnet",\n',
            '  "chainId": 10143,\n',
            '  "deployer": "', vm.toString(deployer), '",\n',
            '  "note": "Testnet demo deployment. tUSD is a labeled, valueless demo token. Yield disabled (no verified Aave market on Monad Testnet).",\n',
            '  "contracts": {\n',
            '    "MonSaveTestUSD": "', vm.toString(address(token)), '",\n',
            '    "ProtocolTreasury": "', vm.toString(address(treasury)), '",\n',
            '    "ProtocolConfig": "', vm.toString(address(config)), '",\n',
            '    "SupportedAssetRegistry": "', vm.toString(address(registry)), '",\n',
            '    "CircleFactory": "', vm.toString(address(factory)), '"\n',
            "  }\n}\n"
        );
        vm.writeFile("deployments-out/monad-testnet.json", manifest);
    }
}
