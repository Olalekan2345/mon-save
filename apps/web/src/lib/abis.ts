/**
 * ABI subsets for the MonSave contracts, mirrored from packages/contracts.
 * Regenerate from `forge build` artifacts when the contracts change.
 */

export const circleFactoryAbi = [
  {
    type: "function",
    name: "createCircle",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "p",
        type: "tuple",
        components: [
          { name: "token", type: "address" },
          { name: "contributionPerRound", type: "uint256" },
          { name: "payoutOrder", type: "address[]" },
          { name: "frequency", type: "uint256" },
          { name: "firstPayoutTime", type: "uint256" },
          { name: "payoutWindow", type: "uint256" },
          { name: "useYield", type: "bool" },
          { name: "metadataURI", type: "string" },
        ],
      },
    ],
    outputs: [{ name: "circleAddr", type: "address" }],
  },
  {
    type: "function",
    name: "circleCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "circlesByMember",
    stateMutability: "view",
    inputs: [{ name: "member", type: "address" }],
    outputs: [{ type: "address[]" }],
  },
  {
    type: "function",
    name: "getCircles",
    stateMutability: "view",
    inputs: [
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" },
    ],
    outputs: [{ type: "address[]" }],
  },
  {
    type: "event",
    name: "CircleCreated",
    inputs: [
      { name: "circle", type: "address", indexed: true },
      { name: "organizer", type: "address", indexed: true },
      { name: "token", type: "address", indexed: true },
      { name: "contributionPerRound", type: "uint256", indexed: false },
      { name: "memberCount", type: "uint256", indexed: false },
      { name: "frequency", type: "uint256", indexed: false },
      { name: "firstPayoutTime", type: "uint256", indexed: false },
      { name: "yieldAdapter", type: "address", indexed: false },
      { name: "metadataURI", type: "string", indexed: false },
    ],
  },
] as const;

export const savingsCircleAbi = [
  {
    type: "function",
    name: "getSummary",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "state", type: "uint8" },
          { name: "currentRound", type: "uint256" },
          { name: "totalRounds", type: "uint256" },
          { name: "memberCount", type: "uint256" },
          { name: "contributionPerRound", type: "uint256" },
          { name: "roundPot", type: "uint256" },
          { name: "memberCommitment", type: "uint256" },
          { name: "totalPrincipalFunded", type: "uint256" },
          { name: "totalPrincipalPaid", type: "uint256" },
          { name: "totalPrincipalRefunded", type: "uint256" },
          { name: "principalInAdapter", type: "uint256" },
          { name: "grossYieldRealized", type: "uint256" },
          { name: "totalYieldAllocated", type: "uint256" },
          { name: "totalYieldClaimed", type: "uint256" },
          { name: "nextDueTime", type: "uint256" },
          { name: "nextRecipient", type: "address" },
          { name: "adapter", type: "address" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getPayoutOrder",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address[]" }],
  },
  {
    type: "function",
    name: "getMember",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "isMember", type: "bool" },
          { name: "approved", type: "bool" },
          { name: "funded", type: "bool" },
          { name: "receivedPayout", type: "bool" },
          { name: "emergencyRedeemed", type: "bool" },
          { name: "refunded", type: "bool" },
          { name: "position", type: "uint8" },
          { name: "yieldAllocated", type: "uint256" },
          { name: "yieldClaimed", type: "uint256" },
        ],
      },
    ],
  },
  { type: "function", name: "token", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "organizer", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "frequency", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "firstPayoutTime", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "metadataURI", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "claimableYield", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approveRules", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "lockRules", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "fund", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "activate", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "settleRound", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "claimYield", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "claimRefund", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "cancel", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "checkpointYield", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "emergencyRedeem", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const;

export const erc20Abi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [{ type: "address" }, { type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [{ type: "address" }, { type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
] as const;

export const CIRCLE_STATES = [
  "Draft",
  "Awaiting approvals",
  "Funding",
  "Active",
  "Completed",
  "Cancelled",
  "Emergency",
] as const;

export type CircleStateName = (typeof CIRCLE_STATES)[number];
