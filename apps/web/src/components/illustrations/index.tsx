"use client";

/**
 * MonSave illustration system — original inline SVG components.
 * See docs/ILLUSTRATION_SYSTEM.md. All decorative pieces are aria-hidden;
 * meaningful ones take role="img" + label at the call site.
 */

export { SavingsCircleOrbit } from "./SavingsCircleOrbit";

/** Front-facing vault with contract-shield door and coin stack. */
export function VaultIllustration({ className, onLight = false }: { className?: string; onLight?: boolean }) {
  const body = onLight ? "#FFFFFF" : "#17132C";
  const line = onLight ? "#14122B" : "#C9BCFF";
  return (
    <svg viewBox="0 0 220 200" fill="none" className={className} aria-hidden="true">
      <rect x={30} y={24} width={160} height={140} rx={18} fill={body} stroke="#836EF9" strokeWidth={2} />
      <rect x={30} y={24} width={160} height={140} rx={18} fill="url(#vgrad)" opacity={0.18} />
      <circle cx={110} cy={86} r={38} stroke="#836EF9" strokeWidth={2} fill="none" strokeDasharray="4 6" />
      <path d="M110 58l20 8v15c0 13-8 21-20 26-12-5-20-13-20-26V66z" fill="#836EF9" fillOpacity={0.22} stroke={line} strokeWidth={2} strokeLinejoin="round" />
      <rect x={104} y={84} width={12} height={10} rx={2.5} fill={line} />
      <path d="M107 84v-4a3.5 3.5 0 017 0v4" stroke={line} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      {/* coins */}
      <g>
        <ellipse cx={78} cy={148} rx={16} ry={6} fill="#FFD166" fillOpacity={0.9} />
        <ellipse cx={78} cy={143} rx={16} ry={6} fill="#FFD166" />
        <ellipse cx={142} cy={148} rx={16} ry={6} fill="#31E6A1" fillOpacity={0.9} />
        <ellipse cx={142} cy={143} rx={16} ry={6} fill="#31E6A1" />
      </g>
      {/* feet */}
      <rect x={48} y={164} width={24} height={10} rx={4} fill="#836EF9" fillOpacity={0.6} />
      <rect x={148} y={164} width={24} height={10} rx={4} fill="#836EF9" fillOpacity={0.6} />
      <defs>
        <linearGradient id="vgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9B6CFF" />
          <stop offset="100%" stopColor="#5638C4" stopOpacity={0.3} />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Shield + lock + code brackets — the security mark. */
export function SmartContractLock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden="true">
      <path d="M100 18l64 26v44c0 44-26 68-64 86-38-18-64-42-64-86V44z" fill="#836EF9" fillOpacity={0.14} stroke="#836EF9" strokeWidth={2.5} strokeLinejoin="round" />
      <rect x={82} y={92} width={36} height={30} rx={6} fill="#C9BCFF" />
      <path d="M89 92V80a11 11 0 0122 0v12" stroke="#C9BCFF" strokeWidth={5} fill="none" strokeLinecap="round" />
      <circle cx={100} cy={106} r={4.5} fill="#14122B" />
      <path d="M60 70l-12 14 12 14M140 70l12 14-12 14" stroke="#45D7FF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Coins stepping up beside a variable-rate wave — deliberately not only-up. */
export function YieldGrowthVisual({ className, onLight = false }: { className?: string; onLight?: boolean }) {
  const grid = onLight ? "#14122B" : "#C9BCFF";
  return (
    <svg viewBox="0 0 320 180" fill="none" className={className} aria-hidden="true">
      <line x1={20} y1={150} x2={300} y2={150} stroke={grid} strokeOpacity={0.25} strokeWidth={1.5} />
      {/* coin steps */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {Array.from({ length: i + 1 }).map((_, j) => (
            <g key={j}>
              <ellipse cx={60 + i * 60} cy={144 - j * 11} rx={22} ry={8} fill="#FFD166" stroke="#14122B" strokeOpacity={0.15} />
              <ellipse cx={60 + i * 60} cy={140 - j * 11} rx={22} ry={8} fill="#FFE29E" />
            </g>
          ))}
        </g>
      ))}
      {/* variable-rate wave: rises AND dips — honest */}
      <path d="M28 118 C 60 96, 84 128, 116 108 S 172 66, 204 92 S 260 60, 300 74" stroke="#31E6A1" strokeWidth={3} strokeLinecap="round" fill="none" />
      <circle cx={300} cy={74} r={5} fill="#31E6A1" />
      <text x={236} y={52} fontSize={12} fontWeight={700} fill="#31E6A1" fontFamily="inherit">
        variable
      </text>
    </svg>
  );
}

