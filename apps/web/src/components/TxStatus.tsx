"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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

const BUSY: TxPhase[] = ["preparing", "awaiting-signature", "submitted", "pending"];

export function TxStatus({ phase, hash, error }: { phase: TxPhase; hash?: `0x${string}`; error?: string }) {
  const reduce = useReducedMotion();
  if (phase === "idle") return null;

  const isBusy = BUSY.includes(phase);
  const isBad = phase === "failed" || phase === "reverted" || phase === "rejected";
  const tone = phase === "confirmed"
    ? "border-mint/40 text-mint"
    : isBad
      ? "border-critical/40 text-critical"
      : "border-violet-500/40 text-violet-300";

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className={`mt-4 rounded-lg border px-4 py-3 text-sm ${tone}`}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={
        phase === "confirmed" && !reduce
          ? { opacity: 1, y: 0, boxShadow: ["0 0 0px 0px rgba(49,230,161,0)", "0 0 24px -4px rgba(49,230,161,0.5)", "0 0 0px 0px rgba(49,230,161,0)"] }
          : { opacity: 1, y: 0 }
      }
      transition={{ duration: phase === "confirmed" ? 0.9 : 0.25 }}
    >
      <div className="flex items-center gap-2.5">
        <PhaseIcon busy={isBusy} confirmed={phase === "confirmed"} bad={isBad} reduce={!!reduce} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={phase}
            className="font-semibold"
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {LABELS[phase]}
          </motion.p>
        </AnimatePresence>
      </div>
      {hash && (
        <a
          href={txUrl(activeChain.id as SupportedChainId, hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 block truncate font-mono text-xs underline underline-offset-2 opacity-80 hover:opacity-100"
        >
          View on {activeChain.blockExplorers?.default.name}: {hash}
        </a>
      )}
      {error && <p className="mt-1 break-words text-xs opacity-80">{error}</p>}
    </motion.div>
  );
}

function PhaseIcon({ busy, confirmed, bad, reduce }: { busy: boolean; confirmed: boolean; bad: boolean; reduce: boolean }) {
  if (busy) {
    return (
      <motion.span
        aria-hidden
        className="block h-4 w-4 rounded-full border-2 border-current border-t-transparent"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={reduce ? undefined : { duration: 0.9, repeat: Infinity, ease: "linear" }}
      />
    );
  }
  if (confirmed) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 8.5L6.5 12L13 4" />
      </svg>
    );
  }
  if (bad) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    );
  }
  return null;
}
