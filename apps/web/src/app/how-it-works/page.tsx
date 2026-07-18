import type { Metadata } from "next";
import { ProsePage } from "@/components/ProsePage";

export const metadata: Metadata = { title: "How MonSave works" };

export default function HowItWorksPage() {
  return (
    <ProsePage title="How MonSave works">
      <p>
        MonSave digitizes the rotating savings tradition known in Nigeria as <strong>ajo</strong> or{" "}
        <strong>esusu</strong>: a group contributes a fixed amount on a schedule, and each round one member collects
        the whole pot. Traditionally, one trusted person — the collector — holds the money, keeps the records and
        remembers whose turn it is. MonSave replaces that person with a smart contract whose rules everyone approved.
      </p>

      <h2 id="secure-circle">Secure Circles, step by step</h2>
      <h3>1. Create</h3>
      <p>
        An organizer sets the contribution per round, the schedule (daily, weekly or monthly), the member list and a
        proposed payout order. Nothing is binding yet.
      </p>
      <h3>2. Approve</h3>
      <p>
        Every member reviews the exact final rules and approves them with an onchain signature. If the organizer
        changes anything, all approvals reset and everyone must approve again. Once approvals complete, the rules can
        never be edited.
      </p>
      <h3>3. Fund</h3>
      <p>
        Each member escrows their <strong>full commitment</strong> — contribution × number of rounds — into the
        circle&apos;s own contract. For example, in a 5-member circle contributing ₦20,000-equivalent per round, each
        member escrows ₦100,000-equivalent before anything starts, and the circle holds ₦500,000-equivalent in total.
      </p>
      <h3>4. Rounds settle</h3>
      <p>
        On each scheduled date, one contribution unit is consumed from every member&apos;s escrow, and the full round
        pot goes to the scheduled recipient. Anyone can press the button — settlement is permissionless, so MonSave
        being offline can never block your payout.
      </p>
      <h3>5. Everyone collects</h3>
      <p>
        Because everyone pre-funded in full, a member who has already collected cannot stop contributing — their
        future contributions were locked from day one. The circle completes when every member has collected once.
      </p>

      <h2>Why full pre-funding?</h2>
      <p>
        Ordinary round-by-round ajo has a real weakness even onchain: whoever collects early could simply stop paying.
        We won&apos;t pretend a smart contract fixes human behaviour — instead, Secure Circles remove the possibility
        entirely by collateralizing everything up front. The trade-off is honest: you lock more money upfront, and in
        exchange no one has to trust anyone.
      </p>

      <h2>What about idle funds?</h2>
      <p>
        Money waiting for future rounds doesn&apos;t need to sit still. When a verified yield market (Aave on Monad)
        is available for your settlement token, a circle can opt in to supply idle funds there. Realized yield is
        tracked separately from principal, allocated fairly across members, and claimable individually. Yield is{" "}
        <strong>variable, never guaranteed</strong> — see{" "}
        <a className="text-violet-400 underline underline-offset-2" href="/yield-and-risks">
          Yield &amp; risks
        </a>
        .
      </p>

      <h2>Community Circles (coming later)</h2>
      <p>
        A round-by-round mode with security bonds, reputations, and default handling is designed but deliberately not
        enabled for public use. It is not fully trustless, and we will not ship it until its risk model, default
        handling and legal review are complete.
      </p>
    </ProsePage>
  );
}
