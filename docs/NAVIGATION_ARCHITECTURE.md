# Navigation Architecture

Three levels, three visual treatments, one typed config
(`apps/web/src/navigation/config.ts` — no route strings duplicated in
components).

## Level 1 — Public website (MarketingHeader)

Floating capsule header: container-width, rounded-2xl, blur+border on scroll,
72px → 60px height. Left: logo. Center (≤5): Product, How it works, Security,
Yield, Resources ▾ (FAQ, Risk disclosure, Security model, Help centre).
Right: Connect wallet, primary "Open MonSave". Active link = soft violet pill
with shared-layout indicator (framer-motion `layoutId`), `aria-current="page"`.
Legal (Terms/Privacy) lives in the footer only.

## Level 2 — Application shell (AppShell)

- **Desktop sidebar** (fixed; expanded 264px / collapsed 80px, animated,
  preference kept in `localStorage`): logo → Create Circle (primary button;
  plus-icon square when collapsed, with tooltip) → Overview, My Circles,
  Invitations, Transactions, Notifications → bottom: Help & Support, Settings
  → wallet area (avatar dot, short address, network, disconnect). Active item
  = violet surface + left accent bar + `aria-current`; "My Circles" stays
  active for any `/app/circles/*` route.
- **Top bar**: mobile menu trigger, breadcrumbs (Overview / My Circles /
  Circle 0x…), right: NetworkBadge (real chain state), wallet control.
- **Mobile**: compact top bar; bottom nav (5): Home, Circles, Create
  (elevated center), Activity, Profile (opens drawer). Drawer (right sheet,
  Escape-close, focus-restore, body-lock): wallet + network, Notifications,
  Invitations, Help, Settings, Risk disclosure, Disconnect.

## Level 3 — Circle contextual navigation (ContextTabs)

Inside `/app/circles/[address]`: segmented tab row — Overview, Members,
Schedule, Funding, Yield, Activity — driven by `?tab=` (deep-linkable,
back/forward-safe via router navigation; active state derived from the URL,
never local-only state). Sliding indicator (`layoutId`), roving-focus keyboard
model (arrows, Home/End), `role="tab"`/`aria-selected`, horizontal scroll with
edge fade + auto-scroll-into-view on mobile. Rare/destructive actions (Cancel
circle, Emergency information, Report an issue) live in an OverflowActionMenu,
not beside the tabs.

## Badge policy

Badge counts render only from real data sources (none are wired yet — so no
badges render). Never fabricated.
