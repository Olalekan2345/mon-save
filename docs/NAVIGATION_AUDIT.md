# Navigation Audit (pre-redesign, commit cb39dd7)

## Problems found

1. **Marketing nav reused inside the app.** `SiteHeader` (marketing links: How
   it works / Yield / Security / FAQ) renders on every authenticated screen —
   users inside their dashboard see education links instead of app context.
2. **Flat, competing destinations.** App sidebar mixes "Create circle" (an
   action) with destinations at the same visual level; no primary-action
   emphasis.
3. **No contextual navigation.** The circle-detail page stacks summary, member
   actions, and the payout order in one long scroll — Members/Schedule/Funding/
   Yield/Activity all compete on a single screen with no tabs and no
   deep-linkable sections.
4. **Mobile nav is an afterthought.** Bottom bar is `slice(0, 4)` of the
   desktop list — text-only links, no icons, no Create emphasis, no selected
   state, no safe-area padding; secondary destinations (Help, Invitations,
   Settings) unreachable on mobile.
5. **Duplicate/missing destinations.** `/app/invitations` and `/app/help`
   exist but appear in no navigation; there is no `/app/notifications` at all.
6. **Weak active states.** Sidebar links have no active styling whatsoever;
   marketing links change color only (fails color-independence).
7. **No breadcrumb/context.** Inside a circle there is no way to tell where
   you are or return to My Circles except the browser back button.
8. **Accessibility gaps.** No `aria-current` anywhere; mobile menu lacks focus
   trap/restore; no keyboard model for anything tab-like.

## What must not change

- Wallet connection (`WalletButton`, AppKit init), `NetworkGuard` blocking,
  `useContractAction` lifecycle, all contract reads/writes, route protection
  via honest empty states, and every existing route path (`/app`,
  `/app/circles`, `/app/circles/new`, `/app/circles/[address]`,
  `/app/transactions`, `/app/settings`, `/app/invitations`, `/app/help`,
  `/admin`, marketing pages).

## Regrouping decisions

- Marketing header: max five primary links + Resources dropdown (FAQ, risk
  disclosure, help, security model); legal stays in the footer.
- App shell: sidebar = Overview, My Circles, Invitations, Transactions,
  Notifications (new honest page); Create Circle = emphasized primary action;
  Help & Settings pinned at the bottom; wallet area with network + disconnect.
- Circle page: contextual tabs — Overview / Members / Schedule / Funding /
  Yield / Activity — URL-driven (`?tab=`), back/forward-safe; rare/destructive
  actions (cancel, emergency info, report issue) move to an overflow menu.
- Mobile: compact top bar + five-item bottom nav (Home, Circles, Create,
  Activity, Profile) + full-height drawer for secondary destinations.
