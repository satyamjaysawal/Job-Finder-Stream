import { displayValue } from "../utils/display";

export default function JobCard({ job }) {
  const fresher = job.category === "fresher";
  const categoryLabel = fresher
    ? "Fresher"
    : job.category === "4h"
      ? "Last 4h"
      : displayValue(job.category, "Job");

  return (
    <article className="panel group flex min-h-[188px] w-full flex-col justify-between p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/[0.04] dark:hover:border-indigo-400/20 dark:hover:shadow-black/40">
      <div>
        {/* Top badges bar */}
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            <span className="chip-accent">{categoryLabel}</span>
            {(job.min_exp !== undefined && job.min_exp !== null || job.max_exp !== undefined && job.max_exp !== null) && (
              <span className="chip">
                {job.min_exp !== null && job.max_exp !== null && job.min_exp !== undefined && job.max_exp !== undefined
                  ? `${job.min_exp}–${job.max_exp} yrs`
                  : job.min_exp !== null && job.min_exp !== undefined
                    ? `${job.min_exp}+ yrs`
                    : `${job.max_exp} yrs max`}
              </span>
            )}
          </div>
          {job.time_ago && (
            <span className="text-[11px] font-semibold text-slate-450 dark:text-slate-500">
              {job.time_ago}
            </span>
          )}
        </div>

        {/* Title & Company */}
        <h2 className="mb-1.5 line-clamp-2 text-[14.5px] font-extrabold leading-snug tracking-tight text-slate-900 dark:text-white transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
          {displayValue(job.title, "Untitled Role")}
        </h2>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {displayValue(job.company)}
        </p>
      </div>

      {/* Footer Details */}
      <div className="mt-4 flex items-center justify-between gap-2.5 border-t border-slate-100 pt-3.5 dark:border-slate-900/60">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-450 dark:text-slate-500 truncate">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50/50 border border-indigo-100/50 px-2.5 py-1 text-xs font-bold text-indigo-650 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-400 dark:hover:bg-indigo-500 dark:hover:text-white transition-all cursor-pointer shadow-sm"
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