/** Sparse Monad node lattice — background decoration only. */
export function MonadNetworkNodes({ className }: { className?: string }) {
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
        <line key={i} x1={nodes[a]![0]} y1={nodes[a]![1]} x2={nodes[b]![0]} y2={nodes[b]![1]} stroke="#836EF9" strokeOpacity={0.35} strokeWidth={1} />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="#836EF9" fillOpacity={0.6} />
      ))}
    </svg>
  );
}

/** Three-coin stack for empty states and CTAs. */
export function FloatingCoinStack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" fill="none" className={className} aria-hidden="true">
      <ellipse cx={60} cy={72} rx={34} ry={12} fill="#836EF9" fillOpacity={0.35} />
      <ellipse cx={60} cy={64} rx={34} ry={12} fill="#9B6CFF" />
      <ellipse cx={60} cy={50} rx={34} ry={12} fill="#836EF9" />
      <ellipse cx={60} cy={36} rx={34} ry={12} fill="#C9BCFF" />
      <text x={60} y={41} fontSize={11} fontWeight={800} fill="#14122B" textAnchor="middle" fontFamily="inherit">
        tUSD
      </text>
    </svg>
  );
}

/** Paper-ledger chaos vs. contract clarity — the ajo problem, side by side. */
export function LedgerBeforeAfter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 460 200" fill="none" className={className} aria-hidden="true">
      {/* before: paper ledger with scribbles */}
      <g opacity={0.9}>
        <rect x={24} y={30} width={150} height={140} rx={10} fill="#FFFFFF" stroke="#14122B" strokeOpacity={0.2} />
        <line x1={40} y1={58} x2={158} y2={58} stroke="#14122B" strokeOpacity={0.35} strokeWidth={2} />
        <line x1={40} y1={80} x2={140} y2={80} stroke="#14122B" strokeOpacity={0.25} strokeWidth={2} />
        <path d="M40 102 l24 0 M74 102 l40 0" stroke="#14122B" strokeOpacity={0.25} strokeWidth={2} />
        <path d="M42 124c10-6 18 6 28 0s18 6 28 0" stroke="#FF7A8A" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <path d="M120 118l24 16M144 118l-24 16" stroke="#FF7A8A" strokeWidth={2.5} strokeLinecap="round" />
        <text x={99} y={190} fontSize={12} fontWeight={600} fill="currentColor" opacity={0.6} textAnchor="middle" fontFamily="inherit">
          one collector, one notebook
        </text>
      </g>
      {/* arrow */}
      <path d="M200 100h52m0 0l-10-10m10 10l-10 10" stroke="#836EF9" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {/* after: contract card with checks */}
      <g>
        <rect x={282} y={30} width={150} height={140} rx={10} fill="#17132C" stroke="#836EF9" strokeWidth={1.5} />
        <path d="M357 44l16 7v11c0 11-6 17-16 21-10-4-16-10-16-21V51z" fill="#836EF9" fillOpacity={0.3} stroke="#C9BCFF" strokeWidth={1.5} />
        {[86, 108, 130].map((y, i) => (
          <g key={i}>
            <circle cx={302} cy={y} r={7} fill="#31E6A1" fillOpacity={0.2} stroke="#31E6A1" strokeWidth={1.5} />
            <path d={`M298.5 ${y} l2.5 2.5 l4.5 -5`} stroke="#31E6A1" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1={318} y1={y} x2={414} y2={y} stroke="#C9BCFF" strokeOpacity={0.4} strokeWidth={2} />
          </g>
        ))}
        <text x={357} y={190} fontSize={12} fontWeight={600} fill="currentColor" opacity={0.6} textAnchor="middle" fontFamily="inherit">
          rules locked onchain
        </text>
      </g>
    </svg>
  );
}
