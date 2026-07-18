import type { Metadata } from "next";
import { ProsePage } from "@/components/ProsePage";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy policy">
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Onchain data</strong> — wallet addresses, circle contracts and transactions are public on the Monad
          blockchain by nature; MonSave indexes them to render your dashboard.
        </li>
        <li>
          <strong>Account data</strong> — if you sign in, we store your wallet address, session records, and any
          optional profile details or email you choose to provide for invitations and notifications.
        </li>
        <li>
          <strong>Operational data</strong> — standard server logs and error reports used to keep the service running.
        </li>
      </ul>
      <h2>What we never collect</h2>
      <ul>
        <li>Your private keys or seed phrases — never, under any circumstance.</li>
        <li>Financial data beyond what is already public onchain.</li>
      </ul>
      <h2>How we use it</h2>
      <p>
        To operate the interface, deliver invitations and notifications you opted into, and secure the service. We do
        not sell personal data.
      </p>
      <h2>Your choices</h2>
      <p>
        You can use the contracts without an account at all — every circle action works wallet-only. You may request
        deletion of your off-chain account data at any time; onchain data is public and permanent by design.
      </p>
    </ProsePage>
  );
}
