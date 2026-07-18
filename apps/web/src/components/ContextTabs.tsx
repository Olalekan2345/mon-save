"use client";

/**
 * ContextTabs — Level 3 contextual navigation (segmented style).
 * URL-driven (?tab=): deep-linkable, back/forward-safe; active state derives
 * from the route, never local-only state. Full keyboard model: arrows,
 * Home/End, Enter/Space. Sliding indicator via framer-motion layoutId.
 * Mobile: horizontal scroll with edge fade; active tab auto-scrolls into view.
 */
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface ContextTab {
  id: string;
  label: string;
}

export function ContextTabs({
  tabs,
  paramName = "tab",
  defaultTab,
  layoutId,
  ariaLabel,
}: {
  tabs: readonly ContextTab[];
  paramName?: string;
  defaultTab: string;
  layoutId: string;
  ariaLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);

  const current = searchParams.get(paramName) ?? defaultTab;
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === current));

  function select(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === defaultTab) params.delete(paramName);
    else params.set(paramName, id);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // keyboard: roving focus
  function onKeyDown(e: React.KeyboardEvent) {
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]") ?? []);
    const focused = buttons.findIndex((b) => b === document.activeElement);
    const base = focused >= 0 ? focused : activeIndex;
    let next = -1;
    if (e.key === "ArrowRight") next = (base + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (base - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next >= 0) {
      e.preventDefault();
      buttons[next]?.focus();
    }
  }

  // keep the active tab visible on small screens
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
  }, [current, reduce]);

  return (
    <div className="relative">
      {/* edge fades (mobile scroll affordance) */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-midnight to-transparent sm:hidden" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-midnight to-transparent sm:hidden" />
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className="scrollbar-none flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-night-850 p-1"
      >
        {tabs.map((tab) => {
          const active = tab.id === current;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => select(tab.id)}
              className={`relative shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 ${
                active ? "text-ink" : "text-ink-faint hover:text-ink-dim"
              }`}
            >
              {active && !reduce && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-lg bg-violet-500/20 ring-1 ring-inset ring-violet-500/40"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  aria-hidden
                />
              )}
              {active && reduce && (
                <span className="absolute inset-0 rounded-lg bg-violet-500/20 ring-1 ring-inset ring-violet-500/40" aria-hidden />
              )}
              <span className="relative flex items-center gap-1.5">
                {tab.label}
                {active && (
                  <span className="sr-only">(current section)</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Overflow menu for rare/destructive actions — never beside ordinary tabs. */
export function OverflowActionMenu({
  actions,
  label = "More actions",
}: {
  actions: { label: string; onSelect?: () => void; href?: string; tone?: "default" | "danger"; disabled?: boolean }[];
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef(false);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (openRef.current && !ref.current?.contains(e.target as Node)) toggle(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openRef.current) {
        toggle(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  function toggle(force?: boolean) {
    const menu = ref.current?.querySelector<HTMLElement>("[role=menu]");
    const next = force ?? !openRef.current;
    openRef.current = next;
    if (menu) menu.style.display = next ? "block" : "none";
    buttonRef.current?.setAttribute("aria-expanded", String(next));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        ref={buttonRef}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-ink-dim transition-colors hover:bg-white/5 hover:text-ink"
        aria-haspopup="menu"
        aria-expanded="false"
        aria-label={label}
        onClick={() => toggle()}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="13" cy="8" r="1.5" />
        </svg>
      </button>
      <div
        role="menu"
        aria-label={label}
        style={{ display: "none" }}
        className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-white/10 bg-navy p-1.5 shadow-card"
      >
        {actions.map((a) =>
          a.href ? (
            <a
              key={a.label}
              href={a.href}
              role="menuitem"
              target={a.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="block rounded-lg px-3 py-2.5 text-sm text-ink-dim transition-colors hover:bg-white/5 hover:text-ink"
              onClick={() => toggle(false)}
            >
              {a.label}
            </a>
          ) : (
            <button
              key={a.label}
              role="menuitem"
              disabled={a.disabled}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors disabled:opacity-40 ${
                a.tone === "danger" ? "text-critical hover:bg-critical/10" : "text-ink-dim hover:bg-white/5 hover:text-ink"
              }`}
              onClick={() => {
                toggle(false);
                a.onSelect?.();
              }}
            >
              {a.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
