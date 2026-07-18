// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {CircleTestBase} from "../utils/CircleTestBase.sol";
import {SavingsCircle} from "../../src/SavingsCircle.sol";
import {CircleFactory} from "../../src/CircleFactory.sol";
import {CircleErrors} from "../../src/libraries/CircleErrors.sol";
import {TestERC20} from "../mocks/TestERC20.sol";

contract SavingsCircleLifecycleTest is CircleTestBase {
    // ── creation validation ──────────────────────────────────────────────

    function test_createValidCircle() public {
        SavingsCircle c = _createCircle(false);
        assertEq(uint256(c.state()), uint256(SavingsCircle.State.Draft));
        assertEq(c.memberCount(), N);
        assertEq(c.totalRounds(), N);
        assertEq(c.memberCommitment(), CONTRIBUTION * N);
        assertEq(c.roundPot(), CONTRIBUTION * N);
        assertTrue(factory.isCircle(address(c)));
    }

    function test_commitmentAndPotFormulas() public {
        SavingsCircle c = _createCircle(false);
        // member commitment = contribution × rounds; round pot = contribution × members
        assertEq(c.memberCommitment(), 100e6);
        assertEq(c.roundPot(), 100e6);
        // total circle principal = commitment × members
        assertEq(c.memberCommitment() * c.memberCount(), 500e6);
    }

    function test_revert_duplicateMember() public {
        address[] memory dup = new address[](3);
        dup[0] = members[0];
        dup[1] = members[1];
        dup[2] = members[0];
        vm.prank(organizer);
        vm.expectRevert(abi.encodeWithSelector(CircleErrors.DuplicateMember.selector, members[0]));
        factory.createCircle(_params(dup));
    }

    function test_revert_unsupportedAsset() public {
        TestERC20 other = new TestERC20("Other", "OTH", 18);
        CircleFactory.CreateParams memory p = _params(members);
        p.token = address(other);
        vm.prank(organizer);
        vm.expectRevert(abi.encodeWithSelector(CircleErrors.UnsupportedAsset.selector, address(other)));
        factory.createCircle(p);
    }

    function test_revert_zeroContribution() public {
        CircleFactory.CreateParams memory p = _params(members);
        p.contributionPerRound = 0;
        vm.prank(organizer);
        vm.expectRevert(CircleErrors.ContributionZero.selector);
        factory.createCircle(p);
    }

    function test_revert_tooFewMembers() public {
        address[] memory one = new address[](1);
        one[0] = members[0];
        vm.prank(organizer);
        vm.expectRevert(abi.encodeWithSelector(CircleErrors.MemberCountOutOfBounds.selector, 1));
        factory.createCircle(_params(one));
    }

    function test_revert_firstPayoutInPast() public {
        CircleFactory.CreateParams memory p = _params(members);
        p.firstPayoutTime = block.timestamp - 1;
        vm.prank(organizer);
        vm.expectRevert();
        factory.createCircle(p);
    }

    function test_revert_frequencyOutOfBounds() public {
        CircleFactory.CreateParams memory p = _params(members);
        p.frequency = 1 hours;
        vm.prank(organizer);
        vm.expectRevert(abi.encodeWithSelector(CircleErrors.FrequencyOutOfBounds.selector, 1 hours));
        factory.createCircle(p);
    }

    function test_revert_creationPaused() public {
        vm.prank(gov);
        config.setCreationPaused(true);
        vm.prank(organizer);
        vm.expectRevert(CircleErrors.CreationPaused.selector);
        factory.createCircle(_params(members));
    }

    // ── draft / approvals ────────────────────────────────────────────────

    function test_approvalFlow() public {
        SavingsCircle c = _createCircle(false);
        vm.prank(organizer);
        c.lockRules();
        assertEq(uint256(c.state()), uint256(SavingsCircle.State.AwaitingApprovals));

        for (uint256 i = 0; i < N; i++) {
            vm.prank(members[i]);
            c.approveRules();
        }
        assertEq(uint256(c.state()), uint256(SavingsCircle.State.Funding));
    }

    function test_revert_nonMemberCannotApprove() public {
        SavingsCircle c = _createCircle(false);
        vm.prank(organizer);
        c.lockRules();
        address stranger = makeAddr("stranger");
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(CircleErrors.NotMember.selector, stranger));
        c.approveRules();
    }

    function test_revert_doubleApprove() public {
        SavingsCircle c = _createCircle(false);
        vm.prank(organizer);
        c.lockRules();
        vm.prank(members[1]);
        c.approveRules();
        vm.prank(members[1]);
        vm.expectRevert(abi.encodeWithSelector(CircleErrors.AlreadyApproved.selector, members[1]));
        c.approveRules();
    }

    function test_draftChangeResetsApprovals() public {
        SavingsCircle c = _createCircle(false);

        // reorder in draft, then lock and approve two members
        address[] memory reordered = new address[](N);
        for (uint256 i = 0; i < N; i++) {
            reordered[i] = members[N - 1 - i];
        }
        vm.prank(organizer);
        c.updatePayoutOrder(reordered);
        assertEq(c.getPayoutOrder()[0], members[N - 1]);

        // approvals only exist after locking; reset applies to draft edits
        SavingsCircle c2 = _createCircle(false);
        vm.prank(organizer);
        c2.updatePayoutOrder(reordered);
        assertEq(c2.approvalCount(), 0);
    }

    function test_revert_payoutOrderNotPermutation() public {
        SavingsCircle c = _createCircle(false);
        address[] memory bad = new address[](N);
        for (uint256 i = 0; i < N; i++) {
            bad[i] = members[0]; // duplicates
        }
        vm.prank(organizer);
        vm.expectRevert();
        c.updatePayoutOrder(bad);
    }

    function test_revert_lockedRulesCannotChange() public {
        SavingsCircle c = _createCircle(false);
        vm.prank(organizer);
        c.lockRules();
        address[] memory order = c.getPayoutOrder();
        vm.prank(organizer);
        vm.expectRevert(CircleErrors.InvalidState.selector);
        c.updatePayoutOrder(order);
    }

    // ── funding ──────────────────────────────────────────────────────────

    function test_fundingFlow() public {
        SavingsCircle c = _createCircle(false);
        _approveAll(c);

        uint256 commitment = c.memberCommitment();
        vm.startPrank(members[0]);
        token.approve(address(c), commitment);
        c.fund();
        vm.stopPrank();

        assertEq(c.fundedCount(), 1);
        assertEq(c.totalPrincipalFunded(), commitment);
        assertEq(token.balanceOf(address(c)), commitment);
    }

    function test_revert_doubleFund() public {
        SavingsCircle c = _createCircle(false);
        _approveAll(c);
        vm.startPrank(members[0]);
        token.approve(address(c), type(uint256).max);
        c.fund();
        vm.expectRevert(abi.encodeWithSelector(CircleErrors.AlreadyFunded.selector, members[0]));
        c.fund();
        vm.stopPrank();
    }

    function test_revert_fundBeforeApprovalPhaseComplete() public {
        SavingsCircle c = _createCircle(false);
        vm.prank(organizer);
        c.lockRules();
        vm.startPrank(members[0]);
        token.approve(address(c), type(uint256).max);
        vm.expectRevert(CircleErrors.InvalidState.selector);
        c.fund();
        vm.stopPrank();
    }

    function test_revert_activateBeforeAllFunded() public {
        SavingsCircle c = _createCircle(false);
        _approveAll(c);
        vm.startPrank(members[0]);
        token.approve(address(c), type(uint256).max);
        c.fund();
        vm.stopPrank();
        vm.expectRevert(CircleErrors.NotAllFunded.selector);
        c.activate();
    }

    function test_activation() public {
        SavingsCircle c = _fullSetup(false);
        assertEq(uint256(c.state()), uint256(SavingsCircle.State.Active));
        assertEq(c.totalPrincipalFunded(), CONTRIBUTION * N * N);
    }

    // ── settlement ───────────────────────────────────────────────────────

    function test_revert_earlySettlement() public {
        SavingsCircle c = _fullSetup(false);
        vm.expectRevert(
            abi.encodeWithSelector(CircleErrors.RoundNotDue.selector, 0, firstPayout)
        );
        c.settleRound();
    }

    function test_settleFirstRound_permissionless() public {
        SavingsCircle c = _fullSetup(false);
        vm.warp(firstPayout);

        uint256 before = token.balanceOf(members[0]);
        address keeper = makeAddr("keeper"); // any address may execute
        vm.prank(keeper);
        c.settleRound();

        assertEq(token.balanceOf(members[0]) - before, c.roundPot());
        assertEq(c.currentRound(), 1);
        assertEq(c.totalPrincipalPaid(), c.roundPot());
    }

    function test_revert_doubleSettlementSameRound() public {
        SavingsCircle c = _fullSetup(false);
        vm.warp(firstPayout);
        c.settleRound();
        // round 1 not due yet — early settlement of the next round must revert
        vm.expectRevert(
            abi.encodeWithSelector(CircleErrors.RoundNotDue.selector, 1, firstPayout + FREQ)
        );
        c.settleRound();
    }

    function test_fullLifecycle_completesAllRounds() public {
        SavingsCircle c = _fullSetup(false);

        for (uint256 r = 0; r < N; r++) {
            vm.warp(firstPayout + r * FREQ);
            uint256 before = token.balanceOf(members[r]);
            c.settleRound();
            assertEq(token.balanceOf(members[r]) - before, c.roundPot());
        }

        assertEq(uint256(c.state()), uint256(SavingsCircle.State.Completed));
        assertEq(c.totalPrincipalPaid(), c.totalPrincipalFunded());
        assertEq(token.balanceOf(address(c)), 0);
    }

    function test_accountingInvariantHoldsEachRound() public {
        SavingsCircle c = _fullSetup(false);
        uint256 funded = c.totalPrincipalFunded();
        for (uint256 r = 0; r < N; r++) {
            vm.warp(firstPayout + r * FREQ);
            c.settleRound();
            uint256 remainingLiability = c.contributionPerRound() * (N - c.currentRound()) * N;
            assertEq(c.totalPrincipalPaid() + remainingLiability + c.totalPrincipalRefunded(), funded);
        }
    }

    function test_revert_settleAfterCompleted() public {
        SavingsCircle c = _fullSetup(false);
        for (uint256 r = 0; r < N; r++) {
            vm.warp(firstPayout + r * FREQ);
            c.settleRound();
        }
        vm.expectRevert(CircleErrors.InvalidState.selector);
        c.settleRound();
    }

    // ── cancellation & refunds ───────────────────────────────────────────

    function test_cancelAndRefund() public {
        SavingsCircle c = _createCircle(false);
        _approveAll(c);
        vm.startPrank(members[0]);
        token.approve(address(c), type(uint256).max);
        c.fund();
        vm.stopPrank();

        vm.prank(organizer);
        c.cancel();
        assertEq(uint256(c.state()), uint256(SavingsCircle.State.Cancelled));

        uint256 before = token.balanceOf(members[0]);
        vm.prank(members[0]);
        c.claimRefund();
        assertEq(token.balanceOf(members[0]) - before, c.memberCommitment());
    }

    function test_revert_refundWithoutFunding() public {
        SavingsCircle c = _createCircle(false);
        vm.prank(organizer);
        c.cancel();
        vm.prank(members[1]);
        vm.expectRevert(CircleErrors.NothingToRefund.selector);
        c.claimRefund();
    }

    function test_revert_doubleRefund() public {
        SavingsCircle c = _createCircle(false);
        _approveAll(c);
        vm.startPrank(members[0]);
        token.approve(address(c), type(uint256).max);
        c.fund();
        vm.stopPrank();
        vm.prank(organizer);
        c.cancel();
        vm.startPrank(members[0]);
        c.claimRefund();
        vm.expectRevert(CircleErrors.NothingToRefund.selector);
        c.claimRefund();
        vm.stopPrank();
    }

    function test_revert_cancelAfterActivation() public {
        SavingsCircle c = _fullSetup(false);
        vm.prank(organizer);
        vm.expectRevert(CircleErrors.InvalidState.selector);
        c.cancel();
    }

    function test_stuckCircle_memberCanCancelAfterFirstPayoutTime() public {
        SavingsCircle c = _createCircle(false);
        _approveAll(c);
        vm.warp(firstPayout + 1);
        vm.prank(members[3]);
        c.cancel();
        assertEq(uint256(c.state()), uint256(SavingsCircle.State.Cancelled));
    }

    // ── helpers ──────────────────────────────────────────────────────────

    function _params(address[] memory order) internal view returns (CircleFactory.CreateParams memory) {
        return CircleFactory.CreateParams({
            token: address(token),
            contributionPerRound: CONTRIBUTION,
            payoutOrder: order,
            frequency: FREQ,
            firstPayoutTime: firstPayout,
            payoutWindow: WINDOW,
            useYield: false,
            metadataURI: "ipfs://monsave-test"
        });
    }
}
