import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Help &amp; support</h1>

      <section className="card space-y-3 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">Learn</h2>
        <ul className="space-y-2 text-sm">
          <li><Link className="text-violet-600 hover:underline" href="/how-it-works">How MonSave works</Link></li>
          <li><Link className="text-violet-600 hover:underline" href="/yield-and-risks">Yield &amp; risks</Link></li>
          <li><Link className="text-violet-600 hover:underline" href="/security">Security &amp; transparency</Link></li>
          <li><Link className="text-violet-600 hover:underline" href="/faq">Frequently asked questions</Link></li>
        </ul>
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">Contact support</h2>
        <p className="text-sm text-ink-dim">
          Support tickets require signing in with your wallet so we can verify circle membership. Describe your issue
          and include the circle address (never share your seed phrase — we will never ask for it).
        </p>
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">Emergency self-service</h2>
        <p className="text-sm leading-relaxed text-ink-dim">
          MonSave is non-custodial: every action you need is available directly on your circle&apos;s page, even if
          MonSave&apos;s servers are down. Due payouts can be executed by anyone, refunds are claimable after
          cancellation, and emergency redemptions are enforced by the contract itself.
        </p>
      </section>
    </div>
  );
}
