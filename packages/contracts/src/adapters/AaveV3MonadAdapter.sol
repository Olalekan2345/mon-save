// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IYieldAdapter} from "../interfaces/IYieldAdapter.sol";
import {IAaveV3Pool} from "../interfaces/aave/IAaveV3Pool.sol";
import {CircleErrors} from "../libraries/CircleErrors.sol";

/// @title AaveV3MonadAdapter
/// @notice Supply-only Aave V3 adapter, deployed per-circle so funds are always
///         segregated. Irrevocably bound to one SavingsCircle and one asset.
///
///         This adapter never borrows, levers, flash-loans, trades, bridges or
///         routes through unverified contracts. It can only:
///           - supply the underlying asset to the configured Aave V3 pool
///           - withdraw the underlying asset back, only on the circle's order
contract AaveV3MonadAdapter is IYieldAdapter {
    using SafeERC20 for IERC20;

    address public immutable override circle;
    IAaveV3Pool public immutable pool;
    IERC20 internal immutable _asset;
    IERC20 public immutable aToken;

    event Supplied(uint256 amount);
    event Withdrawn(uint256 amount, address to);
    event EmergencyWithdrawal(uint256 amount);

    modifier onlyCircle() {
        if (msg.sender != circle) revert CircleErrors.NotAuthorized();
        _;
    }

    constructor(address circle_, address pool_, address asset_, address aToken_) {
        if (circle_ == address(0) || pool_ == address(0) || asset_ == address(0) || aToken_ == address(0)) {
            revert CircleErrors.ZeroAddress();
        }
        circle = circle_;
        pool = IAaveV3Pool(pool_);
        _asset = IERC20(asset_);
        aToken = IERC20(aToken_);
    }

    function asset() external view override returns (address) {
        return address(_asset);
    }

    /// @inheritdoc IYieldAdapter
    function supply(uint256 amount) external override onlyCircle {
        _asset.forceApprove(address(pool), amount);
        pool.supply(address(_asset), amount, address(this), 0);
        emit Supplied(amount);
    }

    /// @inheritdoc IYieldAdapter
    function withdraw(uint256 amount, address to) external override onlyCircle returns (uint256 withdrawn) {
        // serve from idle balance first, then the pool
        uint256 idle = _asset.balanceOf(address(this));
        if (idle >= amount) {
            _asset.safeTransfer(to, amount);
            emit Withdrawn(amount, to);
            return amount;
        }
        uint256 fromPool = amount - idle;
        uint256 got = pool.withdraw(address(_asset), fromPool, address(this));
        if (got != fromPool) revert CircleErrors.AdapterWithdrawMismatch(fromPool, got);
        _asset.safeTransfer(to, amount);
        emit Withdrawn(amount, to);
        return amount;
    }

    /// @inheritdoc IYieldAdapter
    function totalAssets() public view override returns (uint256) {
        return aToken.balanceOf(address(this)) + _asset.balanceOf(address(this));
    }

    /// @inheritdoc IYieldAdapter
    function maxWithdrawable() public view override returns (uint256) {
        uint256 supplied = aToken.balanceOf(address(this));
        // available liquidity in the reserve = underlying held by the aToken
        uint256 liquidity = _asset.balanceOf(address(aToken));
        uint256 fromPool = supplied < liquidity ? supplied : liquidity;
        return fromPool + _asset.balanceOf(address(this));
    }

    /// @inheritdoc IYieldAdapter
    function emergencyWithdrawAll() external override onlyCircle returns (uint256 withdrawn) {
        uint256 supplied = aToken.balanceOf(address(this));
        uint256 liquidity = _asset.balanceOf(address(aToken));
        uint256 fromPool = supplied < liquidity ? supplied : liquidity;
        if (fromPool > 0) {
            pool.withdraw(address(_asset), fromPool, address(this));
        }
        withdrawn = _asset.balanceOf(address(this));
        if (withdrawn > 0) {
            _asset.safeTransfer(circle, withdrawn);
        }
        emit EmergencyWithdrawal(withdrawn);
    }
}
