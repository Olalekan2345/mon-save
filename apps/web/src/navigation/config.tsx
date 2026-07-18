/**
 * Single typed navigation configuration — the only place routes are listed.
 * Components render from this; no duplicated route strings.
 */
import type { ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  /** active when pathname === href, or startsWith when matchPrefix */
  matchPrefix?: boolean;
  description?: string;
  icon?: (props: { className?: string }) => ReactNode;
}

/* ── icons (16/20px stroke set, original) ─────────────────────────── */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const Icons = {
  home: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 20 20" className={className} {...stroke} aria-hidden>
      <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1h-4v-5H8v5H4a1 1 0 01-1-1V9.5z" />
    </svg>
  ),
  circles: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 20 20" className={className} {...stroke} aria-hidden>
      <circle cx={10} cy={10} r={7} strokeDasharray="3.5 3" />
      <circle cx={10} cy={10} r={2.5} />
    </svg>
  ),
  invite: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 20 20" className={className} {...stroke} aria-hidden>
      <rect x={3} y={5} width={14} height={11} rx={2} />
      <path d="M3 7l7 5 7-5" />
    </svg>
  ),
  activity: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 20 20" className={className} {...stroke} aria-hidden>
      <path d="M2.5 11h3l2.5-6 4 10 2.5-6h3" />
    </svg>
  ),
  bell: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 20 20" className={className} {...stroke} aria-hidden>
      <path d="M10 3a5 5 0 015 5v3l1.5 2.5H3.5L5 11V8a5 5 0 015-5z" />
      <path d="M8.5 16a1.5 1.5 0 003 0" />
    </svg>
  ),
  help: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 20 20" className={className} {...stroke} aria-hidden>
      <circle cx={10} cy={10} r={7.5} />
      <path d="M8 8a2 2 0 113.5 1.3c-.7.7-1.5 1-1.5 2" />
      <circle cx={10} cy={14.2} r={0.4} fill="currentColor" />
    </svg>
  ),
  settings: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 20 20" className={className} {...stroke} aria-hidden>
      <circle cx={10} cy={10} r={2.6} />
      <path d="M10 2.8v2.4M10 14.8v2.4M2.8 10h2.4M14.8 10h2.4M4.9 4.9l1.7 1.7M13.4 13.4l1.7 1.7M15.1 4.9l-1.7 1.7M6.6 13.4l-1.7 1.7" />
    </svg>
  ),
  plus: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 20 20" className={className} {...stroke} strokeWidth={2.2} aria-hidden>
      <path d="M10 4.5v11M4.5 10h11" />
    </svg>
  ),
  user: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 20 20" className={className} {...stroke} aria-hidden>
      <circle cx={10} cy={7} r={3.2} />
      <path d="M3.8 17a6.2 6.2 0 0112.4 0" />
    </svg>
  ),
};

/* ── level 1: public marketing ─────────────────────────────────────── */

export const MARKETING_PRIMARY: NavItem[] = [
  { label: "Product", href: "/#product" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Security", href: "/security" },
  { label: "Yield", href: "/yield-and-risks" },
];

export const MARKETING_RESOURCES: NavItem[] = [
  { label: "FAQ", href: "/faq", description: "Plain-language answers about circles, wallets and gas" },
  { label: "Risk disclosure", href: "/risk-disclosure", description: "The risks, stated plainly before you save" },
  { label: "Security model", href: "/security", description: "What admins can never do, enforced in code" },
  { label: "Help centre", href: "/app/help", description: "Guides and support" },
];

/* ── level 2: application shell ────────────────────────────────────── */

export const APP_PRIMARY: NavItem[] = [
  { label: "Overview", href: "/app", icon: Icons.home },
  { label: "My Circles", href: "/app/circles", matchPrefix: true, icon: Icons.circles },
  { label: "Invitations", href: "/app/invitations", icon: Icons.invite },
  { label: "Transactions", href: "/app/transactions", icon: Icons.activity },
  { label: "Notifications", href: "/app/notifications", icon: Icons.bell },
];

export const APP_SECONDARY: NavItem[] = [
  { label: "Help & Support", href: "/app/help", icon: Icons.help },
  { label: "Settings", href: "/app/settings", icon: Icons.settings },
];

export const CREATE_CIRCLE = { label: "Create Circle", href: "/app/circles/new" };

/* ── level 2: mobile bottom navigation (max five) ──────────────────── */

export const MOBILE_BOTTOM: (NavItem & { isCreate?: boolean; isProfile?: boolean })[] = [
  { label: "Home", href: "/app", icon: Icons.home },
  { label: "Circles", href: "/app/circles", matchPrefix: true, icon: Icons.circles },
  { label: "Create", href: "/app/circles/new", icon: Icons.plus, isCreate: true },
  { label: "Activity", href: "/app/transactions", icon: Icons.activity },
  { label: "Profile", href: "#drawer", icon: Icons.user, isProfile: true },
];

/* ── level 3: circle contextual tabs (?tab=) ───────────────────────── */

export const CIRCLE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "members", label: "Members" },
  { id: "schedule", label: "Schedule" },
  { id: "funding", label: "Funding" },
  { id: "yield", label: "Yield" },
  { id: "activity", label: "Activity" },
] as const;

export type CircleTabId = (typeof CIRCLE_TABS)[number]["id"];

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.matchPrefix) {
    // "My Circles" stays active inside a specific circle, but not on /app itself
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }
  return pathname === item.href;
}
