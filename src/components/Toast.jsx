import { useEffect, useState } from "react";

const ICONS = {
  success: (
    <svg className="h-5 w-5 text-emerald-650 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
};

const BOX_STYLES = {
  success: "border-emerald-500/20 bg-emerald-50/90 text-emerald-950 dark:border-emerald-500/20 dark:bg-emerald-950/90 dark:text-emerald-50 shadow-emerald-500/5",
  error: "border-rose-500/20 bg-rose-50/90 text-rose-950 dark:border-rose-500/20 dark:bg-rose-950/90 dark:text-rose-50 shadow-rose-500/5",
  info: "border-indigo-500/20 bg-white/95 text-slate-900 dark:border-slate-800/80 dark:bg-slate-950/90 dark:text-slate-50 shadow-indigo-500/5",
};

export default function Toast({ toast, onClose }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (toast?.message) {
      setAnimate(true);
    } else {
      setAnimate(false);
    }
  }, [toast]);

  if (!toast?.message) return null;

  const kind = BOX_STYLES[toast.type] ? toast.type : "info";
  const boxStyle = BOX_STYLES[kind];
  const icon = ICONS[kind];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-4 right-4 left-4 z-[3000] mx-auto max-w-md rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 sm:top-5 sm:right-5 sm:left-auto sm:mx-0 ${boxStyle} ${
        animate ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0">{icon}</span>
        
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wider uppercase opacity-60">
            {toast.type || "notification"}
          </p>
          <p className="mt-1 text-sm font-medium leading-relaxed opacity-95">
            {toast.message}
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            className="shrink-0 rounded-lg p-0.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition hover:text-slate-600 dark:hover:text-slate-200"
            onClick={() => {
              setAnimate(false);
              setTimeout(onClose, 200);
            }}
            aria-label="Dismiss Alert"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
