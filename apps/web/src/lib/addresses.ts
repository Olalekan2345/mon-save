/**
 * Deployed contract addresses for the active network.
 * Provided via environment at deploy time from the deployment manifest.
 * `null` means "not deployed" — every consumer shows an honest empty state.
 */
const factoryEnv = process.env.NEXT_PUBLIC_CIRCLE_FACTORY_ADDRESS;

export const circleFactoryAddress: `0x${string}` | null =
  factoryEnv && /^0x[0-9a-fA-F]{40}$/.test(factoryEnv) ? (factoryEnv as `0x${string}`) : null;

export const isProtocolDeployed = circleFactoryAddress !== null;
