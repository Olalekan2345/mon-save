import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FadeRise, Stagger, StaggerItem, ScaleReveal, FloatSlow } from "@/components/motion";
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
        {/* ── 1. HERO ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-midnight bg-hero-glow">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 pt-16 lg:grid-cols-2 lg:pt-24">
            <div>
              <FadeRise>
                <p className="inline-flex items-center gap-2 rounded-pill border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-lavender">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden />
                  Built on Monad · Non-custodial · Rules locked onchain
                </p>
              </FadeRise>
              <FadeRise delay={0.08}>
                <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] -tracking-[0.02em] sm:text-6xl">
                  Save together.{" "}
                  <span className="bg-violet-sheen bg-clip-text text-transparent">Earn while you wait.</span>
                </h1>
              </FadeRise>
              <FadeRise delay={0.16}>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-dim">
                  Create secure ajo circles where contributions, payout order and every transaction are protected by
                  transparent smart contracts on Monad.
                </p>
              </FadeRise>
              <FadeRise delay={0.24}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/app/circles/new" className="btn-primary px-7 py-3.5 text-base">
                    Start a savings circle
                    <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                  <Link href="/how-it-works" className="btn-secondary px-7 py-3.5 text-base">
                    See how it works
                  </Link>
                </div>
              </FadeRise>
              <FadeRise delay={0.32}>
                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-ink-faint">
                  <li className="flex items-center gap-1.5">
                    <Check /> No human collector holds the money
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check /> Every payout verifiable on MonadScan
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check /> Contracts source-verified
                  </li>
                </ul>
              </FadeRise>
            </div>
            <ScaleReveal className="relative mx-auto w-full max-w-[520px]">
              <FloatSlow amplitude={5} duration={7}>
                <SavingsCircleOrbit />
              </FloatSlow>
            </ScaleReveal>
          </div>
        </section>

        {/* ── 2. TRUST STRIP (real facts only — no invented stats) ── */}
        <section className="border-y border-white/5 bg-navy">
          <Stagger className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
            <StaggerItem>
              <TrustFact
                title="Live on Monad Testnet"
                body="Factory, registry and treasury contracts deployed and exact-match source-verified."
              />
            </StaggerItem>
            <StaggerItem>
              <TrustFact
                title="Non-custodial by construction"
                body="Funds move from your wallet straight into your circle's own contract. There is no master wallet."
              />
            </StaggerItem>
            <StaggerItem>
              <TrustFact
                title="Anyone can settle a due payout"
                body="Automation is a convenience — never a gatekeeper between you and your money."
              />
            </StaggerItem>
          </Stagger>
        </section>

        {/* ── 3. THE AJO PROBLEM (light section) ───────────────────── */}
        <section className="bg-cloud text-inkwell">
          <div className="mx-auto max-w-6xl px-4 py-24">
            <FadeRise>
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-violet-600">The problem</p>
              <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-bold sm:text-4xl">
                Community savings should not depend on one person holding everyone&apos;s money.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-inkwell-dim">
                Ajo and esusu work — millions save this way every month. But the tradition asks one collector to hold
                the cash, keep the records, remember the order, and never make a mistake. MonSave keeps the tradition
                and upgrades its infrastructure.
              </p>
            </FadeRise>
            <ScaleReveal className="mx-auto mt-12 max-w-3xl text-inkwell">
              <LedgerBeforeAfter className="h-auto w-full" />
            </ScaleReveal>
            <Stagger className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
              {[
                ["Records", "Paper ledgers and chat threads become onchain events anyone can verify."],
                ["Custody", "The collector's pocket becomes a smart-contract vault nobody can raid."],
                ["Order", "“Whose turn is it?” becomes a payout order locked before a single payment moves."],
              ].map(([t, b]) => (
                <StaggerItem key={t}>
                  <div className="card-light h-full p-5">
                    <h3 className="text-sm font-bold text-violet-700">{t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-inkwell-dim">{b}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── 4. HOW IT WORKS (white) ───────────────────────────────── */}
        <section className="bg-paper text-inkwell">
          <div className="mx-auto max-w-6xl px-4 py-24">
            <FadeRise>
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-violet-600">How it works</p>
              <h2 className="mx-auto mt-3 max-w-xl text-center text-3xl font-bold sm:text-4xl">
                Four steps. Zero &ldquo;trust me.&rdquo;
              </h2>
            </FadeRise>
            <div className="relative mt-14">
              {/* connecting path (desktop) */}
              <div aria-hidden className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-violet-500/10 via-violet-500/50 to-violet-500/10 lg:block" />
              <Stagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4" gap={0.12}>
                {[
                  ["Create a circle", "Choose your contribution, members, schedule and payout order."],
                  ["Invite & approve", "Every member reviews and approves the same rules onchain."],
                  ["Fund securely", "Members pre-fund their commitment so future payouts remain protected."],
                  ["Rotate & receive", "The contract releases each pot to the scheduled collector."],
                ].map(([t, b], i) => (
                  <StaggerItem key={t}>
                    <div className="relative">
                      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-sheen text-lg font-extrabold text-white shadow-lift">
                        {i + 1}
                      </div>
                      <h3 className="mt-4 text-lg font-bold">{t}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-inkwell-dim">{b}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* ── 5. SECURE PRE-FUNDING (violet tint, worked example) ──── */}
        <section className="bg-night-850">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 lg:grid-cols-2">
            <ScaleReveal className="order-2 mx-auto w-full max-w-sm lg:order-1">
              <VaultIllustration className="h-auto w-full" />
            </ScaleReveal>
            <div className="order-1 lg:order-2">
              <FadeRise>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-lavender">Secure Circles</p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Why everyone funds upfront</h2>
                <p className="mt-4 text-base leading-relaxed text-ink-dim">
                  The classic ajo failure: someone collects early, then stops paying. A Secure Circle removes the
                  possibility entirely — every member escrows their <strong className="text-ink">full commitment</strong>{" "}
                  before the first payout, so future rounds are already funded on day one.
                </p>
              </FadeRise>
              <FadeRise delay={0.1}>
                <div className="card mt-8 space-y-3 p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">Worked example — 5 friends</p>
                  <ExampleRow label="Contribution per round" value="₦20,000-equivalent each" />
                  <ExampleRow label="Each member escrows" value="₦100,000-equivalent (5 rounds × ₦20k)" />
                  <ExampleRow label="Every round pays out" value="₦100,000-equivalent to one member" />
                  <ExampleRow label="Circle holds in total" value="₦500,000-equivalent, locked to the schedule" />
                  <p className="pt-1 text-xs leading-relaxed text-ink-faint">
                    Illustrative example — not live account data. Circles settle in a supported onchain token; naira
                    figures are estimates.
                  </p>
                </div>
              </FadeRise>
            </div>
          </div>
        </section>

        {/* ── 6. YIELD (light mint) ─────────────────────────────────── */}
        <section className="bg-cloud text-inkwell">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 lg:grid-cols-2">
            <div>
              <FadeRise>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">Earn while it waits</p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                  Idle funds may earn <span className="text-violet-600">variable</span> yield before the next payout.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-inkwell-dim">
                  When a verified Aave market exists for your settlement token, a circle can opt in to supply waiting
                  funds there. Principal and yield are accounted separately in the contract itself — your dashboard
                  never mixes them.
                </p>
              </FadeRise>
              <FadeRise delay={0.1}>
                <div className="card-light mt-6 p-5">
                  <p className="text-sm font-semibold">Live rate on this network</p>
                  <p className="mt-1 text-sm text-inkwell-dim">
                    Yield integration is unavailable on Monad Testnet — no verified Aave market exists for the demo
                    token, so MonSave shows you this message instead of a made-up APY.
                  </p>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-inkwell-dim">
                  Rates can change, liquidity may vary and smart contracts carry risk. Yield is never guaranteed.
                </p>
              </FadeRise>
            </div>
            <ScaleReveal className="mx-auto w-full max-w-md">
              <YieldGrowthVisual onLight className="h-auto w-full" />
            </ScaleReveal>
          </div>
        </section>

        {/* ── 7. SECURITY (dark + nodes) ────────────────────────────── */}
        <section className="relative overflow-hidden bg-midnight">
          <MonadNetworkNodes className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]" />
          <div className="relative mx-auto max-w-6xl px-4 py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <ScaleReveal className="mx-auto w-full max-w-xs">
                <SmartContractLock className="h-auto w-full" />
              </ScaleReveal>
              <div>
                <FadeRise>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan">Security & transparency</p>
                  <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                    Your circle follows the rules everyone approved.
                  </h2>
                </FadeRise>
                <Stagger className="mt-8 space-y-4">
                  {[
                    "Rules are locked after activation — payout order cannot be quietly changed.",
                    "Every contribution and payout is a public transaction on Monad.",
                    "Administrators cannot withdraw member principal. The function doesn't exist.",
                    "Each circle is its own smart contract — funds are never pooled.",
                    "Designed for transparent onchain verification, not “trust us.”",
                  ].map((t) => (
                    <StaggerItem key={t}>
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint/15 text-mint" aria-hidden>
                          <Check />
                        </span>
                        <p className="text-sm leading-relaxed text-ink-dim">{t}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
                <FadeRise delay={0.2}>
                  <p className="mt-8 text-xs leading-relaxed text-ink-faint">
                    The contracts are open source with a published threat model. They have not yet completed an
                    external audit — and we won&apos;t claim otherwise until one exists.
                  </p>
                  <Link href="/security" className="btn-secondary mt-4">
                    Read the security model
                  </Link>
                </FadeRise>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. FINAL CTA ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-violet-sheen opacity-95" aria-hidden />
          <div className="relative mx-auto max-w-4xl px-4 py-20 text-center">
            <FadeRise>
              <FloatingCoinStack className="mx-auto h-20 w-auto" />
              <h2 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
                Create your first onchain savings circle.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-white/85">
                Your money. Your turn. Our code.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/app/circles/new"
                  className="inline-flex items-center gap-2 rounded-pill bg-white px-7 py-3.5 text-base font-bold text-violet-700 transition-all duration-200 ease-swift hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.98]"
                >
                  Start a savings circle
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 rounded-pill border border-white/40 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
                >
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
      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300" aria-hidden>
        <Check />
      </span>
      <div>
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-faint">{body}</p>
      </div>
    </div>
  );
}

function ExampleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-2 text-sm last:border-0">
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
