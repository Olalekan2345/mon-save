"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WalletButton } from "./WalletButton";
import { NetworkBadge } from "./NetworkGuard";

const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/yield-and-risks", label: "Yield & risks" },
  { href: "/security", label: "Security" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menu on route change + lock body scroll while open
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ease-swift ${
        scrolled ? "border-white/10 bg-midnight/85 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-all duration-300 ease-swift ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <LogoMark />
            <span>
              Mon<span className="text-violet-400">Save</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href ? "text-ink" : "text-ink-faint hover:text-ink-dim"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden lg:block">
            <NetworkBadge />
          </span>
          <Link href="/app" className="btn-secondary hidden sm:inline-flex">
            Open app
          </Link>
          <span className="hidden sm:block">
            <WalletButton />
          </span>
          {/* mobile menu button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-ink md:hidden"
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
        <div id="mobile-menu" className="border-t border-white/10 bg-midnight/95 px-4 pb-6 pt-3 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-3 text-base font-medium text-ink-dim hover:bg-white/5 hover:text-ink">
                {item.label}
              </Link>
            ))}
            <Link href="/app" className="btn-primary mt-3 w-full">
              Open app
            </Link>
            <div className="mt-3 flex justify-center">
              <WalletButton />
            </div>
            <div className="mt-3 flex justify-center">
              <NetworkBadge />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function LogoMark() {
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-sheen font-mono text-sm font-bold text-white shadow-glow"
    >
      M
    </span>
  );
}
