"use client";

/**
 * AppShell — Level 2 navigation: the authenticated application chrome.
 * Desktop: collapsible sidebar + contextual top bar.
 * Mobile: compact top bar + five-item bottom navigation + secondary drawer.
 * See docs/NAVIGATION_ARCHITECTURE.md.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useAccount, useDisconnect } from "wagmi";
import { LogoMark } from "./SiteHeader";
import { NetworkBadge } from "./NetworkGuard";
import { WalletButton } from "./WalletButton";
import { TokenBalanceBadge } from "./TokenBalanceBadge";
import { shortAddress } from "@/lib/format";
import {
  APP_PRIMARY,
  APP_SECONDARY,
  CREATE_CIRCLE,
  MOBILE_BOTTOM,
  Icons,
  isActive,
  type NavItem,
} from "@/navigation/config";

const SIDEBAR_KEY = "monsave.sidebar.collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);

  // restore sidebar preference
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_KEY) === "1");
    } catch {}
  }, []);
  const toggleCollapsed = () => {
    setCollapsed((v) => {
      try {
        localStorage.setItem(SIDEBAR_KEY, v ? "0" : "1");
      } catch {}
      return !v;
    });
  };

  // drawer: close on route change, Escape; lock scroll; restore focus
  useEffect(() => setDrawerOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    if (!drawerOpen) return () => {
      document.body.style.overflow = "";
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        drawerTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen">
      {/* ── desktop sidebar ─────────────────────────────────────── */}
      <motion.aside
        className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-paper lg:flex"
        animate={reduce ? undefined : { width: collapsed ? 80 : 264 }}
        initial={false}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: collapsed ? 80 : 264 }}
        aria-label="Application"
      >
        {/* logo — plain anchor so a click does a full refresh to home */}
        <div className={`flex h-16 items-center border-b border-line ${collapsed ? "justify-center px-2" : "gap-2 px-5"}`}>
          <a href="/" className="flex items-center gap-2 font-extrabold tracking-tight" aria-label="MonSave home">
            <LogoMark small={collapsed} />
            {!collapsed && (
              <span className="text-base">
                Mon<span className="text-violet-600">Save</span>
              </span>
            )}
          </a>
        </div>

        {/* create circle — primary action */}
        <div className={`pt-4 ${collapsed ? "px-3" : "px-4"}`}>
          <Link
            href={CREATE_CIRCLE.href}
            title={collapsed ? CREATE_CIRCLE.label : undefined}
            className={`group flex items-center justify-center gap-2 rounded-xl bg-violet-sheen font-semibold text-white shadow-glow transition-all duration-200 ease-swift hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-violet-300 active:translate-y-0 active:scale-[0.98] ${
              collapsed ? "h-11 w-11 mx-auto" : "h-11 w-full px-4 text-sm"
            }`}
          >
            <Icons.plus className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{CREATE_CIRCLE.label}</span>}
            {collapsed && <span className="sr-only">{CREATE_CIRCLE.label}</span>}
          </Link>
        </div>

        {/* primary nav */}
        <nav className={`mt-5 flex-1 space-y-1 ${collapsed ? "px-3" : "px-3"}`} aria-label="Primary">
          {APP_PRIMARY.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
        </nav>

        {/* secondary nav */}
        <nav className="space-y-1 px-3 pb-3" aria-label="Secondary">
          {APP_SECONDARY.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
          <button
            onClick={toggleCollapsed}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink-dim ${
              collapsed ? "justify-center" : ""
            }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg viewBox="0 0 20 20" className={`h-5 w-5 shrink-0 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12.5 4.5L7 10l5.5 5.5" />
            </svg>
            {!collapsed && <span>Collapse</span>}
          </button>
        </nav>

        {/* wallet area */}
        <SidebarWallet collapsed={collapsed} />
      </motion.aside>

      {/* ── main column ─────────────────────────────────────────── */}
      <div
        className="flex min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-swift"
        style={{ paddingLeft: undefined }}
      >
        <div className={`hidden lg:block ${collapsed ? "w-20" : "w-[264px]"} shrink-0`} aria-hidden />
        <div className={`flex min-h-screen flex-col lg:pl-[264px] ${collapsed ? "lg:!pl-20" : ""}`}>
          {/* top bar */}
          <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                {/* mobile logo — plain anchor so a click does a full refresh to home */}
                <a href="/" className="inline-flex items-center lg:hidden" aria-label="MonSave home">
                  <LogoMark small />
                </a>
                <Breadcrumbs pathname={pathname} />
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <span className="hidden md:block">
                  <NetworkBadge />
                </span>
                <span className="hidden sm:block">
                  <TokenBalanceBadge />
                </span>
                <Link
                  href="/app/notifications"
                  className="hidden h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-dim transition-colors hover:bg-ink/5 hover:text-ink sm:flex"
                  aria-label="Notifications"
                >
                  <Icons.bell className="h-5 w-5" />
                </Link>
                <span className="hidden sm:block">
                  <WalletButton />
                </span>
                {/* mobile drawer trigger */}
                <button
                  ref={drawerTriggerRef}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink sm:hidden"
                  aria-expanded={drawerOpen}
                  aria-controls="app-drawer"
                  aria-label="Open account menu"
                  onClick={() => setDrawerOpen(true)}
                >
                  <Icons.user className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          {/* content */}
          <main className="min-w-0 flex-1 px-4 py-8 pb-28 sm:px-6 lg:pb-10">{children}</main>
        </div>
      </div>

      {/* ── mobile bottom navigation ────────────────────────────── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Application (mobile)"
      >
        <div className="mx-auto flex max-w-md items-end justify-around px-2 pb-2 pt-1.5">
          {MOBILE_BOTTOM.map((item) => {
            if (item.isProfile) {
              return (
                <button
                  key={item.label}
                  onClick={() => setDrawerOpen(true)}
                  className="flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-ink-faint transition-colors hover:text-ink-dim"
                  aria-label="Open profile and account menu"
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span className="text-[11px] font-medium">{item.label}</span>
                </button>
              );
            }
            if (item.isCreate) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="-mt-4 flex flex-col items-center gap-1"
                  aria-label={CREATE_CIRCLE.label}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-sheen text-white shadow-glow transition-transform active:scale-95">
                    {item.icon && <item.icon className="h-5 w-5" />}
                  </span>
                  <span className="text-[11px] font-medium text-ink-faint">{item.label}</span>
                </Link>
              );
            }
            const active = isActive(item, pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-colors ${
                  active ? "text-violet-600" : "text-ink-faint hover:text-ink-dim"
                }`}
              >
                {item.icon && <item.icon className="h-5 w-5" />}
                <span className="text-[11px] font-medium">{item.label}</span>
                <span className={`h-1 w-1 rounded-full ${active ? "bg-violet-400" : "bg-transparent"}`} aria-hidden />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── mobile secondary drawer ─────────────────────────────── */}
      {drawerOpen && <MobileDrawer onClose={() => { setDrawerOpen(false); drawerTriggerRef.current?.focus(); }} />}
    </div>
  );
}

