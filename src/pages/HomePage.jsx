import { useAppDispatch } from "../store/hooks";
import { setPage } from "../store/slices/uiSlice";

const cards = [
  {
    id: "dashboard",
    kicker: "Collections Browser",
    title: "Database Snapshots",
    desc: "Browse MongoDB job collections, open saved snapshot documents, and audit scraping results.",
    icon: (
      <svg className="h-6 w-6 text-indigo-500 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: "websocket-live",
    kicker: "Realtime WebSocket",
    title: "Live Scraping Feed",
    desc: "Stream live matching jobs directly over WebSockets while monitoring logs and adjusting scraper queries.",
    icon: (
      <svg className="h-6 w-6 text-violet-500 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const dispatch = useAppDispatch();

  return (
    <main className="page-shell justify-center py-10 sm:py-16 lg:py-24 relative overflow-hidden">
      {/* Premium glowing background mesh shapes */}
      <div className="absolute top-10 left-10 -z-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5 animate-bg-glow" />
      <div className="absolute bottom-10 right-10 -z-10 h-96 w-96 rounded-full bg-violet-500/10 blur-[150px] dark:bg-violet-500/5 animate-bg-glow" style={{ animationDelay: '-5s' }} />

      <section className="w-full relative z-10 max-w-4xl mx-auto px-4">
        <div className="text-center sm:text-left">
          <p className="page-kicker">Unified Control Center</p>
          <h1 className="page-title mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white leading-[1.1] pb-2">
            Smarter Job Scraping. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-550 via-purple-550 to-pink-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              Live Streaming.
            </span>
          </h1>
          <p className="page-subtitle mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-500 dark:text-slate-400">
            Monitor scraped collections and live WebSocket streams in a unified dashboard designed for desktop-first workflows and fully responsive for mobile productivity.
          </p>
        </div>

        <div className="mt-14 grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => dispatch(setPage(card.id))}
              className="panel panel-hover group flex min-h-[240px] flex-col items-start p-7 text-left relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 cursor-pointer glow-container"
            >
              {/* Top Row: Icon & Kicker */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-slate-200/50 shadow-sm dark:bg-slate-900/60 dark:border-slate-800 transition-all duration-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:border-indigo-200 dark:group-hover:border-indigo-900/60">
                  {card.icon}
                </div>
                <span className="page-kicker">{card.kicker}</span>
              </div>

              {/* Title & Desc */}
              <h2 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {card.title}
              </h2>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                {card.desc}
              </p>

              {/* Bottom CTA Arrow */}
              <span className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                Open Workspace
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
