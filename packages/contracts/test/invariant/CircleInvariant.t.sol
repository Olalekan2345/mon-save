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

/// @dev Randomized action handler driving one circle through its life.
contract CircleHandler is Test {
    SavingsCircle public circle;
    TestERC20 public token;
    TestYieldAdapter public adapter;
    address[] public members;

    uint256 public settleCalls;
    uint256 public payoutsObserved;

    constructor(SavingsCircle circle_, TestERC20 token_, TestYieldAdapter adapter_, address[] memory members_) {
        circle = circle_;
        token = token_;
        adapter = adapter_;
        members = members_;
    }

    function warpForward(uint256 secs) external {
        secs = bound(secs, 1 hours, 30 days);
        vm.warp(block.timestamp + secs);
    }

    function trySettle() external {
        settleCalls++;
        uint256 paidBefore = circle.totalPrincipalPaid();
        try circle.settleRound() {
            if (circle.totalPrincipalPaid() > paidBefore) payoutsObserved++;
        } catch {}
    }

    function tryCheckpoint() external {
        try circle.checkpointYield() {} catch {}
    }

    function simulateYield(uint256 amount) external {
        amount = bound(amount, 0, 100e6);
        adapter.simulateYield(amount);
    }

    function tryClaimYield(uint256 memberSeed) external {
        address m = members[bound(memberSeed, 0, members.length - 1)];
        vm.prank(m);
        try circle.claimYield() {} catch {}
    }

    function tryCollectFee() external {
        try circle.collectProtocolFee() {} catch {}
    }
}

contract CircleInvariantTest is Test {
    uint256 internal constant N = 4;
    uint256 internal constant CONTRIBUTION = 25e6;

    address internal gov = makeAddr("gov");
    address[] internal members;

    TestERC20 internal token;
    ProtocolTreasury internal treasury;
    ProtocolConfig internal config;
    SupportedAssetRegistry internal registry;
    CircleFactory internal factory;
    SavingsCircle internal circle;
    TestYieldAdapter internal adapter;
    CircleHandler internal handler;

    function setUp() public {
        vm.warp(1_900_000_000);
        token = new TestERC20("Test USD", "tUSD", 6);
        treasury = new ProtocolTreasury(gov);
        config = new ProtocolConfig(gov, address(treasury), 500, 12);
        registry = new SupportedAssetRegistry(gov);
        factory = new CircleFactory(address(config), address(registry));
        vm.prank(gov);
        registry.configureAsset(address(token), false, address(0), address(0), 0, 0);

        for (uint256 i = 0; i < N; i++) {
            members.push(makeAddr(string(abi.encodePacked("inv", vm.toString(i)))));
        }

        vm.prank(members[0]);
        address addr = factory.createCircle(
            CircleFactory.CreateParams({
                token: address(token),
                contributionPerRound: CONTRIBUTION,
                payoutOrder: members,
                frequency: 7 days,
                firstPayoutTime: block.timestamp + 3 days,
                payoutWindow: 1 days,
                useYield: false,
                metadataURI: ""
            })
        );
        circle = SavingsCircle(addr);
        adapter = new TestYieldAdapter(addr, address(token));
        vm.prank(address(factory));
        circle.setYieldAdapter(address(adapter));

        vm.prank(members[0]);
        circle.lockRules();
        for (uint256 i = 0; i < N; i++) {
            vm.prank(members[i]);
            circle.approveRules();
        }
        for (uint256 i = 0; i < N; i++) {
            token.mint(members[i], circle.memberCommitment());
            vm.startPrank(members[i]);
            token.approve(address(circle), type(uint256).max);
            circle.fund();
            vm.stopPrank();
        }
        circle.activate();

        handler = new CircleHandler(circle, token, adapter, members);
        targetContract(address(handler));
    }

    /// @dev Total principal payouts can never exceed funded principal.
    function invariant_payoutsNeverExceedFunded() public view {
        assertLe(circle.totalPrincipalPaid(), circle.totalPrincipalFunded());
    }

    /// @dev Principal accounting identity holds in every non-emergency state.
    function invariant_principalAccountingBalanced() public view {
        if (circle.state() == SavingsCircle.State.Emergency) return;
        uint256 remainingLiability =
            circle.contributionPerRound() * (circle.totalRounds() - circle.currentRound()) * circle.memberCount();
        assertEq(
            circle.totalPrincipalPaid() + remainingLiability + circle.totalPrincipalRefunded(),
            circle.totalPrincipalFunded()
        );
    }

    /// @dev Yield claims + fees + remainder can never exceed realized yield.
    function invariant_yieldConservation() public view {
        assertLe(circle.totalYieldClaimed(), circle.totalYieldAllocated());
        assertEq(
            circle.totalYieldAllocated() + circle.protocolFeeAccrued() + circle.pendingYield(),
            circle.grossYieldRealized()
        );
    }

    /// @dev No member is ever paid the pot twice: rounds settled counts payouts.
    function invariant_noDoublePayout() public view {
        assertEq(circle.totalPrincipalPaid(), circle.currentRound() * circle.roundPot());
    }

    /// @dev A completed circle has settled every round.
    function invariant_completedMeansAllRoundsSettled() public view {
        if (circle.state() == SavingsCircle.State.Completed) {
            assertEq(circle.currentRound(), circle.totalRounds());
        }
    }

    /// @dev Payout order is frozen after activation.
    function invariant_payoutOrderImmutable() public view {
        address[] memory order = circle.getPayoutOrder();
        for (uint256 i = 0; i < N; i++) {
            assertEq(order[i], members[i]);
        }
    }
}
