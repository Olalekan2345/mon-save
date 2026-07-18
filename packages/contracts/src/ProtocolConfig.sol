// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {CircleErrors} from "./libraries/CircleErrors.sol";

/// @title ProtocolConfig
/// @notice Global, owner-governed protocol parameters. Ownership is intended to be
///         held by a Safe multisig in production. The config can never touch user
///         principal: it only bounds what new circles may be created with.
///         Parameters are snapshotted into each circle at creation, so changing
///         them never affects an existing circle.
contract ProtocolConfig is Ownable2Step {
    /// @notice Hard, contract-enforced ceiling on the protocol yield fee (10%).
    uint16 public constant MAX_YIELD_FEE_BPS = 1000;

    /// @notice Hard ceiling on members per circle (bounds all loops).
    uint256 public constant HARD_MAX_MEMBERS = 12;

    /// @notice Fee taken only from realized positive yield, never principal.
    uint16 public protocolYieldFeeBps;

    /// @notice Recipient of protocol yield fees.
    address public treasury;

    /// @notice Governance-set cap on members per circle (<= HARD_MAX_MEMBERS).
    uint256 public maxMembers;

    /// @notice When true, no new circles can be created. Existing circles are
    ///         unaffected — pausing creation can never trap user funds.
    bool public creationPaused;

    event ProtocolYieldFeeUpdated(uint16 oldFeeBps, uint16 newFeeBps);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event MaxMembersUpdated(uint256 oldMax, uint256 newMax);
    event CreationPausedUpdated(bool paused);

    constructor(address initialOwner, address treasury_, uint16 yieldFeeBps_, uint256 maxMembers_)
        Ownable(initialOwner)
    {
        if (treasury_ == address(0)) revert CircleErrors.ZeroAddress();
        if (yieldFeeBps_ > MAX_YIELD_FEE_BPS) revert CircleErrors.FeeAboveHardCap(yieldFeeBps_, MAX_YIELD_FEE_BPS);
        if (maxMembers_ < 2 || maxMembers_ > HARD_MAX_MEMBERS) revert CircleErrors.MemberCountOutOfBounds(maxMembers_);
        treasury = treasury_;
        protocolYieldFeeBps = yieldFeeBps_;
        maxMembers = maxMembers_;
    }

    function setProtocolYieldFee(uint16 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_YIELD_FEE_BPS) revert CircleErrors.FeeAboveHardCap(newFeeBps, MAX_YIELD_FEE_BPS);
        emit ProtocolYieldFeeUpdated(protocolYieldFeeBps, newFeeBps);
        protocolYieldFeeBps = newFeeBps;
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert CircleErrors.ZeroAddress();
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    function setMaxMembers(uint256 newMax) external onlyOwner {
        if (newMax < 2 || newMax > HARD_MAX_MEMBERS) revert CircleErrors.MemberCountOutOfBounds(newMax);
        emit MaxMembersUpdated(maxMembers, newMax);
        maxMembers = newMax;
    }

    function setCreationPaused(bool paused) external onlyOwner {
        creationPaused = paused;
        emit CreationPausedUpdated(paused);
    }
}
