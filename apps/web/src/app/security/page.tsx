import type { Metadata } from "next";
import { ProsePage } from "@/components/ProsePage";

export const metadata: Metadata = { title: "Security & transparency" };

export default function SecurityPage() {
  return (
    <ProsePage title="Security & transparency">
      <h2>Non-custodial, verifiable, boring on purpose</h2>
      <ul>
        <li>Funds move from your wallet directly into your circle&apos;s own contract. There is no master wallet.</li>
        <li>Every deposit, payout, yield claim and refund is a public Monad transaction you can verify yourself.</li>
        <li>Circle rules are immutable after activation — no admin, including MonSave, can change the payout order, recipients or amounts.</li>
        <li>Payout execution is permissionless: our automation is a convenience, never a dependency.</li>
        <li>Contracts use OpenZeppelin primitives, reentrancy guards, checks-effects-interactions, bounded loops and custom errors, with fuzz and invariant test suites.</li>
      </ul>
      <h2>What administrators can and cannot do</h2>
      <p>
        Protocol governance (a Safe multisig in production) can list supported assets, cap circle sizes, pause{" "}
        <em>new</em> circle creation and adjust the yield-fee within a hard 10% contract cap. It{" "}
        <strong>cannot</strong> withdraw member principal, change an active circle&apos;s rules or recipients, mark
        payouts complete, fabricate yield or redirect refunds. Pausing creation never traps funds in existing circles.
      </p>
      <h2>Audit status</h2>
      <p>
        MonSave&apos;s contracts have <strong>not yet completed an external security audit</strong>. We publish the
        full source, tests and threat model in the repository, and we will not describe the protocol as audited until
        a named external audit exists. Until then, Mainnet deposit caps are kept deliberately low.
      </p>
      <h2>Report a vulnerability</h2>
      <p>
        Found something? Please report it responsibly via the repository&apos;s security policy before public
        disclosure. We take reports seriously and respond quickly.
      </p>
    </ProsePage>
  );
}
