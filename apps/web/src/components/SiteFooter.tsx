import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="text-sm font-semibold">MonSave</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-faint">
            Ajo, onchain — the trustless savings circle that earns while it waits. Built on Monad.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            ["How it works", "/how-it-works"],
            ["Secure Circles", "/how-it-works#secure-circle"],
            ["Yield & risks", "/yield-and-risks"],
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
          <p className="mt-2 text-xs leading-relaxed text-ink-faint">
            Yield rates are variable and can change. Smart contracts carry risk. MonSave never guarantees returns and
            never holds custody of your principal outside your circle&apos;s own contract.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-xs text-ink-faint hover:text-ink-dim">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
