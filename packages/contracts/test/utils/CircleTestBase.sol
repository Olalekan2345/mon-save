// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {SavingsCircle} from "../../src/SavingsCircle.sol";
import {CircleFactory} from "../../src/CircleFactory.sol";
import {ProtocolConfig} from "../../src/ProtocolConfig.sol";
import {SupportedAssetRegistry} from "../../src/SupportedAssetRegistry.sol";
import {ProtocolTreasury} from "../../src/ProtocolTreasury.sol";
import {TestERC20} from "../mocks/TestERC20.sol";
import {TestYieldAdapter} from "../mocks/TestYieldAdapter.sol";

/// @dev Shared fixture: 5 members, 5 rounds, 6-decimal stablecoin (USDC-like),
///      weekly frequency — mirrors the canonical ₦20,000-equivalent example.
abstract contract CircleTestBase is Test {
    uint8 internal constant DECIMALS = 6;
    uint256 internal constant CONTRIBUTION = 20e6; // 20 units, 6 decimals
    uint256 internal constant N = 5;
    uint256 internal constant FREQ = 7 days;
    uint256 internal constant WINDOW = 1 days;
    uint16 internal constant FEE_BPS = 500; // 5% of realized yield

    address internal gov = makeAddr("gov");
    address internal organizer;
    address[] internal members;

    TestERC20 internal token;
    ProtocolTreasury internal treasury;
    ProtocolConfig internal config;
    SupportedAssetRegistry internal registry;
    CircleFactory internal factory;

    SavingsCircle internal circle;
    TestYieldAdapter internal adapter;

    uint256 internal firstPayout;

    function setUp() public virtual {
        vm.warp(1_900_000_000); // deterministic base time

        token = new TestERC20("Test USD", "tUSD", DECIMALS);
        treasury = new ProtocolTreasury(gov);
        config = new ProtocolConfig(gov, address(treasury), FEE_BPS, 12);
        registry = new SupportedAssetRegistry(gov);
        factory = new CircleFactory(address(config), address(registry));

        vm.prank(gov);
        registry.configureAsset(address(token), false, address(0), address(0), 0, 0);

        for (uint256 i = 0; i < N; i++) {
            address m = makeAddr(string(abi.encodePacked("member", vm.toString(i))));
            members.push(m);
            token.mint(m, 1_000_000e6);
        }
        organizer = members[0];
        firstPayout = block.timestamp + 7 days;
    }

    function _createCircle(bool withYield) internal returns (SavingsCircle c) {
        vm.prank(organizer);
        address addr = factory.createCircle(
            CircleFactory.CreateParams({
                token: address(token),
                contributionPerRound: CONTRIBUTION,
                payoutOrder: members,
                frequency: FREQ,
                firstPayoutTime: firstPayout,
                payoutWindow: WINDOW,
                useYield: false,
                metadataURI: "ipfs://monsave-test"
            })
        );
        c = SavingsCircle(addr);
        if (withYield) {
            // bind a test adapter directly (unit tests only; factory wires the
            // real Aave adapter in production)
            adapter = new TestYieldAdapter(addr, address(token));
            vm.prank(address(factory));
            c.setYieldAdapter(address(adapter));
        }
    }

    function _approveAll(SavingsCircle c) internal {
        vm.prank(organizer);
        c.lockRules();
        for (uint256 i = 0; i < N; i++) {
            vm.prank(members[i]);
            c.approveRules();
        }
    }

    function _fundAll(SavingsCircle c) internal {
        uint256 commitment = c.memberCommitment();
        for (uint256 i = 0; i < N; i++) {
            vm.startPrank(members[i]);
            token.approve(address(c), commitment);
            c.fund();
            vm.stopPrank();
        }
    }

    function _activate(SavingsCircle c) internal {
        c.activate();
    }

    function _fullSetup(bool withYield) internal returns (SavingsCircle c) {
        c = _createCircle(withYield);
        _approveAll(c);
        _fundAll(c);
        _activate(c);
    }
}
