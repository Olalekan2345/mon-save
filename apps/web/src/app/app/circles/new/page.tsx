"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, usePublicClient } from "wagmi";
import { isAddress, parseUnits } from "viem";
import { z } from "zod";
import { circleFactoryAbi } from "@/lib/abis";
import { circleFactoryAddress, isProtocolDeployed } from "@/lib/addresses";
import { useContractAction } from "@/hooks/useContractAction";
import { TxStatus } from "@/components/TxStatus";
import { EmptyState } from "@/components/EmptyState";
import { getTokens, getNnsConfig, getSimulatedYield, findToken, type SupportedChainId } from "@monsave/config";
import { activeChain } from "@/lib/chains";
import { resolveNadName, looksLikeName, isNameResolutionAvailable } from "@/lib/nns";
import { shortAddress } from "@/lib/format";

const FREQUENCIES = [
  { label: "Daily", seconds: 86_400 },
  { label: "Weekly", seconds: 604_800 },
  { label: "Monthly (30 days)", seconds: 2_592_000 },
] as const;

const detailsSchema = z.object({
  name: z.string().min(3, "Give your circle a name (at least 3 characters)").max(64),
  description: z.string().max(280).optional(),
});

const rulesSchema = z.object({
  tokenAddress: z.string().refine(isAddress, "Select a supported settlement token"),
  contribution: z
    .string()
    .refine((v) => /^\d+(\.\d+)?$/.test(v) && Number(v) > 0, "Enter a contribution amount greater than zero"),
  frequencySeconds: z.number().int().min(86_400).max(3_888_000),
  firstPayoutDate: z.string().refine((v) => {
    const t = new Date(v).getTime();
    return Number.isFinite(t) && t > Date.now() + 60 * 60 * 1000;
  }, "First payout must be at least 1 hour in the future"),
});

const STEPS = ["Details", "Rules", "Members", "Payout order", "Review"] as const;

