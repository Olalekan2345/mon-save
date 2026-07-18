import type { Metadata } from "next";
import { ProsePage } from "@/components/ProsePage";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <ProsePage title="Terms of use">
      <p>
        These terms govern your use of the MonSave interface. By using it, you agree to them.
      </p>
      <h2>1. What MonSave is</h2>
      <p>
        MonSave is a non-custodial software interface to open smart contracts deployed on the Monad blockchain. MonSave
        does not hold user funds, does not execute discretionary transactions, and is not a party to any savings
        circle.
      </p>
      <h2>2. Eligibility and responsibility</h2>
      <p>
        You are responsible for your wallet, your keys, your transactions and compliance with the laws of your
        jurisdiction. You must not use MonSave for unlawful activity.
      </p>
      <h2>3. No advice, no guarantees</h2>
      <p>
        Nothing in the interface is financial, legal or tax advice. The software is provided “as is” without warranties
        of any kind. See the <a className="text-violet-400 underline underline-offset-2" href="/risk-disclosure">risk disclosure</a>.
      </p>
      <h2>4. Fees</h2>
      <p>
        The protocol charges a fee only on realized positive yield, hard-capped at 10% in the contract code and shown
        before circle approval. Principal is never charged.
      </p>
      <h2>5. Changes</h2>
      <p>
        We may update the interface and these terms. Deployed circle contracts themselves are immutable and unaffected
        by interface changes.
      </p>
    </ProsePage>
  );
}
