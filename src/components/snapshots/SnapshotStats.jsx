export default function SnapshotStats({ totalCollections, totalJobsTracked }) {
  const items = [
    {
      label: "Collections",
      value: totalCollections,
      desc: "MongoDB active collections",
      large: true,
      gradient: "from-indigo-500/12 to-indigo-600/5 dark:from-indigo-550/10 dark:to-transparent",
      borderColor: "hover:border-indigo-500/30 dark:hover:border-indigo-500/20",
      icon: (
        <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      label: "Total Jobs Scraped",
      value: totalJobsTracked,
      desc: "Combined job documents",
      large: true,
      gradient: "from-violet-500/12 to-violet-600/5 dark:from-violet-550/10 dark:to-transparent",
      borderColor: "hover:border-violet-500/30 dark:hover:border-violet-500/20",
      icon: (
        <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      label: "Browse Focus",
      value: "Dashboard of Jobs",
      desc: "Interactive job visualizer",
      large: false,
      gradient: "from-amber-500/12 to-amber-600/5 dark:from-amber-550/10 dark:to-transparent",
      borderColor: "hover:border-amber-500/30 dark:hover:border-amber-500/20",
      icon: (
        <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: "Data Source",
      value: "MongoDB Atlas",
      desc: "Cloud database cluster",
      large: false,
      gradient: "from-emerald-500/12 to-emerald-600/5 dark:from-emerald-550/10 dark:to-transparent",
      borderColor: "hover:border-emerald-500/30 dark:hover:border-emerald-500/20",
      icon: (
        <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mb-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={`panel relative overflow-hidden p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group ${item.borderColor}`}
        >
          {/* Subtle background glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-40 transition-opacity duration-300 group-hover:opacity-70 pointer-events-none`} />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {item.label}
              </p>
              <p
                className={`mt-2.5 truncate text-slate-950 dark:text-white leading-none ${
                  item.large
                    ? "text-3xl font-extrabold tracking-tight"
                    : "text-[15px] font-extrabold tracking-wide"
                }`}
              >
                {item.value}
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white border border-slate-150/70 dark:bg-slate-900/70 dark:border-slate-800 transition-colors group-hover:bg-slate-50 dark:group-hover:bg-slate-950 shadow-sm shadow-slate-900/[0.01]">
              {item.icon}
            </div>
          </div>

          <p className="relative z-10 mt-3.5 text-[10px] font-semibold text-slate-450 dark:text-slate-500 flex items-center gap-1.5 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-350 dark:bg-slate-700" />
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  );
}