export default function CreateCirclePage() {
  const router = useRouter();
  const { address: account, isConnected } = useAccount();
  const [step, setStep] = useState(0);

  // step state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState(6);
  const [contribution, setContribution] = useState("");
  const [frequencySeconds, setFrequencySeconds] = useState<number>(604_800);
  const [firstPayoutDate, setFirstPayoutDate] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<`0x${string}`[]>([]);
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});
  const [resolving, setResolving] = useState(false);
  const [useYieldOpt, setUseYieldOpt] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const supportedTokens = getTokens(activeChain.id as SupportedChainId);
  const selectedToken = tokenAddress ? findToken(activeChain.id as SupportedChainId, tokenAddress) : undefined;
  const yieldSupported = Boolean(selectedToken?.yieldSupported);
  const simYield = getSimulatedYield(activeChain.id as SupportedChainId);
  const nnsAvailable = isNameResolutionAvailable();
  const nnsTld = getNnsConfig(activeChain.id as SupportedChainId).tld;
  const publicClient = usePublicClient();
  const action = useContractAction();

  const totalRounds = members.length;
  const commitmentPreview = useMemo(() => {
    if (!contribution || !/^\d+(\.\d+)?$/.test(contribution) || totalRounds === 0) return null;
    const per = Number(contribution);
    return {
      perMember: per * totalRounds,
      pot: per * totalRounds,
      totalPrincipal: per * totalRounds * totalRounds,
    };
  }, [contribution, totalRounds]);

  if (!isConnected) {
    return (
      <EmptyState
        title="Connect your wallet to create a circle"
        body="Creating a circle deploys a real contract on Monad — a connected wallet is required to sign the transaction."
      />
    );
  }
  if (!isProtocolDeployed || !circleFactoryAddress) {
    return (
      <EmptyState
        title="Circle creation is not available on this network yet"
        body="The MonSave factory has not been deployed and configured for this deployment. No contracts, no circles — we never simulate them."
      />
    );
  }

  function next() {
    setErrors([]);
    if (step === 0) {
      const r = detailsSchema.safeParse({ name, description });
      if (!r.success) return setErrors(r.error.issues.map((i) => i.message));
    }
    if (step === 1) {
      const r = rulesSchema.safeParse({ tokenAddress, contribution, frequencySeconds, firstPayoutDate });
      if (!r.success) return setErrors(r.error.issues.map((i) => i.message));
    }
    if (step === 2) {
      const list = account && !members.includes(account) ? [account, ...members] : members;
      if (list.length < 2) return setErrors(["A circle needs at least 2 members (including you)."]);
      if (list.length > 12) return setErrors(["A circle can have at most 12 members."]);
      setMembers(list);
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function addMember() {
    setErrors([]);
    const candidate = memberInput.trim();
    if (members.length >= 11) return setErrors(["A circle can have at most 12 members including you."]);

    let resolvedAddress: `0x${string}` | undefined;
    let label: string | undefined;

    if (isAddress(candidate)) {
      resolvedAddress = candidate as `0x${string}`;
    } else if (looksLikeName(candidate)) {
      // resolve a .nad name → address; the ADDRESS is what we store
      if (!nnsAvailable) {
        return setErrors([`Name resolution isn't available on ${activeChain.name}. Enter a wallet address instead.`]);
      }
      if (!publicClient) return setErrors(["Wallet client unavailable — reconnect and try again."]);
      setResolving(true);
      const addr = await resolveNadName(publicClient, candidate);
      setResolving(false);
      if (!addr) return setErrors([`Couldn't resolve "${candidate}". Check the name, or enter a wallet address.`]);
      resolvedAddress = addr;
      label = candidate.trim().toLowerCase();
    } else {
      return setErrors([`Enter a wallet address (0x…) or a ${nnsTld} name.`]);
    }

    if (members.includes(resolvedAddress) || resolvedAddress === account) {
      return setErrors(["That wallet is already in the member list."]);
    }
    setMembers((m) => [...m, resolvedAddress!]);
    if (label) setMemberNames((prev) => ({ ...prev, [resolvedAddress!.toLowerCase()]: label! }));
    setMemberInput("");
  }

  function move(i: number, dir: -1 | 1) {
    setMembers((m) => {
      const copy = [...m];
      const j = i + dir;
      if (j < 0 || j >= copy.length) return m;
      const a = copy[i]!;
      copy[i] = copy[j]!;
      copy[j] = a;
      return copy;
    });
  }

  async function submit() {
    setErrors([]);
    const firstPayoutTime = BigInt(Math.floor(new Date(firstPayoutDate).getTime() / 1000));
    const metadata = JSON.stringify({ name, description });
    const ok = await action.execute({
      address: circleFactoryAddress!,
      abi: circleFactoryAbi,
      functionName: "createCircle",
      args: [
        {
          token: tokenAddress as `0x${string}`,
          contributionPerRound: parseUnits(contribution, tokenDecimals),
          payoutOrder: members,
          frequency: BigInt(frequencySeconds),
          firstPayoutTime,
          payoutWindow: BigInt(86_400),
          useYield: yieldSupported && useYieldOpt,
          metadataURI: `data:application/json,${encodeURIComponent(metadata)}`,
        },
      ],
    });
    if (ok) router.push("/app/circles");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Create a Secure Circle</h1>

      {/* stepper */}
      <ol className="flex items-center gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i < step ? "bg-positive/20 text-positive" : i === step ? "bg-violet-500 text-white" : "bg-white/5 text-ink-faint"
              }`}
              aria-current={i === step ? "step" : undefined}
            >
              {i + 1}
            </span>
            <span className={`hidden text-xs sm:block ${i === step ? "text-ink" : "text-ink-faint"}`}>{label}</span>
            {i < STEPS.length - 1 && <span className="h-px w-4 bg-white/10" aria-hidden />}
          </li>
        ))}
      </ol>

      {errors.length > 0 && (
        <div role="alert" className="rounded-lg border border-critical/40 bg-critical/10 p-3 text-sm text-critical">
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}

      <div className="card space-y-5 p-6">
        {step === 0 && (
          <>
            <div>
              <label className="label" htmlFor="name">Circle name</label>
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Market Women Union — Q3" />
            </div>
            <div>
              <label className="label" htmlFor="desc">Description (optional)</label>
              <textarea id="desc" className="input min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this circle saving for?" />
            </div>
            <p className="text-xs text-ink-faint">
              Circles are invite-only: only the wallet addresses you add can join. This is a Secure Circle — every
              member escrows their full commitment before it starts.
            </p>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <label className="label" htmlFor="token">Settlement token</label>
              {supportedTokens.length === 0 ? (
                <p className="rounded-lg border border-caution/40 bg-caution/10 p-3 text-sm text-caution">
                  No supported settlement asset is configured for {activeChain.name} yet. Token support requires a
                  verified onchain registry entry — MonSave never guesses token addresses.
                </p>
              ) : (
                <select
                  id="token"
                  className="input"
                  value={tokenAddress}
                  onChange={(e) => {
                    setTokenAddress(e.target.value);
                    const t = supportedTokens.find((t) => t.address === e.target.value);
                    if (t) setTokenDecimals(t.decimals);
                  }}
                >
                  <option value="">Select a token…</option>
                  {supportedTokens.map((t) => (
                    <option key={t.address} value={t.address}>
                      {t.symbol} — {t.name}
                      {t.isTestAsset ? " (testnet — no monetary value)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="label" htmlFor="contribution">Contribution per member, per round</label>
              <input id="contribution" className="input" inputMode="decimal" value={contribution} onChange={(e) => setContribution(e.target.value)} placeholder="e.g. 20" />
            </div>
            <div>
              <span className="label">Frequency</span>
              <div className="flex gap-2" role="radiogroup" aria-label="Frequency">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f.seconds}
                    type="button"
                    role="radio"
                    aria-checked={frequencySeconds === f.seconds}
                    className={`rounded-pill border px-4 py-2 text-sm ${
                      frequencySeconds === f.seconds
                        ? "border-violet-500 bg-violet-500/15 text-violet-300"
                        : "border-white/10 text-ink-dim hover:border-white/25"
                    }`}
                    onClick={() => setFrequencySeconds(f.seconds)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label" htmlFor="firstPayout">First payout date &amp; time</label>
              <input id="firstPayout" type="datetime-local" className="input" value={firstPayoutDate} onChange={(e) => setFirstPayoutDate(e.target.value)} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-ink-dim">
              Your wallet <span className="font-mono text-xs">{account && shortAddress(account)}</span> is automatically
              member #1. Add the other members by wallet address
              {nnsAvailable ? ` or ${nnsTld} name` : ""}.
            </p>
            <div className="flex gap-2">
              <input
                className="input"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                placeholder={nnsAvailable ? `0x… address or name${nnsTld}` : "0x… wallet address"}
                aria-label={nnsAvailable ? "Member wallet address or NNS name" : "Member wallet address"}
                disabled={resolving}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), void addMember())}
              />
              <button type="button" className="btn-secondary shrink-0" onClick={() => void addMember()} disabled={resolving}>
                {resolving ? "Resolving…" : "Add"}
              </button>
            </div>
            {nnsAvailable ? (
              <p className="text-xs text-ink-faint">
                {nnsTld} names resolve to the wallet address at add-time — the circle stores the address, so a later name
                transfer can never change membership.
              </p>
            ) : (
              <p className="text-xs text-ink-faint">
                Name resolution isn&apos;t available on {activeChain.name}; enter wallet addresses.
              </p>
            )}
            <ul className="space-y-2">
              {members.map((m) => {
                const label = memberNames[m.toLowerCase()];
                return (
                  <li key={m} className="flex items-center justify-between rounded-lg border border-white/5 px-4 py-2">
                    <span className="min-w-0">
                      {label && <span className="mr-2 text-xs font-semibold text-violet-300">{label}</span>}
                      <span className="font-mono text-xs text-ink-dim">{shortAddress(m)}</span>
                    </span>
                    <button
                      type="button"
                      className="text-xs text-critical hover:underline"
                      onClick={() => {
                        setMembers((list) => list.filter((x) => x !== m));
                        setMemberNames((prev) => {
                          const next = { ...prev };
                          delete next[m.toLowerCase()];
                          return next;
                        });
                      }}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
            {members.length === 0 && <p className="text-xs text-ink-faint">No members added yet.</p>}
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm text-ink-dim">
              Payout order: position #1 collects the first round. Every member must approve this exact order onchain
              before the circle can start — changing it later resets all approvals.
            </p>
            <ol className="space-y-2">
              {members.map((m, i) => (
                <li key={m} className="flex items-center justify-between rounded-lg border border-white/5 px-4 py-2">
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs text-ink-faint">#{i + 1}</span>
                    <span className="font-mono text-xs">{m}</span>
                    {m === account && <span className="text-xs text-violet-300">(you)</span>}
                  </span>
                  <span className="flex gap-1">
                    <button type="button" aria-label={`Move position ${i + 1} up`} className="rounded px-2 py-1 text-xs text-ink-dim hover:bg-white/5" onClick={() => move(i, -1)}>↑</button>
                    <button type="button" aria-label={`Move position ${i + 1} down`} className="rounded px-2 py-1 text-xs text-ink-dim hover:bg-white/5" onClick={() => move(i, 1)}>↓</button>
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-lg font-semibold">Review — these rules become permanent</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Review label="Name" value={name} />
              <Review label="Members / rounds" value={`${members.length} / ${members.length}`} />
              <Review label="Contribution per round" value={contribution} />
              <Review label="Frequency" value={FREQUENCIES.find((f) => f.seconds === frequencySeconds)?.label ?? "—"} />
              <Review label="First payout" value={firstPayoutDate ? new Date(firstPayoutDate).toLocaleString() : "—"} />
              <Review label="Settlement token" value={supportedTokens.find((t) => t.address === tokenAddress)?.symbol ?? tokenAddress} />
              {commitmentPreview && (
                <>
                  <Review label="Each member escrows" value={String(commitmentPreview.perMember)} />
                  <Review label="Each round pays out" value={String(commitmentPreview.pot)} />
                  <Review label="Total circle principal" value={String(commitmentPreview.totalPrincipal)} />
                </>
              )}
              <Review
                label="Yield"
                value={
                  !yieldSupported
                    ? "Not available for this token"
                    : useYieldOpt
                      ? `On — simulated test yield (${(simYield!.fixedApyBps / 100).toFixed(1)}% demo)`
                      : "Off"
                }
              />
            </dl>

            {/* yield opt-in — honestly labeled as a simulated test source */}
            {yieldSupported && simYield && (
              <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-violet-500"
                    checked={useYieldOpt}
                    onChange={(e) => setUseYieldOpt(e.target.checked)}
                  />
                  <span className="text-sm">
                    <span className="font-semibold text-ink">Earn simulated test yield while funds wait</span>
                    <span className="mt-1 block text-xs leading-relaxed text-ink-dim">
                      Idle principal is supplied to a MonSave <strong>test</strong> yield pool that pays a fixed{" "}
                      <strong>{(simYield.fixedApyBps / 100).toFixed(1)}% demo rate</strong> on this valueless testnet
                      token. It exercises the real yield mechanics (checkpoint, allocation, claim) but is{" "}
                      <strong>not a real market and not a real return</strong>. On Mainnet this is replaced by the
                      verified Aave V3 market.
                    </span>
                  </span>
                </label>
              </div>
            )}
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-ink-dim">
              <p className="font-semibold text-ink">Before you sign, understand:</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Every member must escrow their <strong>full commitment</strong> (contribution × rounds) before activation. This is what removes the trust problem.</li>
                <li>After activation the rules, member list and payout order are locked onchain and cannot be changed by anyone — including MonSave.</li>
                <li>Before activation, the organizer can cancel and every funded member can reclaim their escrow in full.</li>
                <li>The creation transaction will be simulated first; you will see the real transaction hash and can verify it on the explorer.</li>
              </ul>
            </div>
            <TxStatus phase={action.phase} hash={action.hash} error={action.error} />
          </>
        )}

        <div className="flex justify-between border-t border-white/5 pt-4">
          <button type="button" className="btn-secondary" disabled={step === 0 || action.isBusy} onClick={() => setStep((s) => Math.max(0, s - 1))}>
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn-primary" onClick={next}>
              Continue
            </button>
          ) : (
            <button type="button" className="btn-primary" disabled={action.isBusy} onClick={submit}>
              {action.isBusy ? "Working…" : "Simulate & create circle"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-ink-faint">{label}</dt>
      <dd className="mt-0.5 break-words">{value || "—"}</dd>
    </div>
  );
}
