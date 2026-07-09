import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleTheme, setPage } from "../store/slices/uiSlice";

export default function Header() {
  const dispatch = useAppDispatch();
  const { theme, backendOnline, page } = useAppSelector((s) => s.ui);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          onClick={() => {
            dispatch(setPage("home"));
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2 cursor-pointer group hover:opacity-90 transition-opacity focus:outline-none"
          aria-label="Go to Home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20 transition duration-300 group-hover:scale-105">
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
          <span className="hidden text-sm font-extrabold tracking-widest text-slate-900 dark:text-white uppercase sm:block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            JobRadar
          </span>
        </button>

        {/* Navigation Tab Pills (Desktop) */}
        <nav
          className="hidden md:flex min-w-0 flex-1 justify-center"
          aria-label="Main"
        >
          <div className="flex items-center gap-1 rounded-xl bg-slate-100/60 p-1 dark:bg-slate-900/50">
            {navItems.map((item) => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-white text-indigo-650 shadow-sm dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
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
        <div className="flex shrink-0 items-center gap-2.5">
          {/* Theme switcher */}
          <button
            type="button"
            className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-slate-200/60 bg-white/60 text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-350 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer active:scale-95"
            onClick={() => dispatch(toggleTheme())}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Connection status badge (Desktop/Tablet) */}
          <span
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold tracking-wide transition-colors duration-250 select-none border-slate-200 bg-slate-50/50 text-slate-650 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"
            title={`Backend is ${backendOnline ? "Online" : "Offline"}`}
          >
            <span
              className={`status-dot ${backendOnline ? "status-online" : "status-offline"}`}
            />
            {backendOnline ? "Online" : "Offline"}
          </span>

          {/* Hamburger button on mobile */}
          <button
            type="button"
            className="flex md:hidden h-8.5 w-8.5 items-center justify-center rounded-xl border border-slate-200/60 bg-white/60 text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-350 dark:hover:bg-slate-900 cursor-pointer active:scale-95"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-[57px] left-0 right-0 z-[150] border-b border-slate-200/35 bg-white/95 px-4 py-3.5 shadow-lg backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/95 animate-[fade-up_0.2s_ease-out] md:hidden">
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`w-full rounded-xl px-4 py-2.5 text-left text-xs font-bold transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-indigo-50/80 text-indigo-650 dark:bg-indigo-950/45 dark:text-indigo-405"
                      : "text-slate-600 hover:bg-slate-50/50 dark:text-slate-300 dark:hover:bg-slate-900/50"
                  }`}
                  onClick={() => {
                    dispatch(setPage(item.id));
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </button>
              );
            })}
            
            {/* Connection status inside mobile dropdown */}
            <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-900 select-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Connection Status</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                  backendOnline
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950 dark:text-emerald-400"
                    : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-950 dark:bg-rose-950 dark:text-rose-400"
                }`}
              >
                <span className={`status-dot ${backendOnline ? "status-online" : "status-offline"}`} />
                {backendOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