/* ── pieces ─────────────────────────────────────────────────────── */

function SidebarLink({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed: boolean }) {
  const active = isActive(item, pathname);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={`relative flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors duration-150 ${
        collapsed ? "justify-center px-0" : "px-3"
      } ${active ? "bg-violet-500/10 text-ink" : "text-ink-faint hover:bg-ink/5 hover:text-ink-dim"}`}
    >
      {active && <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-violet-400" aria-hidden />}
      {item.icon && <item.icon className={`h-5 w-5 shrink-0 ${active ? "text-violet-600" : ""}`} />}
      {!collapsed && <span>{item.label}</span>}
      {collapsed && <span className="sr-only">{item.label}</span>}
    </Link>
  );
}

function SidebarWallet({ collapsed }: { collapsed: boolean }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className={`border-t border-line p-3 ${collapsed ? "text-center" : ""}`}>
      {isConnected && address ? (
        <div className={collapsed ? "space-y-2" : "flex items-center gap-3 rounded-lg px-2 py-2"}>
          <span className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/12 text-violet-600" aria-hidden>
            <Icons.user className="h-4 w-4" />
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-xs text-ink">{shortAddress(address)}</p>
              <div className="mt-0.5">
                <TokenBalanceBadge variant="inline" />
              </div>
              <button onClick={() => disconnect()} className="mt-0.5 block text-[11px] text-ink-faint hover:text-critical">
                Disconnect
              </button>
            </div>
          )}
          {collapsed && (
            <button onClick={() => disconnect()} className="block w-full text-[10px] text-ink-faint hover:text-critical" title="Disconnect wallet">
              Exit
            </button>
          )}
        </div>
      ) : (
        <div className={collapsed ? "px-1" : ""}>{!collapsed && <WalletButton />}</div>
      )}
      {!collapsed && (
        <div className="mt-2 px-2">
          <NetworkBadge />
        </div>
      )}
    </div>
  );
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const crumbs: { label: string; href?: string }[] = [];
  if (pathname === "/app") crumbs.push({ label: "Overview" });
  else if (pathname === "/app/circles") crumbs.push({ label: "My Circles" });
  else if (pathname === "/app/circles/new") crumbs.push({ label: "My Circles", href: "/app/circles" }, { label: "Create Circle" });
  else if (pathname.startsWith("/app/circles/")) {
    const addr = pathname.split("/")[3] ?? "";
    crumbs.push(
      { label: "My Circles", href: "/app/circles" },
      { label: addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr },
    );
  } else if (pathname === "/app/transactions") crumbs.push({ label: "Transactions" });
  else if (pathname === "/app/notifications") crumbs.push({ label: "Notifications" });
  else if (pathname === "/app/invitations") crumbs.push({ label: "Invitations" });
  else if (pathname === "/app/settings") crumbs.push({ label: "Settings" });
  else if (pathname === "/app/help") crumbs.push({ label: "Help & Support" });
  else crumbs.push({ label: "MonSave" });

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        {crumbs.map((c, i) => (
          <li key={i} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && (
              <span className="text-ink-faint" aria-hidden>
                /
              </span>
            )}
            {c.href ? (
              <Link href={c.href} className="shrink-0 text-ink-faint hover:text-ink-dim">
                {c.label}
              </Link>
            ) : (
              <span className="truncate font-semibold text-ink" aria-current="page">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
  }, []);

  const links = [
    { label: "Notifications", href: "/app/notifications", icon: Icons.bell },
    { label: "Invitations", href: "/app/invitations", icon: Icons.invite },
    { label: "Help & Support", href: "/app/help", icon: Icons.help },
    { label: "Settings", href: "/app/settings", icon: Icons.settings },
    { label: "Risk disclosure", href: "/risk-disclosure", icon: Icons.help },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Account menu" id="app-drawer">
      <button className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={onClose} />
      <motion.div
        ref={panelRef}
        className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col border-l border-line bg-paper"
        initial={reduce ? false : { x: "100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="text-sm font-bold">Account</p>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink"
            aria-label="Close menu"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-line px-5 py-4">
          {isConnected && address ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-sm">{shortAddress(address)}</p>
                <TokenBalanceBadge />
              </div>
              <div className="mt-2">
                <NetworkBadge />
              </div>
            </>
          ) : (
            <WalletButton />
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Account">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-ink-dim hover:bg-ink/5 hover:text-ink" onClick={onClose}>
              <l.icon className="h-5 w-5" />
              {l.label}
            </Link>
          ))}
        </nav>

        {isConnected && (
          <div className="border-t border-line p-4">
            <button
              onClick={() => {
                disconnect();
                onClose();
              }}
              className="w-full rounded-lg border border-critical/40 px-4 py-2.5 text-sm font-semibold text-critical hover:bg-critical/10"
            >
              Disconnect wallet
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
