import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { NetworkGuard } from "@/components/NetworkGuard";

const APP_NAV = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/circles", label: "My circles" },
  { href: "/app/circles/new", label: "Create circle" },
  { href: "/app/transactions", label: "Transactions" },
  { href: "/app/settings", label: "Settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
        <aside className="hidden w-48 shrink-0 lg:block" aria-label="App navigation">
          <nav className="sticky top-24 space-y-1">
            {APP_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm text-ink-dim transition-colors hover:bg-white/5 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <NetworkGuard>{children}</NetworkGuard>
        </main>
      </div>
      {/* mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/10 bg-night-900/95 py-2 backdrop-blur lg:hidden"
        aria-label="App navigation (mobile)"
      >
        {APP_NAV.slice(0, 4).map((item) => (
          <Link key={item.href} href={item.href} className="px-3 py-1.5 text-xs text-ink-dim hover:text-ink">
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
