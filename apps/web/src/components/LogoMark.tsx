/**
 * MonSave brand mark — a violet shield holding an "M" over a stacked naira
 * coin. Original vector recreation of the MonSave logo: crisp at every size,
 * theme-aware, no raster asset. Used in the marketing header, app sidebar,
 * footer and favicon.
 */
export function LogoMark({ small = false, className }: { small?: boolean; className?: string }) {
  const dim = small ? "h-7 w-7" : "h-8 w-8";
  return (
    <span aria-hidden className={`inline-flex items-center justify-center ${className ?? dim}`}>
      <MonSaveShield />
    </span>
  );
}

/** The raw shield SVG, reusable for larger brand placements. */
export function MonSaveShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 56" fill="none" className={className ?? "h-full w-full"} role="img" aria-label="MonSave">
      {/* soft glow behind the shield */}
      <ellipse cx="24" cy="28" rx="22" ry="24" fill="url(#msGlow)" opacity="0.55" />

      {/* shield body */}
      <path
        d="M24 2.5 L43.5 9.5 V27.5 C43.5 41.5 35.2 50 24 54 C12.8 50 4.5 41.5 4.5 27.5 V9.5 Z"
        fill="url(#msFill)"
        stroke="url(#msStroke)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* the M */}
      <path
        d="M14.5 32 V18.5 L24 26 L33.5 18.5 V32"
        fill="none"
        stroke="#F4F0FF"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* stacked naira coin */}
      <g>
        <ellipse cx="24" cy="43" rx="8.4" ry="3" fill="#5B3EC8" />
        <ellipse cx="24" cy="40.6" rx="8.4" ry="3" fill="#7C5CF0" />
        <ellipse cx="24" cy="38.2" rx="8.4" ry="3" fill="#C9BCFF" />
        <text
          x="24"
          y="39.7"
          textAnchor="middle"
          fontSize="5.4"
          fontWeight="800"
          fill="#3A2A80"
          fontFamily="var(--font-sans), system-ui, sans-serif"
        >
          ₦
        </text>
      </g>

      <defs>
        <radialGradient id="msGlow" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#9B6CFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#9B6CFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="msFill" x1="24" y1="2.5" x2="24" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8F73FF" />
          <stop offset="55%" stopColor="#6A4AE0" />
          <stop offset="100%" stopColor="#3F2A9E" />
        </linearGradient>
        <linearGradient id="msStroke" x1="24" y1="2.5" x2="24" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C9BCFF" />
          <stop offset="100%" stopColor="#6A4AE0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
