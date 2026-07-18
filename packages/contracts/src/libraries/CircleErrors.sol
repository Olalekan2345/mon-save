// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title CircleErrors
/// @notice Shared custom errors for the MonSave protocol.
library CircleErrors {
    // ── generic ──────────────────────────────────────────────────────────
    error ZeroAddress();
    error NotAuthorized();
    error InvalidState();
    error AlreadySet();

    // ── configuration ────────────────────────────────────────────────────
    error UnsupportedAsset(address asset);
    error YieldNotEnabledForAsset(address asset);
    error ContributionZero();
    error ContributionAboveCap(uint256 contribution, uint256 cap);
    error PrincipalAboveCap(uint256 principal, uint256 cap);
    error MemberCountOutOfBounds(uint256 count);
    error FrequencyOutOfBounds(uint256 frequency);
    error PayoutWindowOutOfBounds(uint256 window);
    error FirstPayoutInPast(uint256 firstPayoutTime);
    error FirstPayoutTooSoon(uint256 firstPayoutTime, uint256 earliestAllowed);
    error DuplicateMember(address member);
    error FeeAboveHardCap(uint16 feeBps, uint16 hardCapBps);
    error CreationPaused();

    // ── membership / approvals ───────────────────────────────────────────
    error NotMember(address account);
    error AlreadyApproved(address member);
    error NotAPermutationOfMembers();

    // ── funding ──────────────────────────────────────────────────────────
    error AlreadyFunded(address member);
    error NotFunded(address member);
    error UnexpectedTokenBehaviour(uint256 expected, uint256 received);
    error NotAllApproved();
    error NotAllFunded();

    // ── settlement ───────────────────────────────────────────────────────
    error RoundNotDue(uint256 round, uint256 dueTime);
    error AllRoundsSettled();
    error AlreadyReceivedPayout(address member);

    // ── yield ────────────────────────────────────────────────────────────
    error NothingToClaim();
    error NoAdapter();
    error AdapterWithdrawMismatch(uint256 requested, uint256 received);

    // ── emergency / refunds ──────────────────────────────────────────────
    error NoShortfallDetected();
    error AlreadyRedeemed(address member);
    error NothingToRefund();
}
