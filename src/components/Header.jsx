import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleTheme, setPage } from "../store/slices/uiSlice";

export default function Header() {
  const dispatch = useAppDispatch();
  const { theme, backendOnline, page } = useAppSelector((s) => s.ui);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "dashboard", label: "Dashboard" },
    { id: "websocket-live", label: "Live Stream" },
  ];

  return (
    <header className="sticky top-0 z-[200] w-full border-b border-slate-200/40 bg-white/70 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/70">
      <div className="safe-pad mx-auto flex w-full max-w-[1920px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Branding & Logo */}
        <button
          type="button"
          onClick={() => dispatch(setPage("home"))}
          className="flex items-center gap-2 cursor-pointer group hover:opacity-90 transition-opacity focus:outline-none"
          aria-label="Go to Home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20 transition group-hover:scale-105">
            <svg
              className="h-4.5 w-4.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <span className="hidden text-sm font-extrabold tracking-widest text-slate-900 dark:text-white uppercase sm:block group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
            JobRadar
          </span>
        </button>

        {/* Navigation Tab Pills */}
        <nav
          className="flex min-w-0 flex-1 justify-center overflow-x-auto"
          aria-label="Main"
        >
          <div className="flex items-center gap-1 rounded-xl bg-slate-100/60 p-1 dark:bg-slate-900/50">
            {navItems.map((item) => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
                    active
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                  onClick={() => dispatch(setPage(item.id))}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Action Controls & Health */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Theme switcher (Sun/Moon icon buttons) */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/60 bg-white/60 text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-850 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-900"
            onClick={() => dispatch(toggleTheme())}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Connection status badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${
              backendOnline
                ? "border-emerald-200/50 bg-emerald-50/50 text-emerald-800 dark:border-emerald-950/40 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "border-rose-200/50 bg-rose-50/50 text-rose-800 dark:border-rose-950/40 dark:bg-rose-950/40 dark:text-rose-450"
            }`}
          >
            <span
              className={`status-dot ${backendOnline ? "status-online" : "status-offline"}`}
            />
            {backendOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </header>
  );
}
