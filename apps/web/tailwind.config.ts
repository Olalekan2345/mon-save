import type { Config } from "tailwindcss";

/**
 * MonSave design tokens — original identity.
 * Dark near-black foundation, Monad-inspired violet accents, controlled
 * gradients, semantic status colors. WCAG-aware contrast on ink colors.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // foundation
        night: {
          950: "#07060F",
          900: "#0C0A18",
          850: "#110E22",
          800: "#17132C",
          700: "#211C3E",
          600: "#2C2652",
        },
        // violet accent ramp
        violet: {
          300: "#B9A8F9",
          400: "#9E86F5",
          500: "#8265EE",
          600: "#6A4AE0",
          700: "#5638C4",
        },
        // ink (text)
        ink: {
          DEFAULT: "#F2F0FA",
          dim: "#B7B2CC",
          faint: "#7D7794",
        },
        // semantic
        positive: "#3ECF8E",
        caution: "#F2B84B",
        critical: "#F26D6D",
        info: "#5AB6F2",
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
        glow: "0 0 40px -12px rgba(130, 101, 238, 0.45)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -16px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "violet-sheen": "linear-gradient(135deg, #8265EE 0%, #5638C4 60%, #3B2687 100%)",
        "night-fade": "radial-gradient(80% 60% at 50% 0%, #1A1435 0%, #0C0A18 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
