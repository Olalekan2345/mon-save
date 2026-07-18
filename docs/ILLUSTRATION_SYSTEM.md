# MonSave Illustration System

All illustrations are **original, hand-written inline SVG React components** —
no stock art, no PiggyVest derivatives, no downloads, no binary assets. SVG
keeps them crisp, tiny (<8KB each), themeable via currentColor/tokens, and
animatable with stroke-dashoffset + framer-motion transforms.

Location: `apps/web/src/components/illustrations/`

## Vocabulary

Shared geometry so everything reads as one family:
- 2px rounded strokes, `lavender`/`monad` on dark, `monad`/`inkwell` on light
- Fills limited to brand gradient (`monad → pulse`) and token colors
- Soft glow = blurred ellipse underlay, used at most once per composition
- Coins = 6-decimal "tUSD" discs with a subtle notch, never dollar bills
- People = abstract avatar discs with warm gradient rims (no faces — avoids
  uncanny AI people entirely, stays respectful and universal)

## Components

1. `SavingsCircleOrbit` — THE hero visual. Central vault + shield lock,
   member avatar discs on an orbit ring, animated contribution dashes flowing
   inward, payout marker rotating to the next collector, small yield tick.
   Fully static (and equally legible) under reduced motion. Also reused on
   the circle-detail page with REAL member counts/positions.
2. `VaultIllustration` — front-facing vault with contract-shield door,
   stacked coins inside; used in "secure pre-funding".
3. `SmartContractLock` — shield + lock + code brackets; security section.
4. `YieldGrowthVisual` — coins stepping up beside a variable-rate wave (a
   wave, deliberately not an only-up chart) + "variable" label.
5. `LedgerBeforeAfter` — paper ledger/chat scribbles vs. contract vault with
   check marks; the ajo problem section, animated crossfade on scroll.
6. `MonadNetworkNodes` — sparse node/edge lattice, used as section background
   at 6–10% opacity; pure decoration, `aria-hidden`.
7. `FloatingCoinStack` — 3-coin stack for empty states and CTAs.

## Rules

- Every illustration `aria-hidden="true"` with adjacent real text, or given a
  `role="img"` + `aria-label` when it carries meaning.
- Illustrative numbers inside marketing art are decorative labels (e.g.
  "Round 3 of 5") and must never resemble live account data.
- No meme styling, no astronauts, no flying money, no wealth promises.
