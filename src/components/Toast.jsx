import { useEffect, useState } from "react";

const LABELS = {
  success: "Success",
  error: "Failed",
  info: "Info",
};

const ICONS = {
  success: (
    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  error: (
    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
};

const STYLES = {
  success: {
    shell:
      "border-emerald-200/80 bg-emerald-50/95 text-emerald-900 shadow-emerald-900/5 dark:border-emerald-800/50 dark:bg-emerald-950/95 dark:text-emerald-100",
    badge: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  error: {
    shell:
      "border-rose-200/80 bg-rose-50/95 text-rose-900 shadow-rose-900/5 dark:border-rose-800/50 dark:bg-rose-950/95 dark:text-rose-100",
    badge: "bg-rose-500/15 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
    bar: "bg-rose-500",
  },
  info: {
    shell:
      "border-indigo-200/70 bg-white/95 text-slate-800 shadow-slate-900/5 dark:border-slate-700/60 dark:bg-slate-950/95 dark:text-slate-100",
    badge: "bg-indigo-500/12 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300",
    bar: "bg-indigo-500",
  },
};

export default function Toast({ toast, onClose }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (toast?.message) setAnimate(true);
    else setAnimate(false);
  }, [toast]);

  if (!toast?.message) return null;

  const kind = STYLES[toast.type] ? toast.type : "info";
  const s = STYLES[kind];
  const label = LABELS[kind] || "Info";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto fixed top-2 right-2 z-[3000] w-auto max-w-[min(18rem,calc(100vw-1rem))] overflow-hidden rounded-lg border shadow-md backdrop-blur-sm transition-all duration-200 ease-out sm:top-3 sm:right-3 ${s.shell} ${
        animate
          ? "translate-y-0 opacity-100 scale-100"
          : "-translate-y-1.5 opacity-0 scale-[0.97]"
      }`}
    >
      {/* thin accent bar */}
      <div className={`h-0.5 w-full ${s.bar}`} />

      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <span
          className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${s.badge}`}
          aria-hidden
        >
          {ICONS[kind]}
        </span>

        <div className="min-w-0 flex-1 leading-none">
          <p className="text-[9px] font-bold uppercase tracking-wide opacity-70">
            {label}
          </p>
          <p className="mt-0.5 max-w-full truncate text-[11px] font-medium leading-snug opacity-95">
            {toast.message}
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            className="inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded text-current/40 transition hover:bg-black/5 hover:text-current/80 dark:hover:bg-white/10"
            onClick={() => {
              setAnimate(false);
              setTimeout(onClose, 150);
            }}
            aria-label="Dismiss"
          >
            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
