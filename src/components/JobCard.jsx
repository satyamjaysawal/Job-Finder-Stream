import { displayValue } from "../utils/display";

export default function JobCard({ job }) {
  const fresher = job.category === "fresher";
  const categoryLabel = fresher
    ? "Fresher"
    : job.category === "4h"
      ? "Last 4h"
      : displayValue(job.category, "Job");

  return (
    <article className="panel group flex min-h-[196px] w-full flex-col justify-between p-5.5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/[0.03] dark:hover:border-indigo-400/30 dark:hover:shadow-black/30 glow-container">
      <div>
        {/* Top badges bar */}
        <div className="mb-4 flex flex-col gap-2 select-none">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <span className="chip-accent px-2.5 py-0.5 rounded-full border border-indigo-200/40 bg-indigo-50/60 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-400 font-extrabold text-[9.5px]">
                {categoryLabel}
              </span>
              {(job.min_exp !== undefined && job.min_exp !== null || job.max_exp !== undefined && job.max_exp !== null) && (
                <span className="chip px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-100/60 dark:border-slate-800 dark:bg-slate-900/50 font-extrabold text-[9.5px] text-slate-500 dark:text-slate-400">
                  {job.min_exp !== null && job.max_exp !== null && job.min_exp !== undefined && job.max_exp !== undefined
                    ? `${job.min_exp}–${job.max_exp} yrs`
                    : job.min_exp !== null && job.min_exp !== undefined
                      ? `${job.min_exp}+ yrs`
                      : `${job.max_exp} yrs max`}
                </span>
              )}
            </div>
            {job.time_ago && (
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {job.time_ago}
              </span>
            )}
          </div>

          {/* Dynamic Tags Row */}
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {job.is_easy_apply && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-250/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[9px] uppercase tracking-wider select-none animate-[pulse-glow_2s_infinite]">
                ⚡ Easy Apply
              </span>
            )}
            {job.workplace_type && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-extrabold text-[9px] uppercase tracking-wider select-none ${
                job.workplace_type === "remote"
                  ? "border-sky-200/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                  : job.workplace_type === "hybrid"
                    ? "border-amber-200/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "border-slate-200/40 bg-slate-100/40 text-slate-500 dark:text-slate-400"
              }`}>
                {job.workplace_type === "remote" ? "🏠 Remote" : job.workplace_type === "hybrid" ? "🏢 Hybrid" : "📍 Onsite"}
              </span>
            )}
            {job.job_type && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-violet-200/30 bg-violet-500/10 text-violet-600 dark:text-violet-400 font-extrabold text-[9px] uppercase tracking-wider select-none">
                💼 {job.job_type}
              </span>
            )}
            {job.experience_level && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-extrabold text-[9px] uppercase tracking-wider select-none ${
                job.experience_level === "fresher"
                  ? "border-emerald-200/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : job.experience_level === "executive"
                    ? "border-purple-200/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    : "border-indigo-200/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              }`}>
                {job.experience_level === "fresher" ? "🎓 Fresher" : job.experience_level === "executive" ? "👑 Executive" : "📈 Experienced"}
              </span>
            )}
          </div>
        </div>

        {/* Title & Company */}
        <h2 className="mb-2 line-clamp-2 text-[15px] font-extrabold leading-snug tracking-tight text-slate-900 dark:text-white transition duration-300 group-hover:text-indigo-650 dark:group-hover:text-indigo-400">
          {displayValue(job.title, "Untitled Role")}
        </h2>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {displayValue(job.company)}
        </p>
      </div>

      {/* Footer Details */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-900/70">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-450 dark:text-slate-500 truncate" title={displayValue(job.location || job.city)}>
          <svg className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {displayValue(job.location || job.city)}
        </span>
        
        {job.job_url ? (
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-xl bg-indigo-50/60 border border-indigo-150/40 px-3 py-1.5 text-xs font-bold text-indigo-650 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-400 dark:hover:bg-indigo-550 dark:hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 duration-200 shrink-0"
          >
            Apply
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        ) : (
          <span className="shrink-0 text-xs font-semibold text-slate-400">No Link</span>
        )}
      </div>
    </article>
  );
}
