// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {CircleTestBase} from "../utils/CircleTestBase.sol";
import {SavingsCircle} from "../../src/SavingsCircle.sol";
import {CircleFactory} from "../../src/CircleFactory.sol";
import {CircleErrors} from "../../src/libraries/CircleErrors.sol";
import {FailingERC20} from "../mocks/FailingERC20.sol";
import {ReentrantToken} from "../mocks/ReentrantToken.sol";

contract SecurityTest is CircleTestBase {
    function test_revert_feeOnTransferTokenRejectedAtFunding() public {
        FailingERC20 feeToken = new FailingERC20();
        vm.prank(gov);
        registry.configureAsset(address(feeToken), false, address(0), address(0), 0, 0);

        address[] memory two = new address[](2);
        two[0] = members[0];
        two[1] = members[1];
        vm.prank(members[0]);
        address addr = factory.createCircle(
            CircleFactory.CreateParams({
                token: address(feeToken),
                contributionPerRound: CONTRIBUTION,
                payoutOrder: two,
                frequency: FREQ,
                firstPayoutTime: firstPayout,
                payoutWindow: WINDOW,
                useYield: false,
                metadataURI: ""
            })
        );
        SavingsCircle c = SavingsCircle(addr);
        vm.prank(members[0]);
        c.lockRules();
        vm.prank(members[0]);
        c.approveRules();
        vm.prank(members[1]);
        c.approveRules();

        feeToken.mint(members[0], 1_000e6);
        feeToken.setFeeBps(100); // 1% skim → balance-diff check must reject
        vm.startPrank(members[0]);
        feeToken.approve(address(c), type(uint256).max);
        vm.expectRevert();
        c.fund();
        vm.stopPrank();
    }

    function test_revert_failingTransferBubblesUp() public {
        FailingERC20 badToken = new FailingERC20();
        vm.prank(gov);
        registry.configureAsset(address(badToken), false, address(0), address(0), 0, 0);

        address[] memory two = new address[](2);
        two[0] = members[0];
        two[1] = members[1];
        vm.prank(members[0]);
        address addr = factory.createCircle(
            CircleFactory.CreateParams({
                token: address(badToken),
                contributionPerRound: CONTRIBUTION,
                payoutOrder: two,
                frequency: FREQ,
                firstPayoutTime: firstPayout,
                payoutWindow: WINDOW,
                useYield: false,
                metadataURI: ""
            })
        );
        SavingsCircle c = SavingsCircle(addr);
        vm.prank(members[0]);
        c.lockRules();
        vm.prank(members[0]);
        c.approveRules();
        vm.prank(members[1]);
        c.approveRules();

        badToken.mint(members[0], 1_000e6);
        badToken.setFailTransfers(true);
        vm.startPrank(members[0]);
        badToken.approve(address(c), type(uint256).max);
        vm.expectRevert();
        c.fund();
        vm.stopPrank();
    }

    function test_reentrancyOnSettleIsBlocked() public {
        ReentrantToken reToken = new ReentrantToken();
        vm.prank(gov);
        registry.configureAsset(address(reToken), false, address(0), address(0), 0, 0);

        address[] memory two = new address[](2);
        two[0] = members[0];
        two[1] = members[1];
        vm.prank(members[0]);
        address addr = factory.createCircle(
            CircleFactory.CreateParams({
                token: address(reToken),
                contributionPerRound: CONTRIBUTION,
                payoutOrder: two,
                frequency: FREQ,
                firstPayoutTime: firstPayout,
                payoutWindow: WINDOW,
                useYield: false,
                metadataURI: ""
            })
        );
        SavingsCircle c = SavingsCircle(addr);
        vm.prank(members[0]);
        c.lockRules();
        vm.prank(members[0]);
        c.approveRules();
        vm.prank(members[1]);
        c.approveRules();

        reToken.mint(members[0], 1_000e6);
        reToken.mint(members[1], 1_000e6);
        vm.startPrank(members[0]);
        reToken.approve(address(c), type(uint256).max);
        c.fund();
        vm.stopPrank();
        vm.startPrank(members[1]);
        reToken.approve(address(c), type(uint256).max);
        c.fund();
        vm.stopPrank();
        c.activate();

        // arm the attack: token attempts settleRound() re-entry mid-transfer
        reToken.setAttack(address(c), 1);
        vm.warp(firstPayout);
        vm.expectRevert(); // ReentrancyGuard blocks the nested call
        c.settleRound();
    }

    function test_adminCannotWithdrawPrincipal() public {
        SavingsCircle c = _fullSetup(false);
        // The circle exposes NO privileged withdrawal path. Verify the only
        // token movers are settle/claim/refund/emergency — a governance address
        // has no special access at all.
        vm.startPrank(gov);
        vm.expectRevert();
        c.cancel(); // gov is not organizer or member
        vm.expectRevert(abi.encodeWithSelector(CircleErrors.NotMember.selector, gov));
        c.claimYield();
        vm.stopPrank();
    }

    function test_factoryCannotTouchActiveCircle() public {
        SavingsCircle c = _fullSetup(false);
        // factory may only bind the adapter in Draft — nothing else, ever
        vm.prank(address(factory));
        vm.expectRevert(CircleErrors.InvalidState.selector);
        c.setYieldAdapter(address(0xbeef));
    }

    function test_strangerCannotBindAdapter() public {
        SavingsCircle c = _createCircle(false);
        vm.prank(makeAddr("stranger"));
        vm.expectRevert(CircleErrors.NotAuthorized.selector);
        c.setYieldAdapter(address(0xbeef));
    }
}
