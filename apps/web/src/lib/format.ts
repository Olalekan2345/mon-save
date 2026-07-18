import { formatUnits } from "viem";

/** Format a token amount from base units — integer math until display. */
export function formatToken(amount: bigint, decimals: number, symbol?: string): string {
  const s = formatUnits(amount, decimals);
  const [whole = "0", frac = ""] = s.split(".");
  const withSep = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmedFrac = frac.replace(/0+$/, "").slice(0, 6);
  const text = trimmedFrac ? `${withSep}.${trimmedFrac}` : withSep;
  return symbol ? `${text} ${symbol}` : text;
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatDate(unixSeconds: bigint | number): string {
  const ms = Number(unixSeconds) * 1000;
  if (!Number.isFinite(ms) || ms === 0) return "—";
  return new Date(ms).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function frequencyLabel(seconds: bigint | number): string {
  const s = Number(seconds);
  if (s === 86400) return "Daily";
  if (s === 604800) return "Weekly";
  if (s >= 2419200 && s <= 2678400) return "Monthly";
  const days = Math.round(s / 86400);
  return `Every ${days} day${days === 1 ? "" : "s"}`;
}
