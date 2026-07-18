// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {CircleTestBase} from "../utils/CircleTestBase.sol";
import {SavingsCircle} from "../../src/SavingsCircle.sol";
import {CircleErrors} from "../../src/libraries/CircleErrors.sol";

contract EmergencyTest is CircleTestBase {
    function test_revert_triggerWithoutShortfall() public {
        SavingsCircle c = _fullSetup(true);
        vm.expectRevert(CircleErrors.NoShortfallDetected.selector);
        c.triggerEmergency();
    }

    function test_liquidityShortage_entersEmergencyOnSettle() public {
        SavingsCircle c = _fullSetup(true);
        // adapter loses half the assets — cannot cover remaining liabilities
        adapter.simulateLoss(c.totalPrincipalFunded() / 2);

        vm.warp(firstPayout);
        c.settleRound(); // detects shortfall, freezes instead of partial payout

        assertEq(uint256(c.state()), uint256(SavingsCircle.State.Emergency));
        assertGt(c.recordedShortfall(), 0);
        // no payout happened
        assertEq(c.totalPrincipalPaid(), 0);
    }

    function test_explicitTrigger_afterLoss() public {
        SavingsCircle c = _fullSetup(true);
        adapter.simulateLoss(100e6);
        c.triggerEmergency();
        assertEq(uint256(c.state()), uint256(SavingsCircle.State.Emergency));
        assertEq(c.emergencyRecoveredAssets(), c.totalPrincipalFunded() - 100e6);
    }

    function test_proRataRedemption_isEqualAndDeterministic() public {
        SavingsCircle c = _fullSetup(true);
        adapter.simulateLoss(100e6);
        c.triggerEmergency();

        uint256 recovered = c.emergencyRecoveredAssets();
        uint256 expectedShare = recovered / N;

        for (uint256 i = 0; i < N; i++) {
            uint256 before = token.balanceOf(members[i]);
            vm.prank(members[i]);
            c.emergencyRedeem();
            assertEq(token.balanceOf(members[i]) - before, expectedShare);
        }
    }

    function test_revert_doubleRedeem() public {
        SavingsCircle c = _fullSetup(true);
        adapter.simulateLoss(100e6);
        c.triggerEmergency();
        vm.startPrank(members[0]);
        c.emergencyRedeem();
        vm.expectRevert(abi.encodeWithSelector(CircleErrors.AlreadyRedeemed.selector, members[0]));
        c.emergencyRedeem();
        vm.stopPrank();
    }

    function test_revert_nonMemberCannotRedeem() public {
        SavingsCircle c = _fullSetup(true);
        adapter.simulateLoss(100e6);
        c.triggerEmergency();
        address stranger = makeAddr("stranger");
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(CircleErrors.NotMember.selector, stranger));
        c.emergencyRedeem();
    }

    function test_settlementFrozenInEmergency() public {
        SavingsCircle c = _fullSetup(true);
        adapter.simulateLoss(100e6);
        c.triggerEmergency();
        vm.warp(firstPayout);
        vm.expectRevert(CircleErrors.InvalidState.selector);
        c.settleRound();
    }

    function test_liquidityShortageViaWithdrawCap() public {
        SavingsCircle c = _fullSetup(true);
        // assets exist but are not withdrawable (e.g. Aave liquidity crunch)
        adapter.setWithdrawCap(10e6);
        vm.warp(firstPayout);
        c.settleRound();
        assertEq(uint256(c.state()), uint256(SavingsCircle.State.Emergency));
    }
}
