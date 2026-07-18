"use client";

import { useEffect, useState } from "react";

/**
 * Light/dark toggle. The theme is applied before paint by an inline script in
 * the layout (no flash); this button flips the `.dark` class on <html> and
 * persists the choice. Default with no stored choice follows the OS setting.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("monsave-theme", next ? "dark" : "light");
    } catch {
      /* storage blocked — toggle still works for the session */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={`flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-dim transition-colors hover:bg-ink/5 hover:text-ink ${className ?? ""}`}
    >
      {/* render a stable icon until mounted to avoid hydration mismatch */}
      {mounted && dark ? (
        // sun
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
          <circle cx="9" cy="9" r="3.4" />
          <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M14.3 3.7l-1.4 1.4M5.1 12.9l-1.4 1.4" />
        </svg>
      ) : (
        // moon
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 10.5A6.5 6.5 0 017.5 3a6.5 6.5 0 100 12 6.5 6.5 0 007.5-4.5z" />
        </svg>
      )}
    </button>
  );
}
