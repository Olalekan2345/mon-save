# Frontend Redesign Audit

Audit of the pre-redesign frontend (commit `90e6911`) before the visual
overhaul. Functional logic listed under "Must not change" is preserved verbatim.

## Current visual weaknesses

- Landing page is a uniform dark surface — no light/dark rhythm, sections blur
  together; every block is a card grid on near-black.
- No hero visual: the product story is told in text only; nothing communicates
  "group savings rotation" visually within five seconds.
- No illustration system: zero original visuals; the only graphics are a
  letter-mark logo and generic inline SVG icons.
- No motion: pages appear all at once; state changes (funding progress,
  settlement) don't animate; nothing guides the eye.
- Typography is Inter-only with modest sizes; hero heading lacks presence;
  numerals are not tabular so balances jitter.
- Buttons have hover color changes only — no lift, press, or focus flourish.
- Header is static; no scroll response.

## Current UX issues

- Landing sections are same-width stacked cards (three near-identical grids).
- "How a Secure Circle works" is 4 static numbered dots — the single most
  important concept (full pre-funding) gets no visual explanation.
- FAQ items are native `<details>` with no animation.
- Circle page action buttons appear/disappear without transitions.
- No count-up or emphasis when real balances load.

## Repeated components to consolidate

- `Fig`/`Field`/`Stat`/`Metric` stat tiles exist 4× with slight variations →
  one `StatTile` with variants.
- Card markup `card p-5/p-6` repeated everywhere → keep utility but add
  motion-aware `ParallaxCard`/`TiltCard` wrappers where warranted.

## Accessibility gaps

- Focus styles exist; but mobile nav has no menu (bottom bar only, missing on
  marketing pages), stepper lacks `aria-label` progress semantics in places,
  and status is sometimes conveyed by color alone (state pills).

## Performance concerns

- None currently (no heavy assets). Redesign must keep it that way: SVG-first
  illustrations, no Lottie/video, transform+opacity-only animation, respect
  `prefers-reduced-motion`.

## Must not change (working product logic)

- `src/lib/wagmi.ts` — AppKit init (module-scope), single-network config.
- `src/lib/chains.ts`, `src/lib/abis.ts`, `src/lib/addresses.ts`.
- `src/hooks/useContractAction.ts` — simulate → sign → confirm lifecycle.
- `src/hooks/useCircles.ts` — factory/circle reads.
- All route paths and their data flows; Zod validation in the wizard.
- Honest empty states and the no-fabricated-data policy.
- `.env.local` wiring to the live Testnet factory.

## Screens redesigned in this pass

1. Marketing: layout/nav/footer, landing (full rebuild: hero + 8 story
   sections), shared prose pages get the new palette automatically.
2. App: dashboard cards + skeletons, circle cards, circle detail spotlights,
   wizard stepper, TxStatus — motion + hierarchy polish, logic untouched.
