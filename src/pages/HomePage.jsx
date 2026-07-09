import { useAppDispatch } from "../store/hooks";
import { setPage } from "../store/slices/uiSlice";

const cards = [
  {
    id: "dashboard",
    kicker: "Collections Browser",
    title: "Database Snapshots",
    desc: "Browse MongoDB job collections, open saved snapshot documents, and audit scraping results.",
    icon: (
      <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
      <svg className="h-6 w-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const dispatch = useAppDispatch();

  return (
    <main className="page-shell justify-center py-10 sm:py-16 lg:py-20 relative overflow-hidden">
      {/* Decorative blurred mesh blobs in the background */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-500/5" />
      <div className="absolute bottom-1/3 right-1/4 -z-10 h-80 w-80 rounded-full bg-violet-500/10 blur-[120px] dark:bg-violet-500/5" />

      <section className="w-full relative z-10 max-w-4xl mx-auto px-4">
        <div className="text-center sm:text-left">
          <p className="page-kicker">Unified Control Center</p>
          <h1 className="page-title mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white leading-none">
            Smarter Job Scraping. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Live Streaming.
            </span>
          </h1>
          <p className="page-subtitle mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-500 dark:text-slate-400">
            Monitor scraped collections and live WebSocket streams in a unified dashboard designed for desktop-first workflows.
          </p>
        </div>

        <div className="mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => dispatch(setPage(card.id))}
              className="panel panel-hover group flex min-h-[220px] flex-col items-start p-6 text-left relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30 dark:hover:border-indigo-400/30"
            >
              {/* Top Row: Icon & Kicker */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 shadow-sm dark:bg-slate-900/60 dark:border-slate-800 transition-colors group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40">
                  {card.icon}
                </div>
                <span className="page-kicker">{card.kicker}</span>
              </div>

              {/* Title & Desc */}
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white transition group-hover:text-indigo-600 dark:group-hover:text-indigo-450">
                {card.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {card.desc}
              </p>

              {/* Bottom CTA Arrow */}
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-450">
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
