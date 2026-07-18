/**
 * Per-circle, per-account activity log of transactions the user runs through
 * the app. Stored locally (Monad's public RPC caps eth_getLogs at a 100-block
 * range, so full-history scans need the Envio indexer). Every entry is a REAL
 * transaction — real hash, real onchain outcome — never fabricated. The circle
 * page also links to the explorer for the complete, all-members history.
 */
export interface ActivityEntry {
  hash?: `0x${string}`;
  label: string;
  status: "confirmed" | "reverted";
  timestamp: number;
}

const MAX = 50;

function key(circle: string, account: string): string {
  return `monsave.activity.${circle.toLowerCase()}.${account.toLowerCase()}`;
}

export function recordActivity(circle: string, account: string, entry: ActivityEntry): void {
  if (typeof window === "undefined") return;
  try {
    const k = key(circle, account);
    const existing: ActivityEntry[] = JSON.parse(localStorage.getItem(k) ?? "[]");
    // de-dupe by hash
    const filtered = entry.hash ? existing.filter((e) => e.hash !== entry.hash) : existing;
    filtered.unshift(entry);
    localStorage.setItem(k, JSON.stringify(filtered.slice(0, MAX)));
    window.dispatchEvent(new CustomEvent("monsave:activity"));
  } catch {
    // localStorage unavailable — activity view degrades to empty, no crash
  }
}

export function getActivity(circle: string, account: string): ActivityEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key(circle, account)) ?? "[]");
  } catch {
    return [];
  }
}
