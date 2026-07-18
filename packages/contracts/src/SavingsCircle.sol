// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IYieldAdapter} from "./interfaces/IYieldAdapter.sol";
import {CircleErrors} from "./libraries/CircleErrors.sol";

/// @title SavingsCircle
/// @notice One fully-collateralized ("Secure Circle") rotating savings group.
///
///         Every member escrows their full commitment (contribution × rounds)
///         before activation, so no member can stop future payouts after
///         receiving their own. Rules become immutable at activation. Any
///         address may execute a due payout — backend automation is a
///         convenience, never a dependency.
///
///         Principal and yield are accounted separately. Idle principal may be
///         supplied to a bound, immutable yield adapter; realized yield (minus a
///         capped protocol fee) is allocated pro-rata to members' remaining
///         escrow exposure at each checkpoint. No administrator can withdraw
///         principal, change the payout order, or replace the adapter.
contract SavingsCircle is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─────────────────────────────────────────────────────────────────────
    // Types
    // ─────────────────────────────────────────────────────────────────────

    enum State {
        Draft, // organizer may still adjust payout order; approvals reset on change
        AwaitingApprovals, // rules locked by organizer; members must approve onchain
        Funding, // all approved; members escrow their full commitment
        Active, // all funded; rounds settle on schedule
        Completed, // every round settled; only yield claims remain
        Cancelled, // pre-activation cancellation; refunds claimable
        Emergency // recoverable assets < remaining liabilities; pro-rata redemption
    }

    struct MemberInfo {
        bool isMember;
        bool approved;
        bool funded;
        bool receivedPayout;
        bool emergencyRedeemed;
        bool refunded;
        uint8 position; // index in payout order
        uint256 yieldAllocated;
        uint256 yieldClaimed;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Constants / immutables
    // ─────────────────────────────────────────────────────────────────────

    uint256 public constant MIN_MEMBERS = 2;
    uint256 public constant MAX_MEMBERS = 12;
    uint256 public constant MIN_FREQUENCY = 1 days;
    uint256 public constant MAX_FREQUENCY = 45 days;
    uint16 public constant MAX_YIELD_FEE_BPS = 1000; // hard 10% cap on yield fee
    uint256 internal constant BPS = 10_000;

    address public immutable factory;
    address public immutable organizer;
    IERC20 public immutable token;
    uint256 public immutable contributionPerRound;
    uint256 public immutable memberCount; // == totalRounds in Secure Circle
    uint256 public immutable totalRounds;
    uint256 public immutable frequency; // seconds between payouts
    uint256 public immutable firstPayoutTime;
    uint256 public immutable payoutWindow; // advisory execution window (UI/automation)
    uint16 public immutable protocolFeeBps; // on realized yield only
    address public immutable treasury;

    /// @notice contribution × rounds — what each member escrows before activation.
    uint256 public immutable memberCommitment;
    /// @notice contribution × members — what each round's recipient is paid.
    uint256 public immutable roundPot;

    // ─────────────────────────────────────────────────────────────────────
    // Storage
    // ─────────────────────────────────────────────────────────────────────

    State public state;
    string public metadataURI;

    /// @notice Payout order: payoutOrder[r] receives round r's pot.
    address[] internal _payoutOrder;
    mapping(address => MemberInfo) internal _members;

    uint256 public approvalCount;
    uint256 public fundedCount;
    uint256 public currentRound; // next round to settle

    /// @notice Immutable after activation; set once by the factory in Draft.
    IYieldAdapter public yieldAdapter;

    // principal accounting (integer, base units of `token`)
    uint256 public totalPrincipalFunded;
    uint256 public totalPrincipalPaid;
    uint256 public totalPrincipalRefunded;
    uint256 public principalInAdapter;
    uint256 public recordedShortfall;

    // yield accounting — kept strictly separate from principal
    uint256 public grossYieldRealized;
    uint256 public protocolFeeAccrued; // realized, not yet sent to treasury
    uint256 public protocolFeeCollected;
    uint256 public totalYieldAllocated; // net, allocated to members
    uint256 public totalYieldClaimed;
    uint256 public pendingYield; // allocation rounding remainder, carried forward
    uint256 public lastCheckpointAt;

    // emergency accounting
    uint256 public emergencyRecoveredAssets; // snapshot of what could be recovered
    uint256 public emergencyTotalLiability; // remaining principal liabilities at trigger
    uint256 public emergencyRedeemedTotal;

    // ─────────────────────────────────────────────────────────────────────
    // Events — one per financial state transition
    // ─────────────────────────────────────────────────────────────────────

    event PayoutOrderUpdated(address indexed organizer, address[] newOrder);
    event ApprovalsReset(uint256 version);
    event RulesLocked(address indexed organizer);
    event RulesApproved(address indexed member, uint256 approvalCount, uint256 required);
    event MemberFunded(address indexed member, uint256 amount, uint256 fundedCount, uint256 required);
    event CircleActivated(uint256 activatedAt, uint256 totalPrincipal, address yieldAdapter);
    event AssetsSupplied(address indexed adapter, uint256 amount);
    event AssetsWithdrawn(address indexed adapter, uint256 amount);
    event RoundSettled(uint256 indexed round, address indexed recipient, uint256 principalAmount, uint256 settledAt);
    event PrincipalPaid(address indexed recipient, uint256 amount);
    event YieldCheckpointed(
        uint256 adapterAssets, uint256 realizedGross, uint256 protocolFee, uint256 netAllocated, uint256 timestamp
    );
    event YieldAllocated(address indexed member, uint256 amount);
    event YieldClaimed(address indexed member, uint256 amount);
    event ProtocolFeeCollected(address indexed treasury, uint256 amount);
    event CircleCompleted(uint256 completedAt);
    event CircleCancelled(address indexed by, uint256 cancelledAt);
    event RefundClaimed(address indexed member, uint256 amount);
    event ShortfallRecorded(uint256 required, uint256 recoverable, uint256 shortfall);
    event EmergencyTriggered(uint256 recoveredAssets, uint256 totalLiability, uint256 timestamp);
    event EmergencyRedeemed(address indexed member, uint256 amount);

    // ─────────────────────────────────────────────────────────────────────
    // Construction
    // ─────────────────────────────────────────────────────────────────────

    struct CircleParams {
        address organizer;
        address token;
        uint256 contributionPerRound;
        address[] payoutOrder;
        uint256 frequency;
        uint256 firstPayoutTime;
        uint256 payoutWindow;
        uint16 protocolFeeBps;
        address treasury;
        string metadataURI;
    }

    constructor(CircleParams memory p) {
        if (p.organizer == address(0) || p.token == address(0) || p.treasury == address(0)) {
            revert CircleErrors.ZeroAddress();
        }
        if (p.contributionPerRound == 0) revert CircleErrors.ContributionZero();
        uint256 n = p.payoutOrder.length;
        if (n < MIN_MEMBERS || n > MAX_MEMBERS) revert CircleErrors.MemberCountOutOfBounds(n);
        if (p.frequency < MIN_FREQUENCY || p.frequency > MAX_FREQUENCY) {
            revert CircleErrors.FrequencyOutOfBounds(p.frequency);
        }
        if (p.payoutWindow < 1 hours || p.payoutWindow > 7 days) {
            revert CircleErrors.PayoutWindowOutOfBounds(p.payoutWindow);
        }
        if (p.firstPayoutTime <= block.timestamp) revert CircleErrors.FirstPayoutInPast(p.firstPayoutTime);
        if (p.protocolFeeBps > MAX_YIELD_FEE_BPS) {
            revert CircleErrors.FeeAboveHardCap(p.protocolFeeBps, MAX_YIELD_FEE_BPS);
        }

        factory = msg.sender;
        organizer = p.organizer;
        token = IERC20(p.token);
        contributionPerRound = p.contributionPerRound;
        memberCount = n;
        totalRounds = n; // Secure Circle: one payout per member
        frequency = p.frequency;
        firstPayoutTime = p.firstPayoutTime;
        payoutWindow = p.payoutWindow;
        protocolFeeBps = p.protocolFeeBps;
        treasury = p.treasury;
        metadataURI = p.metadataURI;

        memberCommitment = p.contributionPerRound * n;
        roundPot = p.contributionPerRound * n;

        for (uint256 i = 0; i < n; i++) {
            address m = p.payoutOrder[i];
            if (m == address(0)) revert CircleErrors.ZeroAddress();
            if (_members[m].isMember) revert CircleErrors.DuplicateMember(m);
            _members[m] = MemberInfo({
                isMember: true,
                approved: false,
                funded: false,
                receivedPayout: false,
                emergencyRedeemed: false,
                refunded: false,
                position: uint8(i),
                yieldAllocated: 0,
                yieldClaimed: 0
            });
            _payoutOrder.push(m);
        }

        state = State.Draft;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Modifiers
    // ─────────────────────────────────────────────────────────────────────

    modifier onlyOrganizer() {
        if (msg.sender != organizer) revert CircleErrors.NotAuthorized();
        _;
    }

    modifier onlyMember() {
        if (!_members[msg.sender].isMember) revert CircleErrors.NotMember(msg.sender);
        _;
    }

    modifier inState(State s) {
        if (state != s) revert CircleErrors.InvalidState();
        _;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Draft phase
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Bind the yield adapter. Factory-only, Draft-only, once-only.
    ///         After activation the adapter can never be replaced.
    function setYieldAdapter(address adapter) external inState(State.Draft) {
        if (msg.sender != factory) revert CircleErrors.NotAuthorized();
        if (address(yieldAdapter) != address(0)) revert CircleErrors.AlreadySet();
        if (adapter == address(0)) revert CircleErrors.ZeroAddress();
        if (IYieldAdapter(adapter).circle() != address(this)) revert CircleErrors.NotAuthorized();
        if (IYieldAdapter(adapter).asset() != address(token)) revert CircleErrors.UnsupportedAsset(adapter);
        yieldAdapter = IYieldAdapter(adapter);
    }

    /// @notice Reorder payouts while still in Draft. Must be a permutation of the
    ///         existing member set. Any change invalidates all prior approvals.
    function updatePayoutOrder(address[] calldata newOrder) external onlyOrganizer inState(State.Draft) {
        if (newOrder.length != memberCount) revert CircleErrors.NotAPermutationOfMembers();

        // verify permutation using position scratch — every member exactly once
        bool[] memory seen = new bool[](memberCount);
        for (uint256 i = 0; i < newOrder.length; i++) {
            MemberInfo storage info = _members[newOrder[i]];
            if (!info.isMember) revert CircleErrors.NotAPermutationOfMembers();
            if (seen[info.position]) revert CircleErrors.DuplicateMember(newOrder[i]);
            seen[info.position] = true;
        }
        for (uint256 i = 0; i < newOrder.length; i++) {
            _members[newOrder[i]].position = uint8(i);
            _payoutOrder[i] = newOrder[i];
        }
        _resetApprovals();
        emit PayoutOrderUpdated(msg.sender, newOrder);
    }

    function _resetApprovals() internal {
        for (uint256 i = 0; i < _payoutOrder.length; i++) {
            _members[_payoutOrder[i]].approved = false;
        }
        approvalCount = 0;
        emit ApprovalsReset(block.timestamp);
    }

    /// @notice Freeze the draft. From here the rules can only be approved,
    ///         funded and executed — never edited.
    function lockRules() external onlyOrganizer inState(State.Draft) {
        state = State.AwaitingApprovals;
        emit RulesLocked(msg.sender);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Approvals
    // ─────────────────────────────────────────────────────────────────────

    function approveRules() external onlyMember inState(State.AwaitingApprovals) {
        MemberInfo storage info = _members[msg.sender];
        if (info.approved) revert CircleErrors.AlreadyApproved(msg.sender);
        info.approved = true;
        approvalCount++;
        emit RulesApproved(msg.sender, approvalCount, memberCount);
        if (approvalCount == memberCount) {
            state = State.Funding;
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Funding
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Escrow the caller's full commitment (contribution × rounds).
    ///         Rejects fee-on-transfer behaviour via a balance-diff check.
    function fund() external nonReentrant onlyMember inState(State.Funding) {
        MemberInfo storage info = _members[msg.sender];
        if (info.funded) revert CircleErrors.AlreadyFunded(msg.sender);

        uint256 balanceBefore = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), memberCommitment);
        uint256 received = token.balanceOf(address(this)) - balanceBefore;
        if (received != memberCommitment) {
            revert CircleErrors.UnexpectedTokenBehaviour(memberCommitment, received);
        }

        info.funded = true;
        fundedCount++;
        totalPrincipalFunded += memberCommitment;
        emit MemberFunded(msg.sender, memberCommitment, fundedCount, memberCount);
    }

    /// @notice Activate once every member has approved and escrowed in full.
    ///         Callable by anyone. Supplies idle principal to the adapter.
    function activate() external nonReentrant inState(State.Funding) {
        if (approvalCount != memberCount) revert CircleErrors.NotAllApproved();
        if (fundedCount != memberCount) revert CircleErrors.NotAllFunded();

        state = State.Active;
        lastCheckpointAt = block.timestamp;

        if (address(yieldAdapter) != address(0)) {
            uint256 idle = token.balanceOf(address(this));
            token.safeTransfer(address(yieldAdapter), idle);
            yieldAdapter.supply(idle);
            principalInAdapter += idle;
            emit AssetsSupplied(address(yieldAdapter), idle);
        }
        emit CircleActivated(block.timestamp, totalPrincipalFunded, address(yieldAdapter));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Settlement
    // ─────────────────────────────────────────────────────────────────────

    /// @notice When round `r` becomes executable.
    function roundDueTime(uint256 round) public view returns (uint256) {
        return firstPayoutTime + round * frequency;
    }

    /// @notice Settle the current round: consume one contribution unit from every
    ///         member's escrow and pay the full pot to the scheduled recipient.
    ///         Permissionless — automation is optional convenience.
    function settleRound() external nonReentrant inState(State.Active) {
        uint256 round = currentRound;
        if (round >= totalRounds) revert CircleErrors.AllRoundsSettled();
        uint256 due = roundDueTime(round);
        if (block.timestamp < due) revert CircleErrors.RoundNotDue(round, due);

        _checkpointYield();

        address recipient = _payoutOrder[round];
        MemberInfo storage rInfo = _members[recipient];
        if (rInfo.receivedPayout) revert CircleErrors.AlreadyReceivedPayout(recipient);

        uint256 pot = roundPot;
        uint256 localPrincipal = _localPrincipal();

        // Solvency gate: total recoverable assets must cover ALL remaining
        // principal liabilities, not just this round. Never make a silent
        // partial payout — freeze and open deterministic pro-rata redemption.
        uint256 recoverable = localPrincipal;
        if (address(yieldAdapter) != address(0)) {
            recoverable += yieldAdapter.maxWithdrawable();
        }
        if (recoverable < _totalRemainingLiability()) {
            _triggerEmergency();
            return;
        }

        if (localPrincipal < pot) {
            uint256 need = pot - localPrincipal;
            if (address(yieldAdapter) == address(0)) {
                _triggerEmergency();
                return;
            }
            uint256 before = token.balanceOf(address(this));
            uint256 got = yieldAdapter.withdraw(need, address(this));
            uint256 received = token.balanceOf(address(this)) - before;
            if (got != need || received != need) revert CircleErrors.AdapterWithdrawMismatch(need, received);
            principalInAdapter -= need;
            emit AssetsWithdrawn(address(yieldAdapter), need);
        }

        // effects before interaction
        rInfo.receivedPayout = true;
        currentRound = round + 1;
        totalPrincipalPaid += pot;

        token.safeTransfer(recipient, pot);
        emit PrincipalPaid(recipient, pot);
        emit RoundSettled(round, recipient, pot, block.timestamp);

        if (currentRound == totalRounds) {
            _checkpointYield();
            state = State.Completed;
            emit CircleCompleted(block.timestamp);
        }
    }

    /// @dev Local token balance that is principal (excludes claimable yield or
    ///      fees that have been withdrawn to this contract — by design yield is
    ///      only ever withdrawn straight to claimants, so the full local balance
    ///      minus nothing is principal).
    function _localPrincipal() internal view returns (uint256) {
        return token.balanceOf(address(this));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Yield accounting — checkpoint-based, contract-authoritative
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Realize and allocate any new yield. Public so members can force a
    ///         checkpoint at any time; also runs at every settlement.
    function checkpointYield() external nonReentrant {
        if (state != State.Active && state != State.Completed) revert CircleErrors.InvalidState();
        _checkpointYield();
    }

    function _checkpointYield() internal {
        if (address(yieldAdapter) == address(0)) return;

        uint256 assets = yieldAdapter.totalAssets();
        uint256 unclaimedNet = totalYieldAllocated - totalYieldClaimed;
        uint256 uncollectedFee = protocolFeeAccrued - protocolFeeCollected;
        uint256 accounted = principalInAdapter + unclaimedNet + uncollectedFee + pendingYield;

        if (assets <= accounted) {
            // No new yield (or an unrealized loss — surfaced via views and
            // emergency handling, never silently socialized as "negative yield").
            lastCheckpointAt = block.timestamp;
            return;
        }

        uint256 realized = assets - accounted;
        uint256 fee = (realized * protocolFeeBps) / BPS;
        uint256 net = realized - fee;

        grossYieldRealized += realized;
        protocolFeeAccrued += fee;

        // Allocate pro-rata to remaining escrow exposure. In a Secure Circle
        // every member's escrow declines uniformly (each round consumes one
        // contribution unit from everyone), so exposure weights are always
        // equal — the pro-rata allocation reduces to an equal split, with the
        // integer remainder carried forward in `pendingYield`.
        uint256 toSplit = net + pendingYield;
        uint256 allocatedThisRound = 0;
        uint256 share = toSplit / memberCount;
        if (share > 0) {
            for (uint256 i = 0; i < memberCount; i++) {
                _members[_payoutOrder[i]].yieldAllocated += share;
                allocatedThisRound += share;
                emit YieldAllocated(_payoutOrder[i], share);
            }
        }

        totalYieldAllocated += allocatedThisRound;
        pendingYield = toSplit - allocatedThisRound;
        lastCheckpointAt = block.timestamp;

        emit YieldCheckpointed(assets, realized, fee, allocatedThisRound, block.timestamp);
    }

    /// @dev Per-member remaining escrow liability (uniform across members).
    function _remainingLiability() internal view returns (uint256) {
        return contributionPerRound * (totalRounds - currentRound);
    }

    function _totalRemainingLiability() internal view returns (uint256) {
        return _remainingLiability() * memberCount;
    }

    /// @notice Claim the caller's allocated, unclaimed yield.
    function claimYield() external nonReentrant onlyMember {
        if (state != State.Active && state != State.Completed) revert CircleErrors.InvalidState();
        MemberInfo storage info = _members[msg.sender];
        uint256 amount = info.yieldAllocated - info.yieldClaimed;
        if (amount == 0) revert CircleErrors.NothingToClaim();

        info.yieldClaimed += amount;
        totalYieldClaimed += amount;

        _payFromYieldSource(msg.sender, amount);
        emit YieldClaimed(msg.sender, amount);
    }

    /// @notice Send accrued protocol fees to the treasury. Callable by anyone.
    function collectProtocolFee() external nonReentrant {
        uint256 amount = protocolFeeAccrued - protocolFeeCollected;
        if (amount == 0) revert CircleErrors.NothingToClaim();
        protocolFeeCollected += amount;
        _payFromYieldSource(treasury, amount);
        emit ProtocolFeeCollected(treasury, amount);
    }

    /// @dev Pay yield/fee amounts by withdrawing from the adapter directly to the
    ///      recipient — yield never mingles with local principal balance.
    function _payFromYieldSource(address to, uint256 amount) internal {
        if (address(yieldAdapter) == address(0)) revert CircleErrors.NoAdapter();
        uint256 got = yieldAdapter.withdraw(amount, to);
        if (got != amount) revert CircleErrors.AdapterWithdrawMismatch(amount, got);
        emit AssetsWithdrawn(address(yieldAdapter), amount);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Cancellation & refunds (pre-activation only)
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Cancel before activation. Organizer may cancel any pre-active
    ///         state; any member may cancel a circle that failed to activate by
    ///         its first payout time (stuck-circle escape hatch).
    function cancel() external {
        bool preActive = state == State.Draft || state == State.AwaitingApprovals || state == State.Funding;
        if (!preActive) revert CircleErrors.InvalidState();
        bool authorized = msg.sender == organizer
            || (_members[msg.sender].isMember && block.timestamp > firstPayoutTime);
        if (!authorized) revert CircleErrors.NotAuthorized();
        state = State.Cancelled;
        emit CircleCancelled(msg.sender, block.timestamp);
    }

    /// @notice Reclaim escrow after cancellation.
    function claimRefund() external nonReentrant onlyMember inState(State.Cancelled) {
        MemberInfo storage info = _members[msg.sender];
        if (!info.funded || info.refunded) revert CircleErrors.NothingToRefund();
        info.refunded = true;
        totalPrincipalRefunded += memberCommitment;
        token.safeTransfer(msg.sender, memberCommitment);
        emit RefundClaimed(msg.sender, memberCommitment);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Emergency — deterministic pro-rata redemption
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Anyone may trigger emergency mode if total recoverable assets are
    ///         below remaining principal liabilities.
    function triggerEmergency() external nonReentrant inState(State.Active) {
        uint256 recoverable = _localPrincipal();
        if (address(yieldAdapter) != address(0)) {
            recoverable += yieldAdapter.maxWithdrawable();
        }
        uint256 liability = _totalRemainingLiability();
        if (recoverable >= liability) revert CircleErrors.NoShortfallDetected();
        _triggerEmergency();
    }

    function _triggerEmergency() internal {
        uint256 recovered = _localPrincipal();
        if (address(yieldAdapter) != address(0)) {
            uint256 got = yieldAdapter.emergencyWithdrawAll();
            recovered = token.balanceOf(address(this));
            if (got <= principalInAdapter) {
                principalInAdapter -= got;
            } else {
                principalInAdapter = 0;
            }
            emit AssetsWithdrawn(address(yieldAdapter), got);
        }

        uint256 liability = _totalRemainingLiability();
        emergencyRecoveredAssets = recovered;
        emergencyTotalLiability = liability;
        if (liability > recovered) {
            recordedShortfall = liability - recovered;
            emit ShortfallRecorded(liability, recovered, recordedShortfall);
        }
        state = State.Emergency;
        emit EmergencyTriggered(recovered, liability, block.timestamp);
    }

    /// @notice Redeem the caller's deterministic pro-rata share of recovered
    ///         assets. Every unpaid member's share is proportional to their
    ///         remaining liability at trigger time — no administrator can
    ///         prioritize anyone.
    function emergencyRedeem() external nonReentrant onlyMember inState(State.Emergency) {
        MemberInfo storage info = _members[msg.sender];
        if (info.emergencyRedeemed) revert CircleErrors.AlreadyRedeemed(msg.sender);
        if (emergencyTotalLiability == 0) revert CircleErrors.NothingToClaim();

        // uniform remaining liability ⇒ equal share per member
        uint256 share = emergencyRecoveredAssets / memberCount;
        info.emergencyRedeemed = true;
        emergencyRedeemedTotal += share;

        uint256 balance = token.balanceOf(address(this));
        uint256 amount = share > balance ? balance : share;
        token.safeTransfer(msg.sender, amount);
        emit EmergencyRedeemed(msg.sender, amount);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Views
    // ─────────────────────────────────────────────────────────────────────

    function getPayoutOrder() external view returns (address[] memory) {
        return _payoutOrder;
    }

    function getMember(address account) external view returns (MemberInfo memory) {
        return _members[account];
    }

    function claimableYield(address account) external view returns (uint256) {
        MemberInfo storage info = _members[account];
        return info.yieldAllocated - info.yieldClaimed;
    }

    function remainingLiability(address account) external view returns (uint256) {
        MemberInfo storage info = _members[account];
        if (!info.isMember || !info.funded || state == State.Completed) return 0;
        return _remainingLiability();
    }

    function nextRecipient() external view returns (address) {
        if (state != State.Active || currentRound >= totalRounds) return address(0);
        return _payoutOrder[currentRound];
    }

    struct Summary {
        State state;
        uint256 currentRound;
        uint256 totalRounds;
        uint256 memberCount;
        uint256 contributionPerRound;
        uint256 roundPot;
        uint256 memberCommitment;
        uint256 totalPrincipalFunded;
        uint256 totalPrincipalPaid;
        uint256 totalPrincipalRefunded;
        uint256 principalInAdapter;
        uint256 grossYieldRealized;
        uint256 totalYieldAllocated;
        uint256 totalYieldClaimed;
        uint256 nextDueTime;
        address nextRecipient;
        address adapter;
    }

    function getSummary() external view returns (Summary memory s) {
        s.state = state;
        s.currentRound = currentRound;
        s.totalRounds = totalRounds;
        s.memberCount = memberCount;
        s.contributionPerRound = contributionPerRound;
        s.roundPot = roundPot;
        s.memberCommitment = memberCommitment;
        s.totalPrincipalFunded = totalPrincipalFunded;
        s.totalPrincipalPaid = totalPrincipalPaid;
        s.totalPrincipalRefunded = totalPrincipalRefunded;
        s.principalInAdapter = principalInAdapter;
        s.grossYieldRealized = grossYieldRealized;
        s.totalYieldAllocated = totalYieldAllocated;
        s.totalYieldClaimed = totalYieldClaimed;
        s.nextDueTime = currentRound < totalRounds ? roundDueTime(currentRound) : 0;
        s.nextRecipient = (state == State.Active && currentRound < totalRounds) ? _payoutOrder[currentRound] : address(0);
        s.adapter = address(yieldAdapter);
    }
}
