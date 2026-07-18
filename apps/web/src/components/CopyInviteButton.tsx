"use client";

import { useState } from "react";

/**
 * Copies a per-member invite link to the clipboard with a checkmark
 * micro-interaction. The link is `{origin}/invite/{circle}?to={member}`.
 */
export function CopyInviteButton({ circle, member, className }: { circle: string; member: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/invite/${circle}?to=${member}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — surface the link so the organizer can copy manually
      window.prompt("Copy this invite link:", link);
    }
  }

  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        copied ? "border-mint/40 text-mint" : "border-white/10 text-ink-dim hover:bg-white/5 hover:text-ink"
      } ${className ?? ""}`}
      aria-label={`Copy invite link for ${member}`}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2 6.5L4.5 9L10 3" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <rect x="4.5" y="4.5" width="7.5" height="7.5" rx="1.5" />
            <path d="M9.5 4.5V3A1.5 1.5 0 008 1.5H3A1.5 1.5 0 001.5 3v5A1.5 1.5 0 003 9.5h1.5" />
          </svg>
          Invite link
        </>
      )}
    </button>
  );
}
