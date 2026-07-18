"use client";

/**
 * InteractiveSchedule — a public, clearly-labelled ILLUSTRATIVE preview of how a
 * MonSave circle rotates. All values are decorative fixtures inside this
 * component; they are never live data and never touch the blockchain. The
 * authenticated app renders real circle data elsewhere.
 */
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const FREQUENCIES = [
  { id: "weekly", label: "Weekly", step: "every week" },
  { id: "monthly", label: "Monthly", step: "every month" },
  { id: "custom", label: "Custom", step: "on your schedule" },
] as const;

const MEMBERS = ["Ada", "Tolu", "Emeka", "Ngozi", "Bola"];

export function InteractiveSchedule() {
  const reduce = useReducedMotion();
  const [freq, setFreq] = useState<(typeof FREQUENCIES)[number]["id"]>("weekly");
  const current = 1; // illustrative "current round" index

  const active = FREQUENCIES.find((f) => f.id === freq)!;

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-500">Try it yourself</p>
          <h3 className="mt-1 text-lg font-bold">A 5-member circle, {active.step}</h3>
        </div>
        <div className="inline-flex rounded-pill border border-line bg-cream p-1" role="tablist" aria-label="Frequency">
          {FREQUENCIES.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={freq === f.id}
              onClick={() => setFreq(f.id)}
              className={`relative rounded-pill px-4 py-1.5 text-sm font-semibold transition-colors ${
                freq === f.id ? "text-white" : "text-ink-faint hover:text-ink"
              }`}
            >
              {freq === f.id && (
                <motion.span
                  layoutId="sched-freq"
                  className="absolute inset-0 rounded-pill bg-violet-500"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  aria-hidden
                />
              )}
              <span className="relative">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      <ol className="divide-y divide-line">
        {MEMBERS.map((name, i) => {
          const state = i < current ? "paid" : i === current ? "current" : "upcoming";
          const tone =
            state === "paid"
              ? { chip: "bg-soft-mint text-mint", dot: "bg-mint", label: "Paid" }
              : state === "current"
                ? { chip: "bg-violet-500/12 text-violet-600", dot: "bg-violet-500", label: "Collecting now" }
                : { chip: "bg-soft-blue text-cyan", dot: "bg-cyan", label: "Upcoming" };
          return (
            <motion.li
              key={name}
              className="flex items-center justify-between gap-3 px-5 py-3.5"
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: ["#7257F5", "#22B8E6", "#2ECB8E", "#F5C21B", "#FF6A61"][i] }}
                  aria-hidden
                >
                  {name[0]}
                </span>
                <div>
                  <p className="text-sm font-semibold">Round {i + 1} · {name}</p>
                  <p className="num text-xs text-ink-faint">Receives ₦100,000-equivalent</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-semibold ${tone.chip}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden />
                {tone.label}
              </span>
            </motion.li>
          );
        })}
      </ol>

      <p className="border-t border-line bg-cream px-5 py-3 text-xs text-ink-faint">
        Illustrative product preview — example figures, not live data. Real circles show your own onchain values.
      </p>
    </div>
  );
}
