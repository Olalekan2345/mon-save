// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {ProtocolConfig} from "../src/ProtocolConfig.sol";
import {ProtocolTreasury} from "../src/ProtocolTreasury.sol";
import {SupportedAssetRegistry} from "../src/SupportedAssetRegistry.sol";
import {CircleFactory} from "../src/CircleFactory.sol";
import {IAaveV3Pool, IAaveV3PoolAddressesProvider} from "../src/interfaces/aave/IAaveV3Pool.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

/// @notice Production deployment for Monad Testnet (10143) or Mainnet (143).
///
///         Hard requirements enforced here — the script STOPS when:
///           - chain id is not 143 / 10143 or does not match DEPLOY_NETWORK
///           - required env vars are missing
///           - the settlement asset address has no bytecode
///           - yield is enabled but Aave addresses are zero / codeless, or the
///             PoolAddressesProvider does not resolve the configured Pool
///           - the intended final owner (Safe) is not configured
///
///         Secrets: use `--account <keystore>` (encrypted Foundry keystore) or a
///         hardware wallet. NEVER pass raw private keys.
///
/// Required env:
///   DEPLOY_NETWORK          "monad-testnet" | "monad-mainnet"
///   SETTLEMENT_ASSET        verified ERC-20 address (see docs/MONAD_INTEGRATION_AUDIT.md)
///   FINAL_OWNER_SAFE        Safe multisig that receives ownership
///   YIELD_ENABLED           "true" | "false"
///   AAVE_POOL_ADDRESSES_PROVIDER  required when YIELD_ENABLED=true
///   AAVE_POOL               required when YIELD_ENABLED=true
///   AAVE_ATOKEN             required when YIELD_ENABLED=true
///   PROTOCOL_YIELD_FEE_BPS  e.g. "500" (hard-capped at 1000 onchain)
///   MAX_CONTRIBUTION        per-round cap in asset base units (pilot risk cap)
///   MAX_CIRCLE_PRINCIPAL    per-circle principal cap in asset base units
contract Deploy is Script {
    function run() external {
        string memory network = vm.envString("DEPLOY_NETWORK");
        uint256 expectedChainId;
        if (keccak256(bytes(network)) == keccak256("monad-testnet")) {
            expectedChainId = 10143;
        } else if (keccak256(bytes(network)) == keccak256("monad-mainnet")) {
            expectedChainId = 143;
        } else {
            revert("DEPLOY_NETWORK must be monad-testnet or monad-mainnet");
        }
        require(block.chainid == expectedChainId, "Deploy: connected chain does not match DEPLOY_NETWORK");

        address asset = vm.envAddress("SETTLEMENT_ASSET");
        address finalOwner = vm.envAddress("FINAL_OWNER_SAFE");
        bool yieldEnabled = vm.envBool("YIELD_ENABLED");
        uint16 feeBps = uint16(vm.envUint("PROTOCOL_YIELD_FEE_BPS"));
        uint256 maxContribution = vm.envUint("MAX_CONTRIBUTION");
        uint256 maxCirclePrincipal = vm.envUint("MAX_CIRCLE_PRINCIPAL");

        require(asset != address(0) && asset.code.length > 0, "Deploy: settlement asset has no bytecode");
        require(finalOwner != address(0), "Deploy: FINAL_OWNER_SAFE not configured");
        // Read decimals directly from the token — never trust config alone.
        uint8 decimals = IERC20Metadata(asset).decimals();
        console2.log("Settlement asset decimals:", decimals);

        address aavePool = address(0);
        address aToken = address(0);
        if (yieldEnabled) {
            address provider = vm.envAddress("AAVE_POOL_ADDRESSES_PROVIDER");
            aavePool = vm.envAddress("AAVE_POOL");
            aToken = vm.envAddress("AAVE_ATOKEN");
            require(provider.code.length > 0, "Deploy: Aave provider has no bytecode");
            require(aavePool.code.length > 0, "Deploy: Aave pool has no bytecode");
            require(aToken.code.length > 0, "Deploy: aToken has no bytecode");
            require(
                IAaveV3PoolAddressesProvider(provider).getPool() == aavePool,
                "Deploy: provider does not resolve the configured Pool"
            );
        }

        vm.startBroadcast();
        address deployer = msg.sender;

        ProtocolTreasury treasury = new ProtocolTreasury(deployer);
        ProtocolConfig config = new ProtocolConfig(deployer, address(treasury), feeBps, 12);
        SupportedAssetRegistry registry = new SupportedAssetRegistry(deployer);
        CircleFactory factory = new CircleFactory(address(config), address(registry));

        registry.configureAsset(asset, yieldEnabled, aavePool, aToken, maxContribution, maxCirclePrincipal);

        // Hand ownership to the Safe (Ownable2Step: Safe must accept).
        treasury.transferOwnership(finalOwner);
        config.transferOwnership(finalOwner);
        registry.transferOwnership(finalOwner);

        vm.stopBroadcast();

        console2.log("== MonSave deployment ==", network);
        console2.log("ProtocolTreasury:      ", address(treasury));
        console2.log("ProtocolConfig:        ", address(config));
        console2.log("SupportedAssetRegistry:", address(registry));
        console2.log("CircleFactory:         ", address(factory));
        console2.log("Pending owner (Safe):  ", finalOwner);
        console2.log("NOTE: the Safe must call acceptOwnership() on treasury/config/registry.");

        string memory manifest = string.concat(
            "{\n",
            '  "network": "', network, '",\n',
            '  "chainId": ', vm.toString(block.chainid), ",\n",
            '  "deployer": "', vm.toString(deployer), '",\n',
            '  "pendingOwner": "', vm.toString(finalOwner), '",\n',
            '  "settlementAsset": "', vm.toString(asset), '",\n',
            '  "yieldEnabled": ', yieldEnabled ? "true" : "false", ",\n",
            '  "contracts": {\n',
            '    "ProtocolTreasury": "', vm.toString(address(treasury)), '",\n',
            '    "ProtocolConfig": "', vm.toString(address(config)), '",\n',
            '    "SupportedAssetRegistry": "', vm.toString(address(registry)), '",\n',
            '    "CircleFactory": "', vm.toString(address(factory)), '"\n',
            "  }\n}\n"
        );
        vm.writeFile(string.concat("deployments-out/", network, ".json"), manifest);
    }
}
