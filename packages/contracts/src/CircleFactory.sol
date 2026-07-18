// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SavingsCircle} from "./SavingsCircle.sol";
import {AaveV3MonadAdapter} from "./adapters/AaveV3MonadAdapter.sol";
import {ProtocolConfig} from "./ProtocolConfig.sol";
import {SupportedAssetRegistry} from "./SupportedAssetRegistry.sol";
import {CircleErrors} from "./libraries/CircleErrors.sol";

/// @title CircleFactory
/// @notice Deploys immutable, versioned SavingsCircle contracts. The factory
///         never holds user principal, never withdraws from circles and can
///         never modify an active circle's payout rules. Protocol parameters
///         are snapshotted into each circle at creation.
contract CircleFactory {
    string public constant VERSION = "1.0.0";

    ProtocolConfig public immutable config;
    SupportedAssetRegistry public immutable registry;

    address[] public circles;
    mapping(address => bool) public isCircle;
    mapping(address => address[]) internal _circlesByOrganizer;
    mapping(address => address[]) internal _circlesByMember;

    event CircleCreated(
        address indexed circle,
        address indexed organizer,
        address indexed token,
        uint256 contributionPerRound,
        uint256 memberCount,
        uint256 frequency,
        uint256 firstPayoutTime,
        address yieldAdapter,
        string metadataURI
    );

    constructor(address config_, address registry_) {
        if (config_ == address(0) || registry_ == address(0)) revert CircleErrors.ZeroAddress();
        config = ProtocolConfig(config_);
        registry = SupportedAssetRegistry(registry_);
    }

    struct CreateParams {
        address token;
        uint256 contributionPerRound;
        address[] payoutOrder;
        uint256 frequency;
        uint256 firstPayoutTime;
        uint256 payoutWindow;
        bool useYield;
        string metadataURI;
    }

    /// @notice Create a Secure Circle. `msg.sender` becomes the organizer.
    function createCircle(CreateParams calldata p) external returns (address circleAddr) {
        if (config.creationPaused()) revert CircleErrors.CreationPaused();

        SupportedAssetRegistry.AssetConfig memory asset = registry.getAsset(p.token);
        if (!asset.enabled) revert CircleErrors.UnsupportedAsset(p.token);
        if (p.useYield && !asset.yieldEnabled) revert CircleErrors.YieldNotEnabledForAsset(p.token);

        uint256 n = p.payoutOrder.length;
        if (n < 2 || n > config.maxMembers()) revert CircleErrors.MemberCountOutOfBounds(n);
        if (p.contributionPerRound == 0) revert CircleErrors.ContributionZero();
        if (asset.maxContributionPerRound != 0 && p.contributionPerRound > asset.maxContributionPerRound) {
            revert CircleErrors.ContributionAboveCap(p.contributionPerRound, asset.maxContributionPerRound);
        }
        uint256 totalPrincipal = p.contributionPerRound * n * n; // commitment × members
        if (asset.maxCirclePrincipal != 0 && totalPrincipal > asset.maxCirclePrincipal) {
            revert CircleErrors.PrincipalAboveCap(totalPrincipal, asset.maxCirclePrincipal);
        }

        SavingsCircle circle = new SavingsCircle(
            SavingsCircle.CircleParams({
                organizer: msg.sender,
                token: p.token,
                contributionPerRound: p.contributionPerRound,
                payoutOrder: p.payoutOrder,
                frequency: p.frequency,
                firstPayoutTime: p.firstPayoutTime,
                payoutWindow: p.payoutWindow,
                protocolFeeBps: config.protocolYieldFeeBps(),
                treasury: config.treasury(),
                metadataURI: p.metadataURI
            })
        );
        circleAddr = address(circle);

        address adapterAddr = address(0);
        if (p.useYield) {
            AaveV3MonadAdapter adapter =
                new AaveV3MonadAdapter(circleAddr, asset.aavePool, p.token, asset.aToken);
            adapterAddr = address(adapter);
            circle.setYieldAdapter(adapterAddr);
        }

        circles.push(circleAddr);
        isCircle[circleAddr] = true;
        _circlesByOrganizer[msg.sender].push(circleAddr);
        for (uint256 i = 0; i < n; i++) {
            _circlesByMember[p.payoutOrder[i]].push(circleAddr);
        }

        emit CircleCreated(
            circleAddr,
            msg.sender,
            p.token,
            p.contributionPerRound,
            n,
            p.frequency,
            p.firstPayoutTime,
            adapterAddr,
            p.metadataURI
        );
    }

    // ── discovery (pagination-friendly) ──────────────────────────────────

    function circleCount() external view returns (uint256) {
        return circles.length;
    }

    function getCircles(uint256 offset, uint256 limit) external view returns (address[] memory page) {
        uint256 total = circles.length;
        if (offset >= total) return new address[](0);
        uint256 end = offset + limit;
        if (end > total) end = total;
        page = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = circles[i];
        }
    }

    function circlesByOrganizer(address organizer) external view returns (address[] memory) {
        return _circlesByOrganizer[organizer];
    }

    function circlesByMember(address member) external view returns (address[] memory) {
        return _circlesByMember[member];
    }
}
