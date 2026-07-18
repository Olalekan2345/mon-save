import type { Config } from "tailwindcss";

/**
 * MonSave design tokens — original identity. See docs/DESIGN_SYSTEM.md.
 * Dark midnight foundation + Monad violet brand, with light "cloud" surfaces
 * for marketing rhythm and semantic fintech colors. WCAG-aware ink colors.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // dark foundation
        midnight: "#070716",
        navy: "#0D1024",
        night: {
          950: "#070716",
          900: "#0C0A18",
          850: "#110E22",
          800: "#17132C",
          700: "#211C3E",
          600: "#2C2652",
        },
        // brand
        monad: "#836EF9",
        pulse: "#9B6CFF",
        lavender: "#C9BCFF",
        violet: {
          300: "#C9BCFF",
          400: "#9B6CFF",
          500: "#836EF9",
          600: "#6A4AE0",
          700: "#5638C4",
        },
        // light surfaces
        cloud: "#F8F8FC",
        paper: "#FFFFFF",
        inkwell: "#14122B",
        "inkwell-dim": "#4B4768",
        // ink on dark
        ink: {
          DEFAULT: "#F2F0FA",
          dim: "#B7B2CC",
          faint: "#7D7794",
        },
        // semantic
        mint: "#31E6A1",
        cyan: "#45D7FF",
        sun: "#FFD166",
        coral: "#FF7A8A",
        positive: "#31E6A1",
        caution: "#FFD166",
        critical: "#F26D6D",
        info: "#45D7FF",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "1rem",
        pill: "999px",
      },
      boxShadow: {
        glow: "0 0 40px -12px rgba(131, 110, 249, 0.5)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -16px rgba(0,0,0,0.6)",
        "card-light": "0 1px 2px rgba(20,18,43,0.06), 0 12px 32px -16px rgba(20,18,43,0.14)",
        lift: "0 16px 40px -20px rgba(131, 110, 249, 0.55)",
      },
      backgroundImage: {
        "violet-sheen": "linear-gradient(135deg, #9B6CFF 0%, #836EF9 55%, #5638C4 100%)",
        "night-fade": "radial-gradient(80% 60% at 50% 0%, #1A1435 0%, #0C0A18 70%)",
        "hero-glow":
          "radial-gradient(60% 45% at 70% 35%, rgba(131,110,249,0.22) 0%, transparent 70%), radial-gradient(45% 40% at 20% 80%, rgba(69,215,255,0.10) 0%, transparent 70%)",
        "mint-tint": "linear-gradient(180deg, rgba(49,230,161,0.10) 0%, transparent 100%)",
      },
      transitionTimingFunction: {
        swift: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
