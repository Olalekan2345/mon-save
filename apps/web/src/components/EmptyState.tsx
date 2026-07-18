export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-8 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-400" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {body && <p className="max-w-sm text-sm text-ink-dim">{body}</p>}
      {action}
    </div>
  );
}
