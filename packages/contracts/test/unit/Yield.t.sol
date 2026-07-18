// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {CircleTestBase} from "../utils/CircleTestBase.sol";
import {SavingsCircle} from "../../src/SavingsCircle.sol";
import {CircleErrors} from "../../src/libraries/CircleErrors.sol";

contract YieldTest is CircleTestBase {
    function test_activationSuppliesIdlePrincipalToAdapter() public {
        SavingsCircle c = _fullSetup(true);
        assertEq(c.principalInAdapter(), c.totalPrincipalFunded());
        assertEq(adapter.totalAssets(), c.totalPrincipalFunded());
        assertEq(token.balanceOf(address(c)), 0);
    }

    function test_zeroYieldCheckpointIsNoop() public {
        SavingsCircle c = _fullSetup(true);
        c.checkpointYield();
        assertEq(c.grossYieldRealized(), 0);
        assertEq(c.totalYieldAllocated(), 0);
    }

    function test_yieldCheckpointAllocatesNetEvenly() public {
        SavingsCircle c = _fullSetup(true);
        adapter.simulateYield(10e6); // 10 units of realized yield

        c.checkpointYield();

        assertEq(c.grossYieldRealized(), 10e6);
        uint256 fee = (10e6 * uint256(FEE_BPS)) / 10_000; // 0.5e6
        assertEq(c.protocolFeeAccrued(), fee);
        uint256 net = 10e6 - fee;
        uint256 perMember = net / N;
        assertEq(c.claimableYield(members[0]), perMember);
        assertEq(c.totalYieldAllocated(), perMember * N);
        // rounding remainder carried, never lost
        assertEq(c.pendingYield(), net - perMember * N);
    }

    function test_claimYield() public {
        SavingsCircle c = _fullSetup(true);
        adapter.simulateYield(10e6);
        c.checkpointYield();

        uint256 claimable = c.claimableYield(members[2]);
        uint256 before = token.balanceOf(members[2]);
        vm.prank(members[2]);
        c.claimYield();
        assertEq(token.balanceOf(members[2]) - before, claimable);
        assertEq(c.claimableYield(members[2]), 0);
        assertEq(c.totalYieldClaimed(), claimable);
    }

    function test_revert_claimWithNothingAllocated() public {
        SavingsCircle c = _fullSetup(true);
        vm.prank(members[0]);
        vm.expectRevert(CircleErrors.NothingToClaim.selector);
        c.claimYield();
    }

    function test_revert_doubleClaim() public {
        SavingsCircle c = _fullSetup(true);
        adapter.simulateYield(10e6);
        c.checkpointYield();
        vm.startPrank(members[0]);
        c.claimYield();
        vm.expectRevert(CircleErrors.NothingToClaim.selector);
        c.claimYield();
        vm.stopPrank();
    }

    function test_protocolFeeCollection() public {
        SavingsCircle c = _fullSetup(true);
        adapter.simulateYield(10e6);
        c.checkpointYield();

        uint256 fee = c.protocolFeeAccrued();
        c.collectProtocolFee();
        assertEq(token.balanceOf(address(treasury)), fee);
        assertEq(c.protocolFeeCollected(), fee);
    }

    function test_feeNeverTakenFromPrincipal() public {
        SavingsCircle c = _fullSetup(true);
        // no yield at all — fee must be zero even across full lifecycle
        for (uint256 r = 0; r < N; r++) {
            vm.warp(firstPayout + r * FREQ);
            c.settleRound();
        }
        assertEq(c.protocolFeeAccrued(), 0);
        assertEq(c.totalPrincipalPaid(), c.totalPrincipalFunded());
    }

    function test_settlementWithdrawsFromAdapter() public {
        SavingsCircle c = _fullSetup(true);
        vm.warp(firstPayout);
        uint256 before = token.balanceOf(members[0]);
        c.settleRound();
        assertEq(token.balanceOf(members[0]) - before, c.roundPot());
        assertEq(c.principalInAdapter(), c.totalPrincipalFunded() - c.roundPot());
    }

    function test_yieldAccruedAcrossRounds_fullLifecycle() public {
        SavingsCircle c = _fullSetup(true);

        for (uint256 r = 0; r < N; r++) {
            vm.warp(firstPayout + r * FREQ);
            adapter.simulateYield(1e6); // yield accrues while waiting
            c.settleRound();
        }
        assertEq(uint256(c.state()), uint256(SavingsCircle.State.Completed));
        assertEq(c.grossYieldRealized(), 5e6);

        // every member can still claim allocated yield after completion
        for (uint256 i = 0; i < N; i++) {
            uint256 claimable = c.claimableYield(members[i]);
            if (claimable > 0) {
                vm.prank(members[i]);
                c.claimYield();
            }
        }
        // claims + fees never exceed realized yield
        assertLe(c.totalYieldClaimed() + c.protocolFeeAccrued(), c.grossYieldRealized());
    }

    function test_yieldClaimsPlusFeesNeverExceedRealized() public {
        SavingsCircle c = _fullSetup(true);
        adapter.simulateYield(7); // tiny amount — rounding stress
        c.checkpointYield();
        assertLe(c.totalYieldAllocated() + c.protocolFeeAccrued() + c.pendingYield(), c.grossYieldRealized());
    }

    function test_adapterLossDoesNotMintPhantomYield() public {
        SavingsCircle c = _fullSetup(true);
        adapter.simulateLoss(50e6);
        c.checkpointYield();
        assertEq(c.grossYieldRealized(), 0);
        assertEq(c.totalYieldAllocated(), 0);
    }

    function test_noAdapter_claimYieldReverts() public {
        SavingsCircle c = _fullSetup(false);
        vm.prank(members[0]);
        vm.expectRevert(CircleErrors.NothingToClaim.selector);
        c.claimYield();
    }
}
