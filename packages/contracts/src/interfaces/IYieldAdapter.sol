// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title IYieldAdapter
/// @notice Minimal supply-only yield adapter bound to exactly one SavingsCircle.
///         An adapter must never borrow, lever, flash-loan, trade or bridge funds.
interface IYieldAdapter {
    /// @notice The underlying settlement asset this adapter accepts.
    function asset() external view returns (address);

    /// @notice The circle this adapter is irrevocably bound to.
    function circle() external view returns (address);

    /// @notice Supply `amount` of the underlying asset that the circle has already
    ///         transferred to this adapter into the yield source.
    function supply(uint256 amount) external;

    /// @notice Withdraw exactly `amount` of the underlying asset to `to`.
    /// @return withdrawn The amount actually withdrawn (must equal `amount` or revert).
    function withdraw(uint256 amount, address to) external returns (uint256 withdrawn);

    /// @notice Total assets (underlying denominated) attributable to this adapter:
    ///         supplied position plus any idle underlying held locally.
    function totalAssets() external view returns (uint256);

    /// @notice Maximum amount withdrawable right now given the yield source's
    ///         available liquidity, plus idle local balance.
    function maxWithdrawable() external view returns (uint256);

    /// @notice Withdraw everything currently withdrawable to the circle.
    ///         Used only during emergency handling.
    /// @return withdrawn The amount recovered to the circle.
    function emergencyWithdrawAll() external returns (uint256 withdrawn);
}
