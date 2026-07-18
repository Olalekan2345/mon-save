"use client";

/**
 * MonSave illustration system — original inline SVG, bright editorial style,
 * tuned for light/cream surfaces. See docs/ILLUSTRATION_SYSTEM.md.
 */

export { SavingsCircleOrbit } from "./SavingsCircleOrbit";

/** Bright violet + yellow vault with a mint lock indicator. */
export function VaultIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 220" fill="none" className={className} aria-hidden="true">
      <circle cx="40" cy="40" r="34" fill="#FFF4C6" />
      <circle cx="206" cy="180" r="30" fill="#DFFFF1" />
      <rect x="34" y="28" width="172" height="150" rx="26" fill="url(#vg)" stroke="#4A34B0" strokeWidth="2.5" />
      <circle cx="120" cy="92" r="40" fill="#FFF9EE" fillOpacity="0.18" stroke="#DCD3FF" strokeWidth="2" strokeDasharray="4 6" />
      <path d="M120 62l22 9v16c0 15-9 24-22 30-13-6-22-15-22-30V71z" fill="#FFF9EE" />
      <rect x="113" y="90" width="14" height="12" rx="3" fill="#7257F5" />
      <path d="M116 90v-5a4 4 0 018 0v5" stroke="#7257F5" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* coins */}
      <ellipse cx="84" cy="160" rx="18" ry="7" fill="#F5C21B" />
      <ellipse cx="84" cy="154" rx="18" ry="7" fill="#FFD65A" />
      <ellipse cx="156" cy="160" rx="18" ry="7" fill="#2ECB8E" />
      <ellipse cx="156" cy="154" rx="18" ry="7" fill="#43E6A5" />
      <rect x="52" y="178" width="26" height="11" rx="5" fill="#5B41D6" />
      <rect x="162" y="178" width="26" height="11" rx="5" fill="#5B41D6" />
      <defs>
        <linearGradient id="vg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8E70FF" />
          <stop offset="100%" stopColor="#5B41D6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Premium padlock: shield + savings coin + smart-contract brackets. */
export function SmartContractLock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 220" fill="none" className={className} aria-hidden="true">
      <path d="M110 20l68 28v46c0 46-28 72-68 92-40-20-68-46-68-92V48z" fill="url(#lg)" stroke="#4A34B0" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="88" y="100" width="44" height="36" rx="8" fill="#FFF9EE" />
      <path d="M96 100V86a14 14 0 0128 0v14" stroke="#FFF9EE" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="110" cy="116" r="6" fill="#7257F5" />
      <path d="M64 76l-14 16 14 16M156 76l14 16-14 16" stroke="#43E6A5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8E70FF" />
          <stop offset="100%" stopColor="#5B41D6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Coins stepping up beside a variable-rate wave — deliberately not only-up. */
export function YieldGrowthVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 180" fill="none" className={className} aria-hidden="true">
      <line x1="20" y1="150" x2="300" y2="150" stroke="#101426" strokeOpacity="0.2" strokeWidth="1.5" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {Array.from({ length: i + 1 }).map((_, j) => (
            <g key={j}>
              <ellipse cx={60 + i * 60} cy={144 - j * 11} rx="22" ry="8" fill="#F5C21B" />
              <ellipse cx={60 + i * 60} cy={140 - j * 11} rx="22" ry="8" fill="#FFD65A" />
            </g>
          ))}
        </g>
      ))}
      <path d="M28 118 C 60 96, 84 128, 116 108 S 172 66, 204 92 S 260 60, 300 74" stroke="#2ECB8E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="300" cy="74" r="6" fill="#2ECB8E" />
      <rect x="230" y="40" width="66" height="22" rx="11" fill="#2ECB8E" />
      <text x="263" y="55" fontSize="12" fontWeight="800" fill="#FFFFFF" textAnchor="middle" fontFamily="inherit">variable</text>
    </svg>
  );
}

/** Sparse Monad node lattice — decorative accent (works on dark or light via color prop). */
export function MonadNetworkNodes({ className, color = "#7257F5" }: { className?: string; color?: string }) {
  const nodes = [
    [40, 60], [140, 30], [260, 70], [360, 40], [80, 160], [200, 130], [320, 170], [420, 120],
    [30, 260], [150, 230], [280, 280], [400, 240],
  ] as const;
  const edges = [
    [0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 6], [3, 7], [4, 5], [5, 6], [6, 7], [4, 8], [5, 9], [6, 10], [7, 11], [8, 9], [9, 10], [10, 11],
  ] as const;
  return (
    <svg viewBox="0 0 460 320" fill="none" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a]![0]} y1={nodes[a]![1]} x2={nodes[b]![0]} y2={nodes[b]![1]} stroke={color} strokeOpacity={0.4} strokeWidth={1} />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill={color} fillOpacity={0.7} />
      ))}
    </svg>
  );
}

/** Three-coin stack for empty states and CTAs. */
export function FloatingCoinStack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" fill="none" className={className} aria-hidden="true">
      <ellipse cx="60" cy="72" rx="34" ry="12" fill="#F5C21B" />
      <ellipse cx="60" cy="64" rx="34" ry="12" fill="#FFD65A" />
      <ellipse cx="60" cy="50" rx="34" ry="12" fill="#F5C21B" />
      <ellipse cx="60" cy="36" rx="34" ry="12" fill="#FFE59A" />
      <text x="60" y="41" fontSize="11" fontWeight="800" fill="#101426" textAnchor="middle" fontFamily="inherit">tUSD</text>
    </svg>
  );
}

/** Paper-ledger chaos vs. contract clarity — the ajo problem, side by side. */
export function LedgerBeforeAfter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 460 200" fill="none" className={className} aria-hidden="true">
      <g>
        <rect x="24" y="30" width="150" height="140" rx="14" fill="#FFFFFF" stroke="#E6E8EF" strokeWidth="1.5" />
        <line x1="40" y1="58" x2="158" y2="58" stroke="#101426" strokeOpacity="0.3" strokeWidth="2" />
        <line x1="40" y1="80" x2="140" y2="80" stroke="#101426" strokeOpacity="0.2" strokeWidth="2" />
        <path d="M40 102 l24 0 M74 102 l40 0" stroke="#101426" strokeOpacity="0.2" strokeWidth="2" />
        <path d="M42 124c10-6 18 6 28 0s18 6 28 0" stroke="#FF6A61" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M120 118l24 16M144 118l-24 16" stroke="#FF6A61" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <path d="M200 100h52m0 0l-10-10m10 10l-10 10" stroke="#7257F5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <g>
        <rect x="282" y="30" width="150" height="140" rx="14" fill="#7257F5" />
        <path d="M357 44l16 7v11c0 11-6 17-16 21-10-4-16-10-16-21V51z" fill="#FFF9EE" fillOpacity="0.9" />
        {[86, 108, 130].map((y, i) => (
          <g key={i}>
            <circle cx="302" cy={y} r="7" fill="#43E6A5" />
            <path d={`M298.5 ${y} l2.5 2.5 l4.5 -5`} stroke="#101426" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="318" y1={y} x2="414" y2={y} stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="2" />
          </g>
        ))}
      </g>
    </svg>
  );
}
