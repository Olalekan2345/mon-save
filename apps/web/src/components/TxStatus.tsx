"use client";

import { txUrl } from "@monsave/config";
import { activeChain } from "@/lib/chains";
import type { SupportedChainId } from "@monsave/config";

export type TxPhase =
  | "idle"
  | "preparing"
  | "awaiting-signature"
  | "submitted"
  | "pending"
  | "confirmed"
  | "failed"
  | "reverted"
  | "rejected";

const LABELS: Record<TxPhase, string> = {
  idle: "",
  preparing: "Preparing transaction…",
  "awaiting-signature": "Waiting for your wallet signature…",
  submitted: "Transaction submitted",
  pending: "Transaction pending — waiting for confirmations",
  confirmed: "Confirmed onchain",
  failed: "Transaction failed",
  reverted: "Transaction reverted onchain",
  rejected: "Signature rejected in wallet",
};

export function TxStatus({ phase, hash, error }: { phase: TxPhase; hash?: `0x${string}`; error?: string }) {
  if (phase === "idle") return null;

  const tone =
    phase === "confirmed"
      ? "border-positive/40 text-positive"
      : phase === "failed" || phase === "reverted" || phase === "rejected"
        ? "border-critical/40 text-critical"
        : "border-violet-500/40 text-violet-300";

  return (
    <div role="status" aria-live="polite" className={`mt-4 rounded-lg border px-4 py-3 text-sm ${tone}`}>
      <p className="font-medium">{LABELS[phase]}</p>
      {hash && (
        <a
          href={txUrl(activeChain.id as SupportedChainId, hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block truncate font-mono text-xs underline underline-offset-2 opacity-80 hover:opacity-100"
        >
          View on {activeChain.blockExplorers?.default.name}: {hash}
        </a>
      )}
      {error && <p className="mt-1 break-words text-xs opacity-80">{error}</p>}
    </div>
  );
}
