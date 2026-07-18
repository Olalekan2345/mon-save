// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {AaveV3MonadAdapter} from "../../src/adapters/AaveV3MonadAdapter.sol";
import {MockAavePool, MockAToken} from "../mocks/MockAavePool.sol";
import {TestERC20} from "../mocks/TestERC20.sol";
import {CircleErrors} from "../../src/libraries/CircleErrors.sol";

contract AaveAdapterTest is Test {
    TestERC20 token;
    MockAavePool pool;
    AaveV3MonadAdapter adapter;
    address circle = makeAddr("circle");

    function setUp() public {
        token = new TestERC20("Test USD", "tUSD", 6);
        pool = new MockAavePool();
        pool.init(address(token));
        adapter = new AaveV3MonadAdapter(circle, address(pool), address(token), address(pool.aToken()));
        token.mint(circle, 1_000e6);
    }

    function test_onlyCircleCanSupply() public {
        vm.expectRevert(CircleErrors.NotAuthorized.selector);
        adapter.supply(1e6);
    }

    function test_supplyAndTotalAssets() public {
        vm.startPrank(circle);
        token.transfer(address(adapter), 500e6);
        adapter.supply(500e6);
        vm.stopPrank();
        assertEq(adapter.totalAssets(), 500e6);
        assertEq(pool.aToken().balanceOf(address(adapter)), 500e6);
    }

    function test_withdrawExactAmountToRecipient() public {
        vm.startPrank(circle);
        token.transfer(address(adapter), 500e6);
        adapter.supply(500e6);
        uint256 got = adapter.withdraw(200e6, circle);
        vm.stopPrank();
        assertEq(got, 200e6);
        assertEq(token.balanceOf(circle), 700e6);
        assertEq(adapter.totalAssets(), 300e6);
    }

    function test_maxWithdrawableTracksPoolLiquidity() public {
        vm.startPrank(circle);
        token.transfer(address(adapter), 500e6);
        adapter.supply(500e6);
        vm.stopPrank();
        // drain reserve liquidity to simulate other users borrowing it
        vm.prank(address(pool.aToken()));
        token.transfer(address(0xdead), 400e6);
        assertEq(adapter.maxWithdrawable(), 100e6);
    }

    function test_emergencyWithdrawAllReturnsEverythingAvailable() public {
        vm.startPrank(circle);
        token.transfer(address(adapter), 500e6);
        adapter.supply(500e6);
        uint256 got = adapter.emergencyWithdrawAll();
        vm.stopPrank();
        assertEq(got, 500e6);
        assertEq(token.balanceOf(circle), 1_000e6);
    }

    function test_adapterNeverHoldsApprovalAfterSupply() public {
        vm.startPrank(circle);
        token.transfer(address(adapter), 500e6);
        adapter.supply(500e6);
        vm.stopPrank();
        assertEq(token.allowance(address(adapter), address(pool)), 0);
    }
}
