import type { Config } from "tailwindcss";

/**
 * MonSave design tokens — "Bright African fintech with Monad transparency."
 * Light default (cream/white surfaces, navy ink), violet primary, disciplined
 * semantic accents. Dark is an accent section, not the whole app.
 * See docs/DESIGN_SYSTEM.md + docs/REFERENCE_DESIGN_AUDIT.md.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── theme-aware neutral tokens (flip in dark mode via CSS vars) ──
        ink: {
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)",
          dim: "rgb(var(--c-ink-dim) / <alpha-value>)",
          faint: "rgb(var(--c-ink-faint) / <alpha-value>)",
        },
        cream: "rgb(var(--c-cream) / <alpha-value>)",
        paper: "rgb(var(--c-paper) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        // ── fixed dark surfaces (accent sections, same in both themes) ──
        midnight: "#090C1B",
        navy: "#101426",
        // brand violet
        violet: {
          300: "#DCD3FF",
          400: "#8E70FF",
          500: "#7257F5",
          600: "#5B41D6",
          700: "#4A34B0",
        },
        lavender: "#DCD3FF",
        // semantic accents
        mint: "#2ECB8E",
        "mint-bright": "#43E6A5",
        "soft-mint": "#DFFFF1",
        cyan: "#22B8E6",
        "cyan-bright": "#45D8FF",
        "soft-blue": "#E8F6FF",
        yellow: "#F5C21B",
        "soft-yellow": "#FFF4C6",
        coral: "#FF6A61",
        "soft-coral": "#FFE4E1",
        muted: "#667085",
        // legacy semantic aliases kept so existing class usages remain valid
        positive: "#2ECB8E",
        caution: "#F5C21B",
        critical: "#FF6A61",
        info: "#22B8E6",
        pulse: "#8E70FF",
        // legacy dark scale (used only inside intentional dark sections)
        night: {
          950: "#090C1B",
          900: "#0C1024",
          850: "#141A32",
          800: "#1B2240",
          700: "#28305A",
          600: "#39447A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // fluid editorial scale
        hero: ["clamp(2.8rem, 7vw, 6.2rem)", { lineHeight: "0.98", letterSpacing: "-0.03em" }],
        display: ["clamp(2rem, 4.5vw, 3.4rem)", { lineHeight: "1.03", letterSpacing: "-0.02em" }],
        title: ["clamp(1.5rem, 3vw, 2.2rem)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        card: "1.5rem",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(16,20,38,0.05), 0 12px 32px -18px rgba(16,20,38,0.18)",
        lift: "0 12px 28px -12px rgba(114,87,245,0.45)",
        glow: "0 0 40px -12px rgba(114,87,245,0.4)",
        card: "0 2px 8px rgba(16,20,38,0.05), 0 12px 32px -18px rgba(16,20,38,0.18)",
      },
      backgroundImage: {
        "violet-sheen": "linear-gradient(135deg, #8E70FF 0%, #7257F5 55%, #5B41D6 100%)",
        "cream-fade": "radial-gradient(90% 70% at 50% 0%, #FFFDF7 0%, #FFF9EE 60%)",
        "dot-grid": "radial-gradient(circle, rgba(16,20,38,0.06) 1px, transparent 1px)",
      },
      transitionTimingFunction: {
        swift: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
