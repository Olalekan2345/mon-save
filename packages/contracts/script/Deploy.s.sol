// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {ProtocolConfig} from "../src/ProtocolConfig.sol";
import {ProtocolTreasury} from "../src/ProtocolTreasury.sol";
import {SupportedAssetRegistry} from "../src/SupportedAssetRegistry.sol";
import {CircleFactory} from "../src/CircleFactory.sol";
import {IAaveV3PoolAddressesProvider} from "../src/interfaces/aave/IAaveV3Pool.sol";
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
    struct Params {
        string network;
        address asset;
        address finalOwner;
        bool yieldEnabled;
        uint16 feeBps;
        uint256 maxContribution;
        uint256 maxCirclePrincipal;
        address aavePool;
        address aToken;
    }

    struct Deployed {
        address treasury;
        address config;
        address registry;
        address factory;
        address deployer;
    }

    function run() external {
        Params memory p = _loadAndValidate();
        Deployed memory d = _deploy(p);
        _report(p, d);
    }

    function _loadAndValidate() internal view returns (Params memory p) {
        p.network = vm.envString("DEPLOY_NETWORK");
        uint256 expectedChainId;
        if (keccak256(bytes(p.network)) == keccak256("monad-testnet")) {
            expectedChainId = 10143;
        } else if (keccak256(bytes(p.network)) == keccak256("monad-mainnet")) {
            expectedChainId = 143;
        } else {
            revert("DEPLOY_NETWORK must be monad-testnet or monad-mainnet");
        }
        require(block.chainid == expectedChainId, "Deploy: connected chain does not match DEPLOY_NETWORK");

        p.asset = vm.envAddress("SETTLEMENT_ASSET");
        p.finalOwner = vm.envAddress("FINAL_OWNER_SAFE");
        p.yieldEnabled = vm.envBool("YIELD_ENABLED");
        p.feeBps = uint16(vm.envUint("PROTOCOL_YIELD_FEE_BPS"));
        p.maxContribution = vm.envUint("MAX_CONTRIBUTION");
        p.maxCirclePrincipal = vm.envUint("MAX_CIRCLE_PRINCIPAL");

        require(p.asset != address(0) && p.asset.code.length > 0, "Deploy: settlement asset has no bytecode");
        require(p.finalOwner != address(0), "Deploy: FINAL_OWNER_SAFE not configured");
        // Read decimals directly from the token — never trust config alone.
        console2.log("Settlement asset decimals:", IERC20Metadata(p.asset).decimals());

        if (p.yieldEnabled) {
            address provider = vm.envAddress("AAVE_POOL_ADDRESSES_PROVIDER");
            p.aavePool = vm.envAddress("AAVE_POOL");
            p.aToken = vm.envAddress("AAVE_ATOKEN");
            require(provider.code.length > 0, "Deploy: Aave provider has no bytecode");
            require(p.aavePool.code.length > 0, "Deploy: Aave pool has no bytecode");
            require(p.aToken.code.length > 0, "Deploy: aToken has no bytecode");
            require(
                IAaveV3PoolAddressesProvider(provider).getPool() == p.aavePool,
                "Deploy: provider does not resolve the configured Pool"
            );
        }
    }

    function _deploy(Params memory p) internal returns (Deployed memory d) {
        vm.startBroadcast();
        d.deployer = msg.sender;

        ProtocolTreasury treasury = new ProtocolTreasury(d.deployer);
        ProtocolConfig config = new ProtocolConfig(d.deployer, address(treasury), p.feeBps, 12);
        SupportedAssetRegistry registry = new SupportedAssetRegistry(d.deployer);
        CircleFactory factory = new CircleFactory(address(config), address(registry));

        registry.configureAsset(p.asset, p.yieldEnabled, p.aavePool, p.aToken, p.maxContribution, p.maxCirclePrincipal);

        // Hand ownership to the Safe (Ownable2Step: Safe must accept).
        treasury.transferOwnership(p.finalOwner);
        config.transferOwnership(p.finalOwner);
        registry.transferOwnership(p.finalOwner);

        vm.stopBroadcast();

        d.treasury = address(treasury);
        d.config = address(config);
        d.registry = address(registry);
        d.factory = address(factory);
    }

    function _report(Params memory p, Deployed memory d) internal {
        console2.log("== MonSave deployment ==", p.network);
        console2.log("ProtocolTreasury:      ", d.treasury);
        console2.log("ProtocolConfig:        ", d.config);
        console2.log("SupportedAssetRegistry:", d.registry);
        console2.log("CircleFactory:         ", d.factory);
        console2.log("Pending owner (Safe):  ", p.finalOwner);
        console2.log("NOTE: the Safe must call acceptOwnership() on treasury/config/registry.");

        string memory head = string.concat(
            "{\n",
            '  "network": "', p.network, '",\n',
            '  "chainId": ', vm.toString(block.chainid), ",\n",
            '  "deployer": "', vm.toString(d.deployer), '",\n',
            '  "pendingOwner": "', vm.toString(p.finalOwner), '",\n',
            '  "settlementAsset": "', vm.toString(p.asset), '",\n',
            '  "yieldEnabled": ', p.yieldEnabled ? "true" : "false", ",\n"
        );
        string memory body = string.concat(
            '  "contracts": {\n',
            '    "ProtocolTreasury": "', vm.toString(d.treasury), '",\n',
            '    "ProtocolConfig": "', vm.toString(d.config), '",\n',
            '    "SupportedAssetRegistry": "', vm.toString(d.registry), '",\n',
            '    "CircleFactory": "', vm.toString(d.factory), '"\n',
            "  }\n}\n"
        );
        vm.writeFile(string.concat("deployments-out/", p.network, ".json"), string.concat(head, body));
    }
}
