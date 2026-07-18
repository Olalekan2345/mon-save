import type { Metadata } from "next";
import { ProsePage } from "@/components/ProsePage";

export const metadata: Metadata = { title: "Yield & risks" };

export default function YieldAndRisksPage() {
  return (
    <ProsePage title="Yield & risks">
      <h2>Where yield comes from</h2>
      <p>
        When enabled for a circle, idle principal is supplied to <strong>Aave V3 on Monad</strong>, a lending market
        where suppliers earn a <strong>variable</strong> interest rate paid by borrowers. MonSave&apos;s adapter can
        only supply and withdraw — it can never borrow, use leverage, take flash loans, trade or bridge your funds.
      </p>
      <h2>What “variable APY” means</h2>
      <ul>
        <li>The rate changes constantly with market supply and demand.</li>
        <li>The rate you see is the current rate at the displayed retrieval time — not a promise about tomorrow.</li>
        <li>Yield can be small, zero, or interrupted.</li>
        <li>MonSave never displays yield as fixed, guaranteed, insured or risk-free.</li>
      </ul>
      <h2>Principal and yield are always separate</h2>
      <p>
        Your dashboard and the contracts themselves account for principal and yield separately. Protocol fees apply{" "}
        <strong>only to realized positive yield, never to principal</strong>, are hard-capped at 10% in the contract
        code, and are visible before you approve a circle.
      </p>
      <h2>The risks, plainly</h2>
      <ul>
        <li>
          <strong>Smart-contract risk.</strong> MonSave&apos;s contracts are open source and tested, but they have not
          yet completed an external audit. Bugs can cause loss of funds.
        </li>
        <li>
          <strong>Yield-protocol risk.</strong> Aave can pause a market, a reserve can be exhausted of withdrawal
          liquidity, and in extreme events supplied assets could be impaired.
        </li>
        <li>
          <strong>Stablecoin risk.</strong> Settlement tokens can lose their peg or freeze transfers.
        </li>
        <li>
          <strong>Liquidity risk.</strong> If recoverable assets ever fall below what members are owed, the circle
          freezes and every member gets an equal pro-rata redemption — the shortfall is shown, never hidden.
        </li>
        <li>
          <strong>Key risk.</strong> MonSave is non-custodial: if you lose access to your wallet, MonSave cannot
          recover it for you.
        </li>
      </ul>
      <h2>Naira estimates</h2>
      <p>
        Circles settle in a supported onchain token, not in naira. Where an NGN figure is shown it is labeled{" "}
        <strong>“Estimated NGN value”</strong>, uses a configured live rate source with a visible timestamp, and is
        never hardcoded. If live rate data is temporarily unavailable, we say so rather than showing a stale number as
        fresh.
      </p>
    </ProsePage>
  );
}
