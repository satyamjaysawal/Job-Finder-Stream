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
    <div className="home-hero page-shell justify-center">
      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/25 bg-indigo-400/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-indigo-100 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_#4ade80]" />
            Your job marketing command center
          </div>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-7xl">
            Find the right roles.<br />
            <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">Move your career forward.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
            A calm, focused workspace for discovering opportunities, organising job snapshots, and watching fresh matches arrive live.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => dispatch(setPage("websocket-live"))} className="btn-primary bg-white px-5 text-slate-900 shadow-xl shadow-indigo-950/30 hover:bg-indigo-50 hover:text-indigo-700">
              Start live discovery
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
            </button>
            <button type="button" onClick={() => dispatch(setPage("dashboard"))} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[.08] px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/[.16]">
              Browse job snapshots
            </button>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            <div className="home-stat"><p className="text-lg font-extrabold text-white">Live</p><p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">Job signals</p></div>
            <div className="home-stat"><p className="text-lg font-extrabold text-white">Smart</p><p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">Filters</p></div>
            <div className="home-stat"><p className="text-lg font-extrabold text-white">One place</p><p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">For progress</p></div>
          </div>
        </section>

        <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => dispatch(setPage(card.id))}
              className="group flex min-h-[220px] flex-col items-start overflow-hidden rounded-2xl border border-white/15 bg-slate-950/55 p-6 text-left shadow-2xl shadow-slate-950/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300/50 hover:bg-slate-950/70 cursor-pointer"
            >
              {/* Top Row: Icon & Kicker */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-sm transition-all duration-300 group-hover:bg-indigo-400/15">
                  {card.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-200">{card.kicker}</span>
              </div>

              {/* Title & Desc */}
              <h2 className="text-xl font-extrabold tracking-tight text-white transition-colors duration-300 group-hover:text-indigo-200">
                {card.title}
              </h2>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-300 font-medium">
                {card.desc}
              </p>

              {/* Bottom CTA Arrow */}
              <span className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-white group-hover:text-indigo-200 transition-colors duration-300">
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
      </div>
    </div>
  );
}
