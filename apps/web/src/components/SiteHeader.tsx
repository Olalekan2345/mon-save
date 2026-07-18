"use client";

/**
 * MarketingHeader — floating capsule navigation for the public website.
 * Level 1 of the navigation architecture (docs/NAVIGATION_ARCHITECTURE.md).
 * The authenticated app uses AppShell instead — never this header.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { WalletButton } from "./WalletButton";
import { LogoMark } from "./LogoMark";
import { ThemeToggle } from "./ThemeToggle";
import { MARKETING_PRIMARY, MARKETING_RESOURCES, isActive } from "@/navigation/config";

export function SiteHeader() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const resourcesButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setResourcesOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // dropdown: close on Escape / outside click / focus leaving
  useEffect(() => {
    if (!resourcesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setResourcesOpen(false);
        resourcesButtonRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!resourcesRef.current?.contains(e.target as Node)) setResourcesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [resourcesOpen]);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border px-4 transition-all duration-300 ease-swift sm:px-6 ${
          scrolled
            ? "h-[60px] border-line bg-paper/90 shadow-soft backdrop-blur-md"
            : "h-[72px] border-line/60 bg-paper/70 backdrop-blur-sm"
        }`}
      >
        {/* left: logo — plain anchor so a click does a full refresh to home */}
        <a href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight" aria-label="MonSave home">
          <LogoMark />
          <span>
            Mon<span className="text-violet-400">Save</span>
          </span>
        </a>

        {/* center: primary links (≤5) */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {MARKETING_PRIMARY.map((item) => {
            const active = isActive(item, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-pill px-3.5 py-2 text-sm font-medium transition-colors duration-150 ${
                  active ? "text-ink" : "text-ink-faint hover:bg-ink/5 hover:text-ink-dim"
                }`}
              >
                {active && !reduce && (
                  <motion.span
                    layoutId="marketing-active-pill"
                    className="absolute inset-0 rounded-pill bg-violet-500/15"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    aria-hidden
                  />
                )}
                {active && reduce && <span className="absolute inset-0 rounded-pill bg-violet-500/15" aria-hidden />}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}

          {/* Resources dropdown */}
          <div className="relative" ref={resourcesRef}>
            <button
              ref={resourcesButtonRef}
              className="flex items-center gap-1 rounded-pill px-3.5 py-2 text-sm font-medium text-ink-faint transition-colors duration-150 hover:bg-ink/5 hover:text-ink-dim"
              aria-expanded={resourcesOpen}
              aria-haspopup="menu"
              onClick={() => setResourcesOpen((v) => !v)}
            >
              Resources
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden className={`transition-transform duration-200 ${resourcesOpen ? "rotate-180" : ""}`}>
                <path d="M2 3.5L5 6.5L8 3.5" />
              </svg>
            </button>
            {resourcesOpen && (
              <motion.div
                role="menu"
                aria-label="Resources"
                className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-line bg-paper p-2 shadow-soft"
                initial={reduce ? false : { opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {MARKETING_RESOURCES.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    role="menuitem"
                    className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-ink/5"
                    onClick={() => setResourcesOpen(false)}
                  >
                    <span className="block text-sm font-semibold text-ink">{item.label}</span>
                    {item.description && <span className="mt-0.5 block text-xs text-ink-faint">{item.description}</span>}
                  </Link>
                ))}
              </motion.div>
            )}
          </div>
        </nav>

        {/* right: actions */}
        <div className="flex shrink-0 items-center gap-2.5">
          <ThemeToggle className="hidden sm:flex" />
          <span className="hidden lg:block">
            <WalletButton />
          </span>
          <Link href="/app" className="btn-primary hidden sm:inline-flex">
            Open MonSave
          </Link>
          {/* mobile menu button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {menuOpen ? <path d="M3 3l12 12M15 3L3 15" /> : <path d="M2 5h14M2 9h14M2 13h14" />}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="mx-auto mt-2 max-w-6xl rounded-2xl border border-line bg-paper px-4 pb-6 pt-3 shadow-soft md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {MARKETING_PRIMARY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item, pathname) ? "page" : undefined}
                className={`rounded-lg px-3 py-3 text-base font-medium ${
                  isActive(item, pathname) ? "bg-violet-500/10 text-ink" : "text-ink-dim hover:bg-ink/5 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <p className="mt-2 px-3 text-xs font-bold uppercase tracking-wider text-ink-faint">Resources</p>
            {MARKETING_RESOURCES.map((item) => (
              <Link key={item.label} href={item.href} className="rounded-lg px-3 py-2.5 text-sm text-ink-dim hover:bg-ink/5 hover:text-ink">
                {item.label}
              </Link>
            ))}
            <Link href="/app" className="btn-primary mt-3 w-full">
              Open MonSave
            </Link>
            <div className="mt-3 flex justify-center">
              <WalletButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// LogoMark is re-exported so existing imports (`import { LogoMark } from
// "./SiteHeader"`) keep working after the brand mark moved to its own file.
export { LogoMark };
