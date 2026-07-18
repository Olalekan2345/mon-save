import Link from "next/link";
import { LogoMark } from "./LogoMark";

export function SiteFooter() {
  return (
    <footer className="bg-midnight text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold">
            <LogoMark small />
            <span>
              Mon<span className="text-violet-400">Save</span>
            </span>
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/50">
            Ajo, onchain — the savings circle that earns while it waits. Built on Monad.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            ["How it works", "/how-it-works"],
            ["Yield & risks", "/yield-and-risks"],
            ["Security", "/security"],
            ["FAQ", "/faq"],
          ]}
        />
        <FooterCol
          title="Trust"
          links={[
            ["Security & transparency", "/security"],
            ["Risk disclosure", "/risk-disclosure"],
            ["Terms", "/terms"],
            ["Privacy", "/privacy"],
          ]}
        />
        <div>
          <p className="text-sm font-semibold">Important</p>
          <p className="mt-3 text-xs leading-relaxed text-white/50">
            Yield rates are variable and can change. Smart contracts carry risk. MonSave never guarantees returns and
            never holds custody of your principal outside your circle&apos;s own contract.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-white/40">
          © {new Date().getFullYear()} MonSave · Your money. Your turn. Our code.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-xs text-white/50 transition-colors hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
