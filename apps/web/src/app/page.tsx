import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FadeRise, Stagger, StaggerItem, ScaleReveal, FloatSlow } from "@/components/motion";
import { InteractiveSchedule } from "@/components/InteractiveSchedule";
import {
  SavingsCircleOrbit,
  VaultIllustration,
  SmartContractLock,
  YieldGrowthVisual,
  MonadNetworkNodes,
  LedgerBeforeAfter,
  FloatingCoinStack,
} from "@/components/illustrations";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* ── 1. HERO (cream) ─────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-cream bg-cream-fade">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={{ backgroundImage: "radial-gradient(circle, rgba(16,20,38,0.05) 1px, transparent 1px)", backgroundSize: "26px 26px" }}
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
            <div>
              <FadeRise>
                <p className="inline-flex items-center gap-2 rounded-pill border border-line bg-paper px-4 py-1.5 text-xs font-semibold text-ink-dim shadow-soft">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden />
                  Built on Monad · Non-custodial · Rules locked onchain
                </p>
              </FadeRise>
              <FadeRise delay={0.08}>
                <h1 className="mt-6 text-hero font-extrabold">
                  Save together.
                  <br />
                  Earn <span className="serif font-medium text-violet-500">while</span> you wait.
                </h1>
              </FadeRise>
              <FadeRise delay={0.16}>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-dim">
                  Create secure ajo circles where contributions, payout order and every transaction are protected by
                  transparent smart contracts on Monad.
                </p>
              </FadeRise>
              <FadeRise delay={0.24}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/app/circles/new" className="btn-primary px-7 py-3.5 text-base">
                    Create a Savings Circle
                    <span aria-hidden>→</span>
                  </Link>
                  <Link href="/how-it-works" className="btn-secondary px-7 py-3.5 text-base">
                    See how it works
                  </Link>
                </div>
              </FadeRise>
              <FadeRise delay={0.32}>
                <p className="mt-6 text-sm font-medium text-ink-faint">Your money. Your turn. Our code.</p>
              </FadeRise>
            </div>
            <ScaleReveal className="relative mx-auto w-full max-w-[540px]">
              <FloatSlow amplitude={5} duration={7}>
                <SavingsCircleOrbit />
              </FloatSlow>
            </ScaleReveal>
          </div>
        </section>

        {/* ── 2. TRUST STRIP (navy) ───────────────────────────────── */}
        <section className="bg-navy text-white">
          <Stagger className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3">
            <StaggerItem>
              <TrustFact title="Live on Monad Testnet" body="Factory, registry and treasury contracts deployed and exact-match source-verified." />
            </StaggerItem>
            <StaggerItem>
              <TrustFact title="Non-custodial by construction" body="Funds move from your wallet straight into your circle's own contract. No master wallet." />
            </StaggerItem>
            <StaggerItem>
              <TrustFact title="Anyone can settle a due payout" body="Automation is a convenience — never a gatekeeper between you and your money." />
            </StaggerItem>
          </Stagger>
        </section>

        {/* ── 3. THE PROBLEM (navy editorial) ─────────────────────── */}
        <section className="relative overflow-hidden bg-midnight text-white">
          <MonadNetworkNodes color="#8E70FF" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.25]" />
          <div className="relative mx-auto max-w-4xl px-4 py-24 text-center">
            <FadeRise>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">The problem</p>
              <h2 className="mx-auto mt-4 max-w-3xl text-display font-bold">
                Community savings should not depend on one person{" "}
                <span className="serif font-medium text-mint-bright">holding everyone&apos;s money.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
                Ajo and esusu work — millions save this way every month. But the tradition asks one collector to hold
                the cash, keep the records, and never make a mistake. MonSave keeps the tradition and upgrades its
                infrastructure.
              </p>
            </FadeRise>
            <ScaleReveal className="mx-auto mt-12 max-w-3xl">
              <LedgerBeforeAfter className="h-auto w-full" />
            </ScaleReveal>
          </div>
        </section>

        {/* ── 4. INTERACTIVE SCHEDULE (cream) ─────────────────────── */}
        <section className="bg-cream">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <FadeRise>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500">See the rotation</p>
                <h2 className="mt-3 text-display font-bold">
                  Everyone contributes. <span className="serif font-medium text-violet-500">One person</span> collects
                  each round.
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-dim">
                  The payout order is agreed and locked onchain before any money moves. Switch the schedule and watch
                  the circle rotate.
                </p>
              </FadeRise>
            </div>
            <ScaleReveal>
              <InteractiveSchedule />
            </ScaleReveal>
          </div>
        </section>

        {/* ── 5. HOW IT WORKS (white, coloured steps) ─────────────── */}
        <section className="bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-24">
            <FadeRise>
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-violet-500">How it works</p>
              <h2 className="mx-auto mt-3 max-w-xl text-center text-display font-bold">Four steps. Zero “trust me.”</h2>
            </FadeRise>
            <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" gap={0.1}>
              {[
                { n: "01", t: "Create your circle", b: "Choose the contribution, members, schedule and payout order.", bg: "bg-violet-500", fg: "text-white" },
                { n: "02", t: "Invite your people", b: "Every member reviews and approves the same rules onchain.", bg: "bg-mint", fg: "text-ink" },
                { n: "03", t: "Fund securely", b: "Members pre-fund their commitment so future payouts stay protected.", bg: "bg-yellow", fg: "text-ink" },
                { n: "04", t: "Receive on schedule", b: "The contract releases each pot to the scheduled collector.", bg: "bg-cyan", fg: "text-ink" },
              ].map((s) => (
                <StaggerItem key={s.n}>
                  <div className={`h-full rounded-card ${s.bg} ${s.fg} p-6`}>
                    <p className="font-serif text-4xl font-medium opacity-90">{s.n}</p>
                    <h3 className="mt-4 text-lg font-bold">{s.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed opacity-90">{s.b}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── 6. SECURE PRE-FUNDING (yellow) ──────────────────────── */}
        <section className="bg-soft-yellow text-ink">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 lg:grid-cols-2">
            <ScaleReveal className="order-2 mx-auto w-full max-w-sm lg:order-1">
              <VaultIllustration className="h-auto w-full" />
            </ScaleReveal>
            <div className="order-1 lg:order-2">
              <FadeRise>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">Secure Circles</p>
                <h2 className="mt-3 text-display font-bold">
                  Everyone funds first. <span className="serif font-medium text-violet-600">Every payout</span> stays
                  protected.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-ink-dim">
                  Each member escrows their <strong>full commitment</strong> before the first payout, so receiving early
                  never lets anyone skip their later contributions.
                </p>
              </FadeRise>
              <FadeRise delay={0.1}>
                <div className="mt-8 rounded-card border border-ink/10 bg-paper p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">Worked example — 5 friends</p>
                  <ExampleRow label="Contribution per round" value="₦20,000 each" />
                  <ExampleRow label="Each member escrows" value="₦100,000 (5 × ₦20k)" />
                  <ExampleRow label="Every round pays out" value="₦100,000 to one member" />
                  <ExampleRow label="Circle holds in total" value="₦500,000, locked to the schedule" />
                  <p className="pt-2 text-xs leading-relaxed text-ink-faint">
                    Illustrative example, not live data. Circles settle in a supported onchain token; naira figures are
                    estimates.
                  </p>
                </div>
              </FadeRise>
            </div>
          </div>
        </section>

        {/* ── 7. YIELD (mint) ─────────────────────────────────────── */}
        <section className="bg-soft-mint text-ink">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 lg:grid-cols-2">
            <div>
              <FadeRise>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">Earn while it waits</p>
                <h2 className="mt-3 text-display font-bold">
                  Your savings don&apos;t have to <span className="serif font-medium text-mint">sit still.</span>
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-dim">
                  Eligible funds may earn variable yield while waiting for the next payout. Principal and yield are
                  accounted separately in the contract itself.
                </p>
              </FadeRise>
              <FadeRise delay={0.1}>
                <div className="mt-6 rounded-card border border-ink/10 bg-paper p-5">
                  <p className="text-sm font-semibold">Live rate on this network</p>
                  <p className="mt-1 text-sm text-ink-dim">
                    On Monad Testnet, yield runs through a clearly-labelled simulated test pool so you can see the
                    mechanics; on Mainnet it uses a verified Aave V3 market with a live variable rate.
                  </p>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-ink-faint">
                  Rates can change, liquidity may vary and smart contracts carry risk. Yield is never guaranteed.
                </p>
              </FadeRise>
            </div>
            <ScaleReveal className="mx-auto w-full max-w-md">
              <YieldGrowthVisual className="h-auto w-full" />
            </ScaleReveal>
          </div>
        </section>

        {/* ── 8. SECURITY (navy) ──────────────────────────────────── */}
        <section className="relative overflow-hidden bg-navy text-white">
          <div className="relative mx-auto max-w-6xl px-4 py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <ScaleReveal className="mx-auto w-full max-w-xs">
                <SmartContractLock className="h-auto w-full" />
              </ScaleReveal>
              <div>
                <FadeRise>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-bright">Security &amp; transparency</p>
                  <h2 className="mt-3 text-display font-bold">
                    Your circle follows the rules <span className="serif font-medium text-cyan-bright">everyone approved.</span>
                  </h2>
                </FadeRise>
                <Stagger className="mt-8 space-y-4">
                  {[
                    "Rules are locked after activation — payout order cannot be quietly changed.",
                    "Every contribution and payout is a public transaction on Monad.",
                    "Administrators cannot withdraw member principal. The function doesn't exist.",
                    "Each circle is its own smart contract — funds are never pooled.",
                  ].map((t) => (
                    <StaggerItem key={t}>
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint text-ink" aria-hidden>
                          <Check />
                        </span>
                        <p className="text-white/80">{t}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
                <FadeRise delay={0.2}>
                  <p className="mt-8 text-sm leading-relaxed text-white/60">
                    The contracts are open source with a published threat model. They have not yet completed an external
                    audit — and we won&apos;t claim otherwise until one exists.
                  </p>
                  <Link href="/security" className="btn-secondary btn-on-dark mt-4">
                    Read the security model
                  </Link>
                </FadeRise>
              </div>
            </div>
          </div>
        </section>

        {/* ── 9. FINAL CTA (violet) ───────────────────────────────── */}
        <section className="bg-violet-sheen">
          <div className="mx-auto max-w-4xl px-4 py-20 text-center">
            <FadeRise>
              <FloatingCoinStack className="mx-auto h-20 w-auto" />
              <h2 className="mt-6 text-display font-extrabold text-white">
                Create your first <span className="serif font-medium">onchain</span> savings circle.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-lg text-white/85">Your money. Your turn. Our code.</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/app/circles/new"
                  className="inline-flex items-center gap-2 rounded-pill bg-white px-7 py-3.5 text-base font-bold text-violet-600 transition-all duration-200 ease-swift hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.98]"
                >
                  Create a Savings Circle
                </Link>
                <Link href="/faq" className="btn-secondary btn-on-dark px-7 py-3.5 text-base">
                  Questions? Read the FAQ
                </Link>
              </div>
            </FadeRise>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function TrustFact({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-mint-bright" aria-hidden>
        <Check />
      </span>
      <div>
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-white/60">{body}</p>
      </div>
    </div>
  );
}

function ExampleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 text-sm last:border-0">
      <span className="text-ink-faint">{label}</span>
      <span className="num text-right font-semibold">{value}</span>
    </div>
  );
}

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 6.5L4.5 9L10 3" />
    </svg>
  );
}
