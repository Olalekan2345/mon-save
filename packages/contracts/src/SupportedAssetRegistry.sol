// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {CircleErrors} from "./libraries/CircleErrors.sol";

/// @title SupportedAssetRegistry
/// @notice Owner-governed registry of settlement assets circles may use, with
///         per-asset risk caps and optional Aave V3 yield routing data.
///         Assets must be verified, non-rebasing, non-fee-on-transfer ERC-20s.
///         The registry never holds funds.
contract SupportedAssetRegistry is Ownable2Step {
    struct AssetConfig {
        bool enabled;
        bool yieldEnabled;
        uint8 decimals;
        /// @dev Aave V3 Pool used by adapters for this asset (zero when yield disabled).
        address aavePool;
        /// @dev The aToken corresponding to this asset on the configured pool.
        address aToken;
        /// @dev Per-round contribution cap, in asset base units. Global risk cap.
        uint256 maxContributionPerRound;
        /// @dev Cap on a single circle's total principal, in asset base units.
        uint256 maxCirclePrincipal;
    }

    mapping(address asset => AssetConfig) internal _assets;
    address[] public assetList;

    event AssetConfigured(
        address indexed asset,
        bool enabled,
        bool yieldEnabled,
        address aavePool,
        address aToken,
        uint256 maxContributionPerRound,
        uint256 maxCirclePrincipal
    );
    event AssetDisabled(address indexed asset);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Add or update a supported asset. Decimals are read from the token
    ///         itself so a mis-typed decimals value can never be configured.
    function configureAsset(
        address asset,
        bool yieldEnabled,
        address aavePool,
        address aToken,
        uint256 maxContributionPerRound,
        uint256 maxCirclePrincipal
    ) external onlyOwner {
        if (asset == address(0)) revert CircleErrors.ZeroAddress();
        if (asset.code.length == 0) revert CircleErrors.UnsupportedAsset(asset);
        if (yieldEnabled && (aavePool == address(0) || aToken == address(0))) revert CircleErrors.ZeroAddress();

        uint8 decimals = IERC20Metadata(asset).decimals();

        if (!_assets[asset].enabled && _assets[asset].decimals == 0) {
            assetList.push(asset);
        }
        _assets[asset] = AssetConfig({
            enabled: true,
            yieldEnabled: yieldEnabled,
            decimals: decimals,
            aavePool: aavePool,
            aToken: aToken,
            maxContributionPerRound: maxContributionPerRound,
            maxCirclePrincipal: maxCirclePrincipal
        });
        emit AssetConfigured(asset, true, yieldEnabled, aavePool, aToken, maxContributionPerRound, maxCirclePrincipal);
    }

    /// @notice Disable an asset for new circles. Existing circles are unaffected.
    function disableAsset(address asset) external onlyOwner {
        _assets[asset].enabled = false;
        _assets[asset].yieldEnabled = false;
        emit AssetDisabled(asset);
    }

    function getAsset(address asset) external view returns (AssetConfig memory) {
        return _assets[asset];
    }

    function isSupported(address asset) external view returns (bool) {
        return _assets[asset].enabled;
    }

    function assetCount() external view returns (uint256) {
        return assetList.length;
    }
}
