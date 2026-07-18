// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IYieldAdapter} from "../../src/interfaces/IYieldAdapter.sol";
import {TestERC20} from "./TestERC20.sol";

/// @dev Test-only yield adapter. Yield is simulated by minting extra tokens to
///      this adapter via `simulateYield`. NEVER deployed publicly.
contract TestYieldAdapter is IYieldAdapter {
    using SafeERC20 for IERC20;

    address public immutable override circle;
    TestERC20 internal immutable _token;
    uint256 public withdrawCap = type(uint256).max; // simulate liquidity shortage

    constructor(address circle_, address token_) {
        circle = circle_;
        _token = TestERC20(token_);
    }

    modifier onlyCircle() {
        require(msg.sender == circle, "not circle");
        _;
    }

    function asset() external view override returns (address) {
        return address(_token);
    }

    function supply(uint256) external override onlyCircle {
        // tokens already transferred in by the circle; nothing else to do
    }

    function withdraw(uint256 amount, address to) external override onlyCircle returns (uint256) {
        require(amount <= maxWithdrawable(), "liquidity");
        IERC20(address(_token)).safeTransfer(to, amount);
        return amount;
    }

    function totalAssets() public view override returns (uint256) {
        return _token.balanceOf(address(this));
    }

    function maxWithdrawable() public view override returns (uint256) {
        uint256 bal = totalAssets();
        return bal < withdrawCap ? bal : withdrawCap;
    }

    function emergencyWithdrawAll() external override onlyCircle returns (uint256 withdrawn) {
        withdrawn = maxWithdrawable();
        IERC20(address(_token)).safeTransfer(circle, withdrawn);
    }

    // ── test controls ────────────────────────────────────────────────────

    function simulateYield(uint256 amount) external {
        _token.mint(address(this), amount);
    }

    function simulateLoss(uint256 amount) external {
        IERC20(address(_token)).safeTransfer(address(0xdead), amount);
    }

    function setWithdrawCap(uint256 cap) external {
        withdrawCap = cap;
    }
}
