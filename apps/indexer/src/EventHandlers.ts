/**
 * MonSave — Envio HyperIndex event handlers.
 *
 * NOTE: this file follows Envio's generated-handler conventions. Run
 * `pnpm envio codegen` against config.yaml to generate the typed `generated`
 * module before building. Idempotency: entity ids embed chainId+txHash+logIndex
 * so reprocessing after a reorg or restart is safe; Envio's rollback_on_reorg
 * removes stale rows for orphaned blocks.
 *
 * The indexer is a read model, never an authority: the frontend revalidates
 * balances and action eligibility onchain before any write.
 */
// @ts-expect-error — `generated` exists after `envio codegen`
import { CircleFactory, SavingsCircle } from "generated";

CircleFactory.CircleCreated.contractRegister(({ event, context }) => {
  // dynamically index every circle the factory deploys
  context.addSavingsCircle(event.params.circle);
});

CircleFactory.CircleCreated.handler(async ({ event, context }) => {
  const id = `${event.chainId}-${event.params.circle.toLowerCase()}`;
  context.Circle.set({
    id,
    chainId: event.chainId,
    address: event.params.circle.toLowerCase(),
    organizer: event.params.organizer.toLowerCase(),
    token: event.params.token.toLowerCase(),
    contributionPerRound: event.params.contributionPerRound,
    memberCount: event.params.memberCount,
    frequency: event.params.frequency,
    firstPayoutTime: event.params.firstPayoutTime,
    yieldAdapter:
      event.params.yieldAdapter === "0x0000000000000000000000000000000000000000"
        ? undefined
        : event.params.yieldAdapter.toLowerCase(),
    metadataURI: event.params.metadataURI,
    state: "Draft",
    currentRound: 0n,
    totalPrincipalFunded: 0n,
    totalPrincipalPaid: 0n,
    grossYieldRealized: 0n,
    createdAtBlock: BigInt(event.block.number),
    createdTxHash: event.transaction.hash,
  });
});

function eventId(event: { chainId: number; transaction: { hash: string }; logIndex: number }): string {
  return `${event.chainId}-${event.transaction.hash}-${event.logIndex}`;
}

async function recordEvent(
  context: { CircleEvent: { set: (e: object) => void } },
  event: {
    chainId: number;
    srcAddress: string;
    transaction: { hash: string };
    block: { number: number; timestamp: number };
    logIndex: number;
    params: object;
  },
  eventName: string,
) {
  context.CircleEvent.set({
    id: eventId(event),
    chainId: event.chainId,
    circle: event.srcAddress.toLowerCase(),
    eventName,
    txHash: event.transaction.hash,
    blockNumber: BigInt(event.block.number),
    logIndex: event.logIndex,
    timestamp: BigInt(event.block.timestamp),
    data: JSON.stringify(event.params, (_k, v) => (typeof v === "bigint" ? v.toString() : v)),
  });
}

async function updateCircleState(
  context: { Circle: { get: (id: string) => Promise<Record<string, unknown> | undefined>; set: (e: object) => void } },
  event: { chainId: number; srcAddress: string },
  patch: Record<string, unknown>,
) {
  const id = `${event.chainId}-${event.srcAddress.toLowerCase()}`;
  const circle = await context.Circle.get(id);
  if (circle) context.Circle.set({ ...circle, ...patch });
}

SavingsCircle.RulesLocked.handler(async ({ event, context }) => {
  await recordEvent(context, event, "RulesLocked");
  await updateCircleState(context, event, { state: "AwaitingApprovals" });
});

SavingsCircle.RulesApproved.handler(async ({ event, context }) => {
  await recordEvent(context, event, "RulesApproved");
  const memberId = `${event.srcAddress.toLowerCase()}-${event.params.member.toLowerCase()}`;
  const existing = await context.CircleMemberState.get(memberId);
  context.CircleMemberState.set({
    id: memberId,
    circle: event.srcAddress.toLowerCase(),
    member: event.params.member.toLowerCase(),
    approved: true,
    funded: existing?.funded ?? false,
    receivedPayout: existing?.receivedPayout ?? false,
    yieldAllocated: existing?.yieldAllocated ?? 0n,
    yieldClaimed: existing?.yieldClaimed ?? 0n,
  });
  if (event.params.approvalCount === event.params.required) {
    await updateCircleState(context, event, { state: "Funding" });
  }
});

SavingsCircle.ApprovalsReset.handler(async ({ event, context }) => {
  await recordEvent(context, event, "ApprovalsReset");
});

