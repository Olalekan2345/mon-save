// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Minimal Aave V3 Pool interface — supply/withdraw only.
///         MonSave never borrows, levers or flash-loans.
interface IAaveV3Pool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;

    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

/// @notice Minimal Aave V3 PoolAddressesProvider interface, used by deployment
///         scripts to verify the configured Pool resolves from the provider.
interface IAaveV3PoolAddressesProvider {
    function getPool() external view returns (address);
}
