import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* hero */}
        <section className="bg-night-fade">
          <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 text-center">
            <p className="mx-auto w-fit rounded-pill border border-violet-500/30 bg-violet-500/10 px-4 py-1 text-xs font-medium text-violet-300">
              Built on Monad · Non-custodial · Rules locked onchain
            </p>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Ajo, onchain — the savings circle that{" "}
              <span className="bg-violet-sheen bg-clip-text text-transparent">earns while it waits</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-dim">
              Save together without relying on a human collector. Your group&apos;s rules are locked onchain, every
              payout can be independently verified, and idle funds may earn variable yield while they wait.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/app" className="btn-primary px-7 py-3 text-base">
                Start a circle
              </Link>
              <Link href="/how-it-works" className="btn-secondary px-7 py-3 text-base">
                How it works
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink-faint">
              Your money. Your turn. Our code.
            </p>
          </div>
        </section>

        {/* the problem */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold">Traditional ajo asks for a lot of trust</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-ink-dim">
            In a traditional rotating savings group, one person holds everyone&apos;s money, keeps the records, and
            remembers the payout order. MonSave replaces that person with transparent smart-contract rules.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              title="Trustless by design"
              body="Smart-contract escrow enforces the rules your group approved. No middleman can run off with the money."
            />
            <Feature
              title="Earns while it waits"
              body="Idle funds may be supplied to Aave on Monad, so payouts can arrive with real variable yield attached."
            />
            <Feature
              title="Your group, your rules"
              body="Daily, weekly or monthly rounds. Every member reviews and approves the exact rules onchain before any money moves."
            />
            <Feature
              title="Verifiable, always"
              body="Every contribution, payout and yield claim is a real transaction you can inspect on the Monad explorer."
            />
          </div>
        </section>

        {/* how secure circles work */}
        <section className="border-y border-white/5 bg-night-850/50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-center text-2xl font-bold">How a Secure Circle works</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-4">
              <Step n={1} title="Create & invite" body="Set the contribution, schedule and member list. Everyone reviews the rules." />
              <Step n={2} title="Approve & fund" body="Each member approves the rules onchain, then escrows their full commitment before the circle starts." />
              <Step n={3} title="Rounds settle" body="Each round, the full pot goes to the next member in the locked payout order. Anyone can execute a due payout." />
              <Step n={4} title="Everyone gets paid" body="Because every member pre-funds in full, nobody can stop future payouts after receiving their own." />
            </div>
            <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-ink-faint">
              Full pre-funding is what makes a Secure Circle trustless: your future contributions are already
              collateralized in the contract, so an early payout can never be taken and abandoned.
            </p>
          </div>
        </section>

        {/* honesty section */}
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold">What we won&apos;t promise</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-dim">
            Yield comes from a variable-rate lending market and can go up, down, or to zero. Smart contracts carry
            risk, and MonSave&apos;s contracts have not yet completed an external audit. We show your principal and
            yield separately, we never touch your principal, and we never use the words &ldquo;guaranteed&rdquo; or
            &ldquo;risk-free&rdquo; — because nothing onchain is.
          </p>
          <Link href="/risk-disclosure" className="btn-secondary mt-6">
            Read the full risk disclosure
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold text-violet-300">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-dim">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-violet-sheen text-sm font-bold text-white shadow-glow">
        {n}
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">{body}</p>
    </div>
  );
}
