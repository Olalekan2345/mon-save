"use client";

import { useAccount, useReadContract } from "wagmi";
import { getTokens, type SupportedChainId } from "@monsave/config";
import { erc20Abi } from "@/lib/abis";
import { activeChain } from "@/lib/chains";
import { formatToken } from "@/lib/format";

/**
 * Shows the connected wallet's settlement-token balance (e.g. tUSD) as a small
 * pill beside the wallet address. Real onchain balance only — nothing shown
 * until it loads, and nothing at all if no settlement token is configured for
 * the network.
 */
export function TokenBalanceBadge({ variant = "pill" }: { variant?: "pill" | "inline" }) {
  const { address, isConnected } = useAccount();
  const tokens = getTokens(activeChain.id as SupportedChainId);
  const token = tokens[0]; // one settlement token per network today

  const { data } = useReadContract({
    address: token?.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(token && address), refetchInterval: 20_000 },
  });

  if (!isConnected || !token) return null;
  const bal = typeof data === "bigint" ? data : undefined;
  const text = bal !== undefined ? formatToken(bal, token.decimals, token.symbol) : `… ${token.symbol}`;

  if (variant === "inline") {
    return (
      <span className="num text-xs text-ink-dim">
        <span className="text-mint">{bal !== undefined ? formatToken(bal, token.decimals) : "…"}</span> {token.symbol}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink"
      title={`${text} — settlement token balance`}
    >
      <CoinDot />
      <span className="num">{text}</span>
    </span>
  );
}

function CoinDot() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="5" fill="#836EF9" fillOpacity="0.25" stroke="#9B6CFF" strokeWidth="1" />
      <path d="M6 3.2v5.6M4.4 4.6h3.2M4.4 6h3.2" stroke="#C9BCFF" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
