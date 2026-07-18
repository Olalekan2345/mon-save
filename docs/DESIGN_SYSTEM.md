# MonSave Design System — Bright African Fintech

"Bright African fintech with Monad-powered transparency." Light-default, warm,
editorial. See docs/REFERENCE_DESIGN_AUDIT.md for the direction rationale.

## Colour tokens (`apps/web/tailwind.config.ts`)

Surfaces (light default):
- `cream` #FFF9EE — page base
- `paper` #FFFFFF — cards
- `line` #E6E8EF — hairline borders

Ink (text, navy on light):
- `ink` #101426 / `ink.dim` #3A4256 / `ink.faint` #667085

Dark accent sections (used sparingly — problem, security, footer, final CTA):
- `midnight` #090C1B / `navy` #101426, with white / white-alpha text

Brand + semantic accents:
- `violet` 500 #7257F5 (primary), 400 #8E70FF, 600 #5B41D6, `lavender` #DCD3FF
- `mint` #2ECB8E / `soft-mint` #DFFFF1 — positive yield / success
- `cyan` #22B8E6 / `soft-blue` #E8F6FF — blockchain / info
- `yellow` #F5C21B / `soft-yellow` #FFF4C6 — savings milestones / warning
- `coral` #FF6A61 / `soft-coral` #FFE4E1 — community / error

Contrast rules:
- Navy `ink` text on cream/mint/yellow/sky/white (≥ 4.5:1 body).
- White text only on violet/midnight/navy surfaces.
- On white, pale violet (300/400) is avoided for text — use violet-600.
- Status never colour-only: always icon + label.

## Section colour rhythm (landing)

cream hero → navy trust → midnight problem → cream schedule → white how-it-works
(coloured step cards: violet/mint/yellow/cyan) → soft-yellow pre-funding →
soft-mint yield → navy security → violet final CTA → midnight footer. Never two
identical grids adjacent; alternate editorial / interactive / full-colour.

## Typography

- UI + body + headings: **Plus Jakarta Sans** 400–800 (`--font-sans`).
- Editorial accent: **Newsreader** italic (`--font-serif`, `.serif` utility) —
  ONE highlighted word/phrase per headline only. Never on numbers, buttons,
  nav, forms, tables, hashes.
- Hashes/addresses: JetBrains Mono.
- Financial figures: `tabular-nums` (`.num`).
- Fluid scale: `text-hero` clamp(2.8→6.2rem, lh .98), `text-display`, `text-title`.

## Components / utilities

- `.card` light (white, navy ink, hairline, soft shadow); `.card-dark` for dark
  sections.
- `.btn-primary` violet+lift; `.btn-secondary` white/navy; `.btn-on-dark`
  override for dark sections; `.btn-success` mint.
- `.input` / `.label` light. Radii: cards 1.5rem, pills full.
- Motion: framer-motion only, reduced-motion aware (see MOTION_SYSTEM.md).

## App theme

Authenticated app uses the same light system: cream shell, white cards, navy
ink, violet primary, mint/yellow/coral/cyan semantic states — kept calm and
readable, no big illustrations behind balances. All wallet/contract/data logic
is unchanged; only styling.
