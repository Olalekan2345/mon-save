# MonSave Design System

## Color tokens (Tailwind: `apps/web/tailwind.config.ts`)

Foundation (dark surfaces):
- `midnight` #070716 — page base for dark sections
- `navy` #0D1024 — raised dark surface
- `night.850/800/700` — legacy raised surfaces (kept for app screens)

Brand:
- `monad` #836EF9 — Monad violet, primary brand
- `pulse` #9B6CFF — electric purple, gradients/hover
- `lavender` #C9BCFF — tints, outlines, subtle text on dark

Light surfaces (marketing rhythm):
- `cloud` #F8F8FC — light section background
- `paper` #FFFFFF — light card surface
- `inkwell` #14122B — text on light surfaces

Semantic:
- `mint` #31E6A1 — positive yield / success (fintech green)
- `cyan` #45D7FF — blockchain activity, links to explorer
- `sun` #FFD166 — milestones, cautions on dark
- `coral` #FF7A8A — community accents, destructive on light
- `critical` #F26D6D — errors (kept)

Rules:
- Never every-section-purple: alternate midnight → cloud → violet-tinted →
  paper → midnight across the landing page.
- Financial text ≥ 4.5:1 contrast; on `cloud` use `inkwell`, on `midnight` use
  `ink` (#F2F0FA).
- Status is never color-only: pair pills with text labels.

## Typography

- Display + headings + body: **Plus Jakarta Sans** (`--font-sans`), Inter
  system fallback.
- Hashes/addresses: **JetBrains Mono** (`--font-mono`).
- Financial figures: `tabular-nums` (utility `.num`).
- Scale: hero `text-5xl/6xl -tracking-[0.02em] font-extrabold`; section
  headings `text-3xl/4xl font-bold`; body `text-base/relaxed`; fine print
  `text-sm` minimum for financial info.

## Spacing & shape

- Section vertical rhythm: `py-24` desktop / `py-16` mobile.
- Radius: cards `rounded-card` (1rem), pills `rounded-pill`, hero art blobs
  free-form. Never fully-round rectangles on financial data tables.
- Elevation: 1px inset light line + soft long shadow (`shadow-card`); glow
  (`shadow-glow`) reserved for brand moments (vault, primary CTA), never on
  every card.

## Components

- `StatTile` — the one stat pattern (label, tabular value, hint, tone).
- `FintechButton` = `.btn-primary/.btn-secondary` + motion press/hover.
- `SectionShell` — width, rhythm, light/dark variant.
- Status pills: state → tone map lives in one place (`CircleCard`).

## Voice

Confident, warm, plain-language. Never "guaranteed", "risk-free", "audited"
(no audit exists). NGN figures always "Estimated NGN value" with source+time.
