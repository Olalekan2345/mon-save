import type { Metadata } from "next";
import { ProsePage } from "@/components/ProsePage";

export const metadata: Metadata = { title: "FAQ" };

const FAQS: [string, string][] = [
  [
    "What is a smart contract?",
    "A small program that lives on the blockchain and runs exactly as written. Your circle's smart contract holds the group's escrow and enforces the rules everyone approved — nobody, including MonSave, can make it do anything else.",
  ],
  [
    "What is a wallet?",
    "An app (like a mobile or browser wallet) that holds your keys and signs transactions. MonSave connects to your wallet but never sees or stores your keys.",
  ],
  [
    "What is a gas fee?",
    "A small amount of MON (Monad's native token) paid to the network to process a transaction. You pay gas when approving rules, funding, executing payouts and claiming yield.",
  ],
  [
    "What is a stablecoin?",
    "A token designed to track a currency such as the US dollar. Circles settle in a supported stablecoin; naira figures are estimates with a visible rate source and timestamp.",
  ],
  [
    "Why do I have to escrow everything upfront?",
    "Full pre-funding is what makes a Secure Circle trustless. Because your future contributions are already locked in the contract, a member who collects early cannot abandon the group.",
  ],
  [
    "What happens if we cancel before starting?",
    "Any funded member reclaims their full escrow. Cancellation is only possible before activation.",
  ],
  [
    "Can MonSave touch my money?",
    "No. Funds sit in your circle's own contract. Administrators cannot withdraw principal, change recipients or alter active rules — these restrictions are enforced in the contract code, not by policy.",
  ],
  [
    "Is the yield guaranteed?",
    "No. Yield comes from a variable-rate lending market (Aave on Monad) and can go down or to zero. We never use words like guaranteed or risk-free, because it isn't.",
  ],
  [
    "What if the payout automation is down?",
    "Anyone can execute a due payout from the circle page. Automation is a convenience, not a dependency.",
  ],
  [
    "What does “full collateralization” mean?",
    "Every member deposits their entire commitment (contribution × rounds) before the circle starts, so every future round is already funded on day one.",
  ],
];

export default function FaqPage() {
  return (
    <ProsePage title="Frequently asked questions">
      <div className="space-y-3">
        {FAQS.map(([q, a]) => (
          <details key={q} className="card group p-5">
            <summary className="cursor-pointer text-sm font-semibold text-ink marker:text-violet-400">{q}</summary>
            <p className="mt-3 text-sm leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </ProsePage>
  );
}
