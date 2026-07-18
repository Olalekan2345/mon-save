"use client";

/**
 * SavingsCircleOrbit — MonSave's signature visual, bright editorial style.
 * A rotating ajo circle: colourful member discs orbit a violet savings vault;
 * contribution tokens flow inward; a mint payout marker points at the next
 * collector. Original SVG, tuned for light/cream backgrounds.
 * Fully legible without motion (prefers-reduced-motion → static diagram).
 */
import { motion, useReducedMotion } from "framer-motion";

const MEMBER_TONES = ["#7257F5", "#22B8E6", "#2ECB8E", "#F5C21B", "#FF6A61", "#8E70FF"];

export function SavingsCircleOrbit({
  size = 460,
  members = 5,
  activeIndex = 1,
  label = "Round 2 of 5",
  className,
}: {
  size?: number;
  members?: number;
  activeIndex?: number;
  label?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const c = 230;
  const orbitR = 168;
  const positions = Array.from({ length: members }, (_, i) => {
    const angle = (i / members) * Math.PI * 2 - Math.PI / 2;
    return { x: c + orbitR * Math.cos(angle), y: c + orbitR * Math.sin(angle), angle };
  });

  return (
    <div
      className={className}
      role="img"
      aria-label={`A savings circle of ${members} members around a smart-contract vault, ${label}, with contributions flowing in and the next payout highlighted`}
    >
      <svg viewBox="0 0 460 460" width={size} height={size} fill="none" className="h-auto w-full max-w-[540px]">
        {/* soft decorative blobs */}
        <circle cx="70" cy="90" r="60" fill="#FFF4C6" />
        <circle cx="400" cy="380" r="52" fill="#DFFFF1" />

        {/* orbit ring */}
        <circle cx={c} cy={c} r={orbitR} stroke="#7257F5" strokeOpacity={0.25} strokeWidth={1.5} strokeDasharray="2 8" />

        {/* contribution tokens flowing inward */}
        {positions.map((p, i) => {
          const inner = 78;
          const ix = c + inner * Math.cos(p.angle);
          const iy = c + inner * Math.sin(p.angle);
          return (
            <g key={`path-${i}`}>
              <line x1={p.x} y1={p.y} x2={ix} y2={iy} stroke="#7257F5" strokeOpacity={0.2} strokeWidth={1.5} />
              {!reduce && (
                <motion.circle
                  r={4}
                  fill={i === activeIndex ? "#2ECB8E" : MEMBER_TONES[i % MEMBER_TONES.length]}
                  initial={false}
                  animate={{ cx: [p.x, ix], cy: [p.y, iy], opacity: [0, 1, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.45, ease: "easeIn" }}
                />
              )}
            </g>
          );
        })}

        {/* payout marker */}
        <motion.line
          x1={c + 78 * Math.cos(positions[activeIndex]!.angle)}
          y1={c + 78 * Math.sin(positions[activeIndex]!.angle)}
          x2={positions[activeIndex]!.x}
          y2={positions[activeIndex]!.y}
          stroke="#2ECB8E"
          strokeWidth={3}
          strokeLinecap="round"
          initial={reduce ? undefined : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: [0, 1, 1, 0] }}
          transition={reduce ? undefined : { duration: 3.2, repeat: Infinity, repeatDelay: 1.2, times: [0, 0.2, 0.8, 1] }}
        />

        {/* central vault — bright violet */}
        <g>
          <rect x={c - 64} y={c - 60} width={128} height={120} rx={26} fill="url(#vaultFill)" />
          <rect x={c - 64} y={c - 60} width={128} height={120} rx={26} stroke="#4A34B0" strokeWidth={2} />
          {/* shield lock */}
          <path
            d={`M ${c} ${c - 28} l 22 9 v 16 c 0 15 -9 24 -22 30 c -13 -6 -22 -15 -22 -30 v -16 z`}
            fill="#FFF9EE"
            fillOpacity={0.95}
          />
          <rect x={c - 7} y={c - 4} width={14} height={12} rx={3} fill="#7257F5" />
          <path d={`M ${c - 4} ${c - 4} v -5 a 4 4 0 0 1 8 0 v 5`} stroke="#7257F5" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          {/* yellow coin slot */}
          <rect x={c - 26} y={c + 36} width={52} height={6} rx={3} fill="#F5C21B" />
        </g>

        {/* yield badge */}
        {!reduce && (
          <motion.g
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: [-2, -20] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2 }}
          >
            <rect x={c + 40} y={c - 78} width={58} height={22} rx={11} fill="#2ECB8E" />
            <text x={c + 69} y={c - 63} fontSize={12} fontWeight={800} fill="#FFFFFF" textAnchor="middle" fontFamily="inherit">
              + yield
            </text>
          </motion.g>
        )}

        {/* member discs */}
        {positions.map((p, i) => {
          const isNext = i === activeIndex;
          const tone = MEMBER_TONES[i % MEMBER_TONES.length]!;
          return (
            <g key={`m-${i}`}>
              {isNext && <circle cx={p.x} cy={p.y} r={27} stroke="#2ECB8E" strokeWidth={3} fill="none" />}
              <circle cx={p.x} cy={p.y} r={21} fill="#FFFFFF" stroke={tone} strokeWidth={3} />
              <circle cx={p.x} cy={p.y - 5} r={6} fill={tone} />
              <path d={`M ${p.x - 9} ${p.y + 11} a 9 7 0 0 1 18 0`} fill={tone} />
              {isNext && (
                <text x={p.x} y={p.y + 42} fontSize={11} fontWeight={700} fill="#2ECB8E" textAnchor="middle" fontFamily="inherit">
                  next collector
                </text>
              )}
            </g>
          );
        })}

        {/* round label chip */}
        <g>
          <rect x={c - 54} y={410} width={108} height={28} rx={14} fill="#101426" />
          <text x={c} y={428} fontSize={12} fontWeight={700} fill="#FFFFFF" textAnchor="middle" fontFamily="inherit">
            {label}
          </text>
        </g>

        <defs>
          <linearGradient id="vaultFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8E70FF" />
            <stop offset="100%" stopColor="#5B41D6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
