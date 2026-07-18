# Reference Design Audit — bright editorial redesign

Reference (inspiration only): https://rent-pact.vercel.app/ — a light, airy,
editorial fintech site. Inspected via content fetch (live computed-style
inspection wasn't available in this build environment, so the direction follows
the brief's explicit tokens plus the observed structure).

## What makes the reference effective

- **Light, generous, trustworthy.** White/off-white base, big whitespace, calm
  rhythm — reads as premium and honest, not "crypto."
- **Editorial headlines.** Large bold sans-serif with emphasized key phrases;
  hierarchy from scale, not ornament.
- **A real, interactive proof.** A "Try it yourself" toggle (Monthly/Quarterly/
  …) and a real dashboard preview — "a real dashboard, not a promise."
- **Restraint.** One accent used deliberately; radii moderate; shadows soft.

## What should influence MonSave

- Flip the default from dark to **light/cream**; use dark only as an accent
  section, not the whole app.
- **Editorial type**: strong sans (Plus Jakarta Sans) + a **serif display
  accent** (Newsreader) for one highlighted hero word/quote only.
- An **interactive schedule preview** ("Try it yourself") clearly labelled as
  illustrative.
- Bright but disciplined colour rhythm across sections (cream → navy → mint →
  yellow → violet → sky), never all-purple.

## What must NOT be copied

Reference logo, brand, exact layout, copy, illustrations, components, source,
images, colours, animation sequences. MonSave's identity is its own: African
fintech + Monad transparency, violet/mint/yellow/coral on cream.

## Existing MonSave weaknesses (pre-redesign)

- Whole site is near-black + violet → reads as generic Web3 dashboard.
- No light surfaces, no colour rhythm, no editorial serif accent.
- Illustrations tuned for dark only; muted.
- App is uniformly dark; financial screens feel heavy rather than clean.

## Proposed direction

"Bright African fintech with Monad-powered transparency." Light default (cream
`#FFF9EE`, white cards, navy ink `#101426`), violet primary `#7257F5`, semantic
mint/yellow/coral/cyan. Editorial: Plus Jakarta Sans 400–800 + Newsreader serif
for highlighted hero words. Fluid `clamp()` type. Disciplined per-section colour.

## Accessibility

- Navy text on cream/mint/yellow/sky; white text on violet/midnight — all ≥
  4.5:1 for body.
- Status never colour-only (icon + label). Visible focus. Reduced-motion.

## Performance

- Original inline SVG illustrations (no raster/Lottie). `next/font` for Plus
  Jakarta + Newsreader (display swap, limited weights). Transform/opacity motion,
  reduced-motion aware. No new animation libs (framer-motion only).

## Pages requiring redesign

Marketing header, landing (hero + all story sections + interactive schedule),
footer, prose/legal pages; then the authenticated app (shell, dashboard, circle
cards, circle detail, wizard, transaction states) converted to the light theme.
All wallet/contract/data logic is untouched — only styling/structure changes.
