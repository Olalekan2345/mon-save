"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-night-900/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
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
                className={`text-sm transition-colors ${
                  pathname === item.href ? "text-ink" : "text-ink-faint hover:text-ink-dim"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block">
            <NetworkBadge />
          </span>
          <Link href="/app" className="btn-secondary hidden sm:inline-flex">
            Open app
          </Link>
          <WalletButton />
        </div>
      </div>
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
