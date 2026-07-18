"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { circleFactoryAbi, savingsCircleAbi } from "@/lib/abis";
import { circleFactoryAddress } from "@/lib/addresses";

/** Circles the connected wallet belongs to — straight from the factory. */
export function useMyCircles() {
  const { address } = useAccount();
  return useReadContract({
    address: circleFactoryAddress ?? undefined,
    abi: circleFactoryAbi,
    functionName: "circlesByMember",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && circleFactoryAddress) },
  });
}

export function useCircleSummary(circle: `0x${string}` | undefined) {
  return useReadContract({
    address: circle,
    abi: savingsCircleAbi,
    functionName: "getSummary",
    query: { enabled: Boolean(circle), refetchInterval: 15_000 },
  });
}

export function useCircleSummaries(circles: readonly `0x${string}`[] | undefined) {
  return useReadContracts({
    contracts: (circles ?? []).map((address) => ({
      address,
      abi: savingsCircleAbi,
      functionName: "getSummary" as const,
    })),
    query: { enabled: Boolean(circles && circles.length > 0), refetchInterval: 20_000 },
  });
}

export function useCircleMember(circle: `0x${string}` | undefined, account: `0x${string}` | undefined) {
  return useReadContract({
    address: circle,
    abi: savingsCircleAbi,
    functionName: "getMember",
    args: account ? [account] : undefined,
    query: { enabled: Boolean(circle && account) },
  });
}
