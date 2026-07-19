"use client";

import { useReadContract } from "wagmi";
import { savingsCircleAbi } from "@/lib/abis";

export interface CircleMeta {
  name?: string;
  description?: string;
}

/**
 * Parse the circle's onchain metadataURI into a display name/description.
 * The create wizard stores `data:application/json,{"name","description"}`.
 * Falls back to treating a short plain string as the name (older/cast-created
 * circles), and ignores ipfs/http URIs we can't read synchronously.
 */
export function parseCircleMeta(uri?: string): CircleMeta {
  if (!uri) return {};
  try {
    if (uri.startsWith("data:application/json")) {
      const payload = uri.slice(uri.indexOf(",") + 1);
      const json = JSON.parse(decodeURIComponent(payload)) as CircleMeta;
      return {
        name: typeof json.name === "string" && json.name.trim() ? json.name.trim() : undefined,
        description: typeof json.description === "string" && json.description.trim() ? json.description.trim() : undefined,
      };
    }
    if (!uri.startsWith("ipfs://") && !uri.startsWith("http") && uri.length <= 80) {
      return { name: uri };
    }
  } catch {
    /* malformed metadata — fall through to no name */
  }
  return {};
}

/** Read + parse a circle's name/description from its contract. */
export function useCircleMeta(circle: `0x${string}` | undefined): CircleMeta {
  const { data } = useReadContract({
    address: circle,
    abi: savingsCircleAbi,
    functionName: "metadataURI",
    query: { enabled: Boolean(circle) },
  });
  return parseCircleMeta(data as string | undefined);
}
