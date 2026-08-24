import { displayValue } from "../utils/display";

export default function JobCard({ job }) {
  const fresher = job.category === "fresher";
  const categoryLabel = fresher
    ? "Fresher"
    : job.category === "4h"
      ? "Last 4h"
      : displayValue(job.category, "Job");

  return (
    <article className="panel group flex min-h-[210px] w-full flex-col justify-between p-5 border border-slate-200/90 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95 shadow-md hover:shadow-xl hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all duration-300 hover:-translate-y-1 rounded-2xl">
      <div>
        {/* Top badges bar */}
        <div className="mb-3.5 flex flex-col gap-2 select-none">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[10px] uppercase tracking-wider shadow-xs">
                {categoryLabel}
              </span>
              {(job.min_exp !== undefined && job.min_exp !== null || job.max_exp !== undefined && job.max_exp !== null) && (
                <span className="px-2.5 py-0.5 rounded-full border border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-extrabold text-[10px]">
                  {job.min_exp !== null && job.max_exp !== null && job.min_exp !== undefined && job.max_exp !== undefined
                    ? `${job.min_exp}–${job.max_exp} yrs`
                    : job.min_exp !== null && job.min_exp !== undefined
                      ? `${job.min_exp}+ yrs`
                      : `${job.max_exp} yrs max`}
                </span>
              )}
            </div>
            {job.time_ago && (
              <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300">
                {job.time_ago}
              </span>
            )}
          </div>

          {/* Dynamic Tags Row */}
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {job.is_easy_apply && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-black text-[9.5px] uppercase tracking-wider select-none animate-[pulse-glow_2s_infinite]">
                ⚡ Easy Apply
              </span>
            )}
            {job.workplace_type && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-black text-[9.5px] uppercase tracking-wider select-none ${
                job.workplace_type === "remote"
                  ? "border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-300"
                  : job.workplace_type === "hybrid"
                    ? "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    : "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              }`}>
                {job.workplace_type === "remote" ? "🏠 Remote" : job.workplace_type === "hybrid" ? "🏢 Hybrid" : "📍 Onsite"}
              </span>
            )}
            {job.job_type && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-violet-300 bg-violet-100 text-violet-900 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-300 font-black text-[9.5px] uppercase tracking-wider select-none">
                💼 {job.job_type}
              </span>
            )}
            {job.experience_level && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-black text-[9.5px] uppercase tracking-wider select-none ${
                job.experience_level === "fresher"
                  ? "border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : job.experience_level === "executive"
                    ? "border-purple-300 bg-purple-100 text-purple-900 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-300"
                    : "border-indigo-300 bg-indigo-100 text-indigo-900 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
              }`}>
                {job.experience_level === "fresher" ? "🎓 Fresher" : job.experience_level === "executive" ? "👑 Executive" : "📈 Experienced"}
              </span>
            )}
            {(job.has_hr_contact || job.hr_contact || job.hr_name) && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-pink-300 bg-pink-100 text-pink-900 dark:border-pink-700 dark:bg-pink-950 dark:text-pink-300 font-black text-[9.5px] uppercase tracking-wider select-none truncate max-w-[150px]"
                title={job.hr_contact || job.hr_name || "HR Contact Available"}
              >
                ✉️ {job.hr_name ? `HR: ${job.hr_name}` : job.hr_contact ? `HR: ${job.hr_contact}` : "HR Contact"}
              </span>
            )}
            {job.is_hr_role && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-rose-300 bg-rose-100 text-rose-900 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-300 font-black text-[9.5px] uppercase tracking-wider select-none">
                👔 HR Role
              </span>
            )}
          </div>
        </div>

        {/* Title & Company */}
        <h2 className="mb-1.5 line-clamp-2 text-base font-black leading-snug tracking-tight text-slate-900 dark:text-white transition-colors duration-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
          {displayValue(job.title, "Untitled Role")}
        </h2>
        <p className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5s0 0 0 0m0 3h-1.5s0 0 0 0m0 3h1.5s0 0 0 0m3-6h1.5s0 0 0 0m0 3h-1.5s0 0 0 0m0 3h1.5s0 0 0 0" />
          </svg>
          {displayValue(job.company)}
        </p>
      </div>

      {/* Footer Details */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200/90 pt-3.5 dark:border-slate-800">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title={displayValue(job.location || job.city)}>
          <svg className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-3.5 py-1.5 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-indigo-500/25 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            Apply
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        ) : (
          <span className="shrink-0 text-xs font-bold text-slate-400 dark:text-slate-500">No Link</span>
        )}
      </div>
    </article>
  );
}