SavingsCircle.MemberFunded.handler(async ({ event, context }) => {
  await recordEvent(context, event, "MemberFunded");
  const memberId = `${event.srcAddress.toLowerCase()}-${event.params.member.toLowerCase()}`;
  const existing = await context.CircleMemberState.get(memberId);
  context.CircleMemberState.set({
    id: memberId,
    circle: event.srcAddress.toLowerCase(),
    member: event.params.member.toLowerCase(),
    approved: existing?.approved ?? true,
    funded: true,
    receivedPayout: existing?.receivedPayout ?? false,
    yieldAllocated: existing?.yieldAllocated ?? 0n,
    yieldClaimed: existing?.yieldClaimed ?? 0n,
  });
  const circleId = `${event.chainId}-${event.srcAddress.toLowerCase()}`;
  const circle = await context.Circle.get(circleId);
  if (circle) {
    context.Circle.set({
      ...circle,
      totalPrincipalFunded: (circle.totalPrincipalFunded as bigint) + event.params.amount,
    });
  }
});

SavingsCircle.CircleActivated.handler(async ({ event, context }) => {
  await recordEvent(context, event, "CircleActivated");
  await updateCircleState(context, event, { state: "Active" });
});

SavingsCircle.AssetsSupplied.handler(async ({ event, context }) => recordEvent(context, event, "AssetsSupplied"));
SavingsCircle.AssetsWithdrawn.handler(async ({ event, context }) => recordEvent(context, event, "AssetsWithdrawn"));

SavingsCircle.RoundSettled.handler(async ({ event, context }) => {
  await recordEvent(context, event, "RoundSettled");
  context.Payout.set({
    id: `${event.srcAddress.toLowerCase()}-${event.params.round}`,
    circle: event.srcAddress.toLowerCase(),
    round: event.params.round,
    recipient: event.params.recipient.toLowerCase(),
    amount: event.params.principalAmount,
    txHash: event.transaction.hash,
    settledAt: event.params.settledAt,
  });
  const circleId = `${event.chainId}-${event.srcAddress.toLowerCase()}`;
  const circle = await context.Circle.get(circleId);
  if (circle) {
    context.Circle.set({
      ...circle,
      currentRound: event.params.round + 1n,
      totalPrincipalPaid: (circle.totalPrincipalPaid as bigint) + event.params.principalAmount,
    });
  }
  const memberId = `${event.srcAddress.toLowerCase()}-${event.params.recipient.toLowerCase()}`;
  const member = await context.CircleMemberState.get(memberId);
  if (member) context.CircleMemberState.set({ ...member, receivedPayout: true });
});

SavingsCircle.PrincipalPaid.handler(async ({ event, context }) => recordEvent(context, event, "PrincipalPaid"));

SavingsCircle.YieldCheckpointed.handler(async ({ event, context }) => {
  await recordEvent(context, event, "YieldCheckpointed");
  const circleId = `${event.chainId}-${event.srcAddress.toLowerCase()}`;
  const circle = await context.Circle.get(circleId);
  if (circle) {
    context.Circle.set({
      ...circle,
      grossYieldRealized: (circle.grossYieldRealized as bigint) + event.params.realizedGross,
    });
  }
});

SavingsCircle.YieldAllocated.handler(async ({ event, context }) => {
  await recordEvent(context, event, "YieldAllocated");
  const memberId = `${event.srcAddress.toLowerCase()}-${event.params.member.toLowerCase()}`;
  const member = await context.CircleMemberState.get(memberId);
  if (member) {
    context.CircleMemberState.set({
      ...member,
      yieldAllocated: (member.yieldAllocated as bigint) + event.params.amount,
    });
  }
});

SavingsCircle.YieldClaimed.handler(async ({ event, context }) => {
  await recordEvent(context, event, "YieldClaimed");
  const memberId = `${event.srcAddress.toLowerCase()}-${event.params.member.toLowerCase()}`;
  const member = await context.CircleMemberState.get(memberId);
  if (member) {
    context.CircleMemberState.set({
      ...member,
      yieldClaimed: (member.yieldClaimed as bigint) + event.params.amount,
    });
  }
});

SavingsCircle.ProtocolFeeCollected.handler(async ({ event, context }) => recordEvent(context, event, "ProtocolFeeCollected"));

SavingsCircle.CircleCompleted.handler(async ({ event, context }) => {
  await recordEvent(context, event, "CircleCompleted");
  await updateCircleState(context, event, { state: "Completed" });
});

SavingsCircle.CircleCancelled.handler(async ({ event, context }) => {
  await recordEvent(context, event, "CircleCancelled");
  await updateCircleState(context, event, { state: "Cancelled" });
});

SavingsCircle.RefundClaimed.handler(async ({ event, context }) => recordEvent(context, event, "RefundClaimed"));
SavingsCircle.ShortfallRecorded.handler(async ({ event, context }) => recordEvent(context, event, "ShortfallRecorded"));

SavingsCircle.EmergencyTriggered.handler(async ({ event, context }) => {
  await recordEvent(context, event, "EmergencyTriggered");
  await updateCircleState(context, event, { state: "Emergency" });
});

SavingsCircle.EmergencyRedeemed.handler(async ({ event, context }) => recordEvent(context, event, "EmergencyRedeemed"));
