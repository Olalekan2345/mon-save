import type { Metadata } from "next";
import { ProsePage } from "@/components/ProsePage";

export const metadata: Metadata = { title: "Risk disclosure" };

export default function RiskDisclosurePage() {
  return (
    <ProsePage title="Risk disclosure">
      <p>
        <strong>Please read this before using MonSave.</strong> MonSave is non-custodial blockchain software, not a
        bank, deposit-taking institution or licensed financial adviser. Using it involves real risks:
      </p>
      <ul>
        <li>
          <strong>Total loss is possible.</strong> Smart-contract bugs, stablecoin failures or extreme events in the
          underlying yield protocol could result in partial or total loss of funds.
        </li>
        <li>
          <strong>No insurance.</strong> Funds in MonSave circles are not insured by any deposit-insurance scheme or
          government body.
        </li>
        <li>
          <strong>No audit yet.</strong> The contracts have not completed an external security audit. External audit
          and legal review are required before unrestricted public deposits; until then Mainnet risk caps apply.
        </li>
        <li>
          <strong>Variable yield.</strong> Yield rates change constantly and may be zero. Past rates do not predict
          future rates.
        </li>
        <li>
          <strong>Irreversibility.</strong> Blockchain transactions cannot be reversed. Sending funds to a wrong
          address, or losing your wallet keys, is permanent.
        </li>
        <li>
          <strong>Currency estimates.</strong> NGN figures are estimates based on a live rate source with a visible
          timestamp; the settlement asset is the onchain token, not naira.
        </li>
        <li>
          <strong>Regulatory risk.</strong> The legal treatment of blockchain savings products varies by jurisdiction
          and may change.
        </li>
      </ul>
      <p>
        We never promise guaranteed profit, risk-free returns, bank insurance or government approval. If anyone
        claiming to represent MonSave does, it is a scam.
      </p>
    </ProsePage>
  );
}
