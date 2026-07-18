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

contract CircleFuzzTest is Test {
    address internal gov = makeAddr("gov");

    ProtocolTreasury internal treasury;
    ProtocolConfig internal config;
    SupportedAssetRegistry internal registry;
    CircleFactory internal factory;

    function setUp() public {
        vm.warp(1_900_000_000);
        treasury = new ProtocolTreasury(gov);
        config = new ProtocolConfig(gov, address(treasury), 500, 12);
        registry = new SupportedAssetRegistry(gov);
        factory = new CircleFactory(address(config), address(registry));
    }

    /// @dev Full lifecycle holds for any contribution, member count, frequency
    ///      and token decimals within protocol bounds.
    function testFuzz_fullLifecycle(uint256 contribution, uint8 memberCount, uint256 frequency, uint8 decimals)
        public
    {
        contribution = bound(contribution, 1, 1e30);
        memberCount = uint8(bound(memberCount, 2, 8));
        frequency = bound(frequency, 1 days, 45 days);
        decimals = uint8(bound(decimals, 6, 18));

        TestERC20 token = new TestERC20("Fuzz", "FZZ", decimals);
        vm.prank(gov);
        registry.configureAsset(address(token), false, address(0), address(0), 0, 0);

        address[] memory ms = new address[](memberCount);
        for (uint256 i = 0; i < memberCount; i++) {
            ms[i] = makeAddr(string(abi.encodePacked("fz", vm.toString(i))));
        }

        uint256 firstPayout = block.timestamp + 3 days;
        vm.prank(ms[0]);
        address addr = factory.createCircle(
            CircleFactory.CreateParams({
                token: address(token),
                contributionPerRound: contribution,
                payoutOrder: ms,
                frequency: frequency,
                firstPayoutTime: firstPayout,
                payoutWindow: 1 days,
                useYield: false,
                metadataURI: ""
            })
        );
        SavingsCircle c = SavingsCircle(addr);

        vm.prank(ms[0]);
        c.lockRules();
        for (uint256 i = 0; i < memberCount; i++) {
            vm.prank(ms[i]);
            c.approveRules();
        }
        uint256 commitment = c.memberCommitment();
        for (uint256 i = 0; i < memberCount; i++) {
            token.mint(ms[i], commitment);
            vm.startPrank(ms[i]);
            token.approve(address(c), commitment);
            c.fund();
            vm.stopPrank();
        }
        c.activate();

        for (uint256 r = 0; r < memberCount; r++) {
            vm.warp(firstPayout + r * frequency);
            uint256 before = token.balanceOf(ms[r]);
            c.settleRound();
            assertEq(token.balanceOf(ms[r]) - before, c.roundPot());
        }

        assertEq(uint256(c.state()), uint256(SavingsCircle.State.Completed));
        assertEq(c.totalPrincipalPaid(), c.totalPrincipalFunded());
        assertEq(token.balanceOf(address(c)), 0);
    }

    /// @dev Yield allocation + fee + remainder never exceeds realized yield,
    ///      for arbitrary yield amounts including rounding boundaries.
    function testFuzz_yieldConservation(uint256 yield1, uint256 yield2) public {
        yield1 = bound(yield1, 0, 1e30);
        yield2 = bound(yield2, 0, 1e30);

        TestERC20 token = new TestERC20("Fuzz", "FZZ", 6);
        vm.prank(gov);
        registry.configureAsset(address(token), false, address(0), address(0), 0, 0);

        uint256 n = 3;
        address[] memory ms = new address[](n);
        for (uint256 i = 0; i < n; i++) {
            ms[i] = makeAddr(string(abi.encodePacked("fy", vm.toString(i))));
        }
        uint256 firstPayout = block.timestamp + 3 days;
        vm.prank(ms[0]);
        address addr = factory.createCircle(
            CircleFactory.CreateParams({
                token: address(token),
                contributionPerRound: 100e6,
                payoutOrder: ms,
                frequency: 7 days,
                firstPayoutTime: firstPayout,
                payoutWindow: 1 days,
                useYield: false,
                metadataURI: ""
            })
        );
        SavingsCircle c = SavingsCircle(addr);
        TestYieldAdapter adapter = new TestYieldAdapter(addr, address(token));
        vm.prank(address(factory));
        c.setYieldAdapter(address(adapter));

        vm.prank(ms[0]);
        c.lockRules();
        for (uint256 i = 0; i < n; i++) {
            vm.prank(ms[i]);
            c.approveRules();
        }
        uint256 commitment = c.memberCommitment();
        for (uint256 i = 0; i < n; i++) {
            token.mint(ms[i], commitment);
            vm.startPrank(ms[i]);
            token.approve(address(c), commitment);
            c.fund();
            vm.stopPrank();
        }
        c.activate();

        adapter.simulateYield(yield1);
        c.checkpointYield();
        adapter.simulateYield(yield2);
        c.checkpointYield();

        uint256 realized = c.grossYieldRealized();
        assertEq(realized, yield1 + yield2);
        assertLe(c.totalYieldAllocated() + c.protocolFeeAccrued() + c.pendingYield(), realized);
        // conservation: everything realized is exactly fee + allocated + remainder
        assertEq(c.totalYieldAllocated() + c.protocolFeeAccrued() + c.pendingYield(), realized);
    }

    /// @dev Repeated settle calls can never double-pay: only time passage
    ///      unlocks the next round.
    function testFuzz_noDoublePayout(uint8 extraCalls) public {
        extraCalls = uint8(bound(extraCalls, 1, 10));

        TestERC20 token = new TestERC20("Fuzz", "FZZ", 6);
        vm.prank(gov);
        registry.configureAsset(address(token), false, address(0), address(0), 0, 0);

        uint256 n = 2;
        address[] memory ms = new address[](n);
        ms[0] = makeAddr("np0");
        ms[1] = makeAddr("np1");
        uint256 firstPayout = block.timestamp + 3 days;
        vm.prank(ms[0]);
        address addr = factory.createCircle(
            CircleFactory.CreateParams({
                token: address(token),
                contributionPerRound: 50e6,
                payoutOrder: ms,
                frequency: 7 days,
                firstPayoutTime: firstPayout,
                payoutWindow: 1 days,
                useYield: false,
                metadataURI: ""
            })
        );
        SavingsCircle c = SavingsCircle(addr);
        vm.prank(ms[0]);
        c.lockRules();
        vm.prank(ms[0]);
        c.approveRules();
        vm.prank(ms[1]);
        c.approveRules();
        for (uint256 i = 0; i < n; i++) {
            token.mint(ms[i], c.memberCommitment());
            vm.startPrank(ms[i]);
            token.approve(address(c), type(uint256).max);
            c.fund();
            vm.stopPrank();
        }
        c.activate();

        vm.warp(firstPayout);
        c.settleRound();
        for (uint256 i = 0; i < extraCalls; i++) {
            vm.expectRevert();
            c.settleRound();
        }
        assertEq(c.totalPrincipalPaid(), c.roundPot());
    }
}
