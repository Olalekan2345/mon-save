// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {TestYieldPool, TestYieldAToken} from "../../src/testnet/TestYieldPool.sol";
import {AaveV3MonadAdapter} from "../../src/adapters/AaveV3MonadAdapter.sol";
import {TestERC20} from "../mocks/TestERC20.sol";
import {CircleTestBase} from "../utils/CircleTestBase.sol";
import {SavingsCircle} from "../../src/SavingsCircle.sol";
import {CircleFactory} from "../../src/CircleFactory.sol";

/// @dev Verifies the testnet demo yield pool works through the REAL adapter:
///      accrues over time, stays fully withdrawable from its reserve, and never
///      creates a shortfall for the circle.
contract TestYieldPoolTest is Test {
    TestERC20 token;
    TestYieldPool pool;
    TestYieldAToken aToken;
    AaveV3MonadAdapter adapter;
    address circle = makeAddr("circle");

    function setUp() public {
        vm.warp(1_900_000_000);
        token = new TestERC20("Test USD", "tUSD", 6);
        pool = new TestYieldPool();
        pool.init(address(token), 500); // 5% demo APY
        aToken = pool.aToken();
        adapter = new AaveV3MonadAdapter(circle, address(pool), address(token), address(aToken));

        // fund the demo interest reserve (valueless testnet tokens)
        pool.fundReserve(1_000_000e6);
        token.mint(circle, 1_000e6);
    }

    function test_accruesOverTime() public {
        vm.startPrank(circle);
        token.transfer(address(adapter), 1_000e6);
        adapter.supply(1_000e6);
        vm.stopPrank();

        assertApproxEqAbs(adapter.totalAssets(), 1_000e6, 1);

        // after ~1 year at 5%, ~1050 tUSD
        vm.warp(block.timestamp + 365 days);
        uint256 assets = adapter.totalAssets();
        assertApproxEqRel(assets, 1_050e6, 0.001e18);
        assertGt(assets, 1_000e6);
    }

    function test_fullyWithdrawableFromReserve() public {
        vm.startPrank(circle);
        token.transfer(address(adapter), 1_000e6);
        adapter.supply(1_000e6);
        vm.stopPrank();

        vm.warp(block.timestamp + 180 days);
        uint256 withdrawable = adapter.maxWithdrawable();
        // principal + interest is fully covered by the reserve
        assertGt(withdrawable, 1_000e6);
        assertEq(withdrawable, adapter.totalAssets());

        // withdraw principal back to the circle — exact amount, no shortfall
        vm.prank(circle);
        uint256 got = adapter.withdraw(1_000e6, circle);
        assertEq(got, 1_000e6);
        // remaining assets are the accrued interest
        assertGt(adapter.totalAssets(), 0);
    }
}

/// @dev End-to-end: a full Secure Circle using the testnet demo yield pool
///      realizes and allocates yield through the real circle code.
contract TestYieldCircleTest is CircleTestBase {
    TestYieldPool internal pool;

    function test_circleEarnsAndAllocatesDemoYield() public {
        // stand up the demo pool for the base token
        pool = new TestYieldPool();
        pool.init(address(token), 500);
        pool.fundReserve(10_000_000e6);

        // register token with yield enabled, pointing at the demo pool.
        // (resolve aToken BEFORE pranking — an external call in the arg list
        // would otherwise consume the prank)
        address aTokenAddr = address(pool.aToken());
        vm.prank(gov);
        registry.configureAsset(address(token), true, address(pool), aTokenAddr, 0, 0);

        // create a yield-enabled circle via the factory (real adapter wired)
        vm.prank(organizer);
        address addr = factory.createCircle(
            CircleFactory.CreateParams({
                token: address(token),
                contributionPerRound: CONTRIBUTION,
                payoutOrder: members,
                frequency: FREQ,
                firstPayoutTime: firstPayout,
                payoutWindow: WINDOW,
                useYield: true,
                metadataURI: "yield-demo"
            })
        );
        SavingsCircle c = SavingsCircle(addr);
        _approveAll(c);
        _fundAll(c);
        _activate(c);

        assertTrue(c.getSummary().adapter != address(0));
        assertEq(c.principalInAdapter(), c.totalPrincipalFunded());

        // let demo interest accrue, then checkpoint through the real circle code
        vm.warp(firstPayout);
        c.checkpointYield();
        assertGt(c.grossYieldRealized(), 0);
        assertGt(c.totalYieldAllocated(), 0);

        // a member can claim their allocated demo yield
        uint256 claimable = c.claimableYield(members[1]);
        assertGt(claimable, 0);
        uint256 before = token.balanceOf(members[1]);
        vm.prank(members[1]);
        c.claimYield();
        assertEq(token.balanceOf(members[1]) - before, claimable);
    }
}
