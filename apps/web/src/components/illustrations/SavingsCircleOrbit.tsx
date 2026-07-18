"use client";

/**
 * SavingsCircleOrbit — MonSave's signature visual.
 * A rotating savings circle: member discs orbit a central smart-contract
 * vault; contribution dashes flow inward; the payout marker points at the
 * next collector. Original SVG, no external assets.
 *
 * Fully legible without motion: under prefers-reduced-motion it renders as a
 * static diagram with identical information.
 */
import { motion, useReducedMotion } from "framer-motion";

const MEMBER_TONES = ["#9B6CFF", "#45D7FF", "#31E6A1", "#FFD166", "#FF7A8A"];

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
  const c = 230; // viewBox center
  const orbitR = 168;
  const positions = Array.from({ length: members }, (_, i) => {
    const angle = (i / members) * Math.PI * 2 - Math.PI / 2;
    return { x: c + orbitR * Math.cos(angle), y: c + orbitR * Math.sin(angle), angle };
  });

  return (
    <div className={className} role="img" aria-label={`Illustration of a savings circle: ${members} members around a smart-contract vault, ${label}, contributions flowing in and the next payout going to the highlighted member`}>
      <svg viewBox="0 0 460 460" width={size} height={size} fill="none" className="h-auto w-full max-w-[520px]">
        {/* ambient glow */}
        <ellipse cx={c} cy={c} rx={190} ry={190} fill="url(#orbGlow)" opacity={0.5} />

        {/* orbit ring */}
        <circle cx={c} cy={c} r={orbitR} stroke="#C9BCFF" strokeOpacity={0.22} strokeWidth={1.5} strokeDasharray="3 7" />

        {/* contribution paths: from each member toward the vault */}
        {positions.map((p, i) => {
          const inner = 74;
          const ix = c + inner * Math.cos(p.angle);
          const iy = c + inner * Math.sin(p.angle);
          return (
            <g key={`path-${i}`}>
              <line x1={p.x} y1={p.y} x2={ix} y2={iy} stroke="#836EF9" strokeOpacity={0.28} strokeWidth={1.5} />
              {!reduce && (
                <motion.circle
                  r={3.5}
                  fill={i === activeIndex ? "#31E6A1" : "#C9BCFF"}
                  initial={false}
                  animate={{ cx: [p.x, ix], cy: [p.y, iy], opacity: [0, 1, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.45, ease: "easeIn" }}
                />
              )}
            </g>
          );
        })}

        {/* payout marker: arc from vault to the next collector */}
        <motion.g
          initial={reduce ? undefined : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: [0, 1, 1, 0] }}
          transition={reduce ? undefined : { duration: 3.2, repeat: Infinity, repeatDelay: 1.2, times: [0, 0.2, 0.8, 1] }}
        >
          <line
            x1={c + 74 * Math.cos(positions[activeIndex]!.angle)}
            y1={c + 74 * Math.sin(positions[activeIndex]!.angle)}
            x2={positions[activeIndex]!.x}
            y2={positions[activeIndex]!.y}
            stroke="#31E6A1"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </motion.g>

        {/* central vault */}
        <g>
          <rect x={c - 62} y={c - 58} width={124} height={116} rx={20} fill="#17132C" stroke="#836EF9" strokeOpacity={0.5} strokeWidth={1.5} />
          <rect x={c - 62} y={c - 58} width={124} height={116} rx={20} fill="url(#vaultSheen)" opacity={0.35} />
          {/* shield lock on the vault door */}
          <path
            d={`M ${c} ${c - 26} l 22 9 v 16 c 0 15 -9 24 -22 30 c -13 -6 -22 -15 -22 -30 v -16 z`}
            fill="#836EF9"
            fillOpacity={0.25}
            stroke="#C9BCFF"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <rect x={c - 7} y={c - 4} width={14} height={12} rx={3} fill="#C9BCFF" />
          <path d={`M ${c - 4} ${c - 4} v -5 a 4 4 0 0 1 8 0 v 5`} stroke="#C9BCFF" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          {/* coin slot hint */}
          <rect x={c - 26} y={c + 34} width={52} height={5} rx={2.5} fill="#836EF9" fillOpacity={0.5} />
        </g>

        {/* yield tick rising from the vault */}
        {!reduce && (
          <motion.g
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: [-2, -18] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2 }}
          >
            <text x={c + 44} y={c - 62} fontSize={13} fontWeight={700} fill="#31E6A1" fontFamily="inherit">
              +yield
            </text>
          </motion.g>
        )}

        {/* member discs */}
        {positions.map((p, i) => {
          const isNext = i === activeIndex;
          return (
            <g key={`m-${i}`}>
              {isNext && <circle cx={p.x} cy={p.y} r={26} stroke="#31E6A1" strokeWidth={2} strokeOpacity={0.9} fill="none" />}
              <circle cx={p.x} cy={p.y} r={20} fill="#0D1024" stroke={MEMBER_TONES[i % MEMBER_TONES.length]} strokeWidth={2} />
              <circle cx={p.x} cy={p.y - 5} r={6} fill={MEMBER_TONES[i % MEMBER_TONES.length]} fillOpacity={0.85} />
              <path
                d={`M ${p.x - 9} ${p.y + 11} a 9 7 0 0 1 18 0`}
                fill={MEMBER_TONES[i % MEMBER_TONES.length]}
                fillOpacity={0.85}
              />
              {isNext && (
                <text x={p.x} y={p.y + 40} fontSize={11} fontWeight={700} fill="#31E6A1" textAnchor="middle" fontFamily="inherit">
                  next collector
                </text>
              )}
            </g>
          );
        })}

        {/* round label chip */}
        <g>
          <rect x={c - 52} y={412} width={104} height={26} rx={13} fill="#17132C" stroke="#836EF9" strokeOpacity={0.4} />
          <text x={c} y={429} fontSize={12} fontWeight={600} fill="#C9BCFF" textAnchor="middle" fontFamily="inherit">
            {label}
          </text>
        </g>

        <defs>
          <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#836EF9" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#836EF9" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="vaultSheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B6CFF" />
            <stop offset="100%" stopColor="#5638C4" stopOpacity={0.2} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
