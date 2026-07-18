# MonSave Motion System

Library: framer-motion 11 (the only animation dependency). Everything else is
CSS transforms. No GSAP, no Lottie, no canvas.

## Principles

1. Motion explains state; it never decorates for its own sake in the app.
2. Transform + opacity only — no layout-shifting properties.
3. Every utility respects `prefers-reduced-motion` (via `useReducedMotion`):
   reduced mode renders the final state instantly.
4. Marketing pages may be expressive; app pages are calm and fast (<300ms).
5. Nothing loops forever except: hero orbit rotation, background orb drift —
   both pause under reduced motion.

## Tokens (src/components/motion.tsx)

- Springs: `spring.soft` {stiffness 120, damping 20} for reveals;
  `spring.snappy` {stiffness 400, damping 30} for presses/toggles.
- Durations: marketing reveal 0.6s; app transitions 0.2–0.3s.
- Stagger: 80ms children, 120ms for hero sequence.

## Utilities

- `FadeRise` — fade + 24px rise on scroll into view (`whileInView`, once).
- `Stagger` / `StaggerItem` — orchestrated children reveals.
- `ScaleReveal` — 0.94 → 1 with soft spring (cards, illustrations).
- `AnimatedCounter` — count-up for REAL values only, after data loads;
  renders the final number immediately under reduced motion.
- `FloatSlow` — ±6px y drift, 6s ease, for hero decoration only.
- `PressableScale` — whileTap 0.97 / whileHover −2px lift for buttons.

## Sequences

Hero (on load): vault scales in → avatars pop around orbit (staggered) →
contribution dashes animate inward (SVG stroke-dashoffset) → lock closes
(rotate + scale) → payout marker rotates to next member → yield tick rises.
Total < 3.5s, non-blocking, CTA visible from first paint.

Transaction lifecycle (app): status chip crossfades between phases; confirmed
state gets one 400ms mint glow — never continuous pulsing.

## Accessibility

- Reduced motion: all `whileInView`/loops disabled, counters render final
  values, orbit becomes static diagram (information identical without motion).
- No motion conveys information alone — every animated state has a text label.
