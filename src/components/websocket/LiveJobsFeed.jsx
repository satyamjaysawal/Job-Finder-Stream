import JobCard from "../JobCard";
import { companiesMatch } from "../../utils/companies";

function MetaChip({ label, value, accent = false, mono = false }) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-0.5 rounded-xl border px-3 py-2 transition-all duration-200 ${
        accent
          ? "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-700/80 dark:bg-emerald-950/70 dark:text-emerald-100 shadow-xs"
          : "border-slate-300 bg-slate-100/90 text-slate-900 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 shadow-xs"
      }`}
    >
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 select-none">
        {label}
      </span>
      <span
        className={`truncate text-xs font-black ${
          accent
            ? "text-emerald-800 dark:text-emerald-300"
            : "text-slate-900 dark:text-white"
        } ${mono ? "font-mono tracking-tight" : ""}`}
        title={value != null && value !== "" ? String(value) : "—"}
      >
        {value != null && value !== "" ? String(value) : "—"}
      </span>
    </div>
  );
}

export default function LiveJobsFeed({ streamedJobs, dbMeta, sessionSaved = 0, companyFilter = [] }) {
  const visibleJobs =
    Array.isArray(companyFilter) && companyFilter.length
      ? streamedJobs.filter(
          (job) => !companiesMatch(job.company_raw || job.company, companyFilter)
        )
      : streamedJobs;
  const meta = dbMeta || {};
  const totalCount =
    meta.total_count != null ? meta.total_count : null;
  const savedInSession =
    meta.session_saved != null ? meta.session_saved : sessionSaved;

  return (
    <div className="live-feed-panel panel flex h-full min-h-[50vh] flex-1 flex-col p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3.5 dark:border-slate-800 select-none">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Realtime Feed
          </h3>
          {meta.connected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <span className="status-dot status-online" />
              MongoDB Live
            </span>
          ) : meta.connected === false ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-900 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-300">
              <span className="status-dot status-offline" />
              DB Offline
            </span>
          ) : null}
        </div>
        <span className="rounded-full border border-indigo-300 bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-900 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-200 shadow-xs">
          {companyFilter.length
            ? `${visibleJobs.length} of ${streamedJobs.length} in feed`
            : `${streamedJobs.length} in feed`}
        </span>
      </div>

      {/* MongoDB / cluster / db / collection strip */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <MetaChip
          label="MongoDB"
          value={meta.mongodb || meta.provider || "—"}
        />
        <MetaChip
          label="Cluster"
          value={meta.cluster_name || "—"}
          mono
        />
        <MetaChip
          label="Database"
          value={meta.dbname || meta.database || "—"}
          mono
        />
        <MetaChip
          label="Collection"
          value={meta.collection_name || meta.collection || "jobs"}
          mono
        />
        <MetaChip
          label="Total Count"
          value={totalCount != null ? totalCount : "—"}
          accent
        />
        <MetaChip
          label="Session Saved"
          value={savedInSession}
          accent
        />
      </div>

      {(meta.host || meta.session_id || meta.unique_index) && (
        <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5 rounded-xl border border-slate-300 bg-slate-100/90 px-3.5 py-2.5 text-[11px] font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-200">
          {meta.host && (
            <span>
              Host:{" "}
              <span className="font-mono font-extrabold text-indigo-700 dark:text-indigo-300">
                {meta.host}
              </span>
            </span>
          )}
          {meta.scheme && (
            <span>
              Scheme:{" "}
              <span className="font-mono font-extrabold text-indigo-700 dark:text-indigo-300">
                {meta.scheme}
              </span>
            </span>
          )}
          {meta.unique_index && (
            <span>
              Unique key:{" "}
              <span className="font-mono font-extrabold text-indigo-700 dark:text-indigo-300">
                {meta.unique_index}
              </span>
            </span>
          )}
          {meta.session_id && (
            <span>
              Session:{" "}
              <span className="font-mono font-extrabold text-indigo-700 dark:text-indigo-300">
                {String(meta.session_id).slice(0, 12)}…
              </span>
            </span>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="jobs-grid">
          {visibleJobs.map((job, idx) => (
            <div
              key={job._id || job.job_url || idx}
              className="relative animate-[fade-up_0.3s_ease-out_forwards]"
            >
              {job.saved === true && (
                <span className="absolute right-3 top-3 z-10 rounded-md bg-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-md">
                  Saved
                </span>
              )}
              {job.saved === false && (
                <span className="absolute right-3 top-3 z-10 rounded-md bg-rose-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-md">
                  Not Saved
                </span>
              )}
              <JobCard job={job} />
            </div>
          ))}
        </div>

        {visibleJobs.length === 0 && (
          <div className="flex h-full min-h-[40vh] flex-col items-center justify-center text-center p-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-300 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 shadow-md">
              <svg
                className="h-7 w-7 animate-pulse text-indigo-600 dark:text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253"
                />
              </svg>
            </div>
            <p className="text-base font-black text-slate-900 dark:text-white">
              {streamedJobs.length > 0 ? "All jobs in this feed are from excluded companies" : "Live Feed Inactive"}
            </p>
            <p className="mt-2 max-w-sm text-xs leading-relaxed font-medium text-slate-600 dark:text-slate-300">
              {streamedJobs.length > 0
                ? "Turn red (excluded) companies back to white to include them again."
                : (
                  <>
                    Click &quot;Start Live Stream&quot; to begin. Each run streams jobs into MongoDB collection{" "}
                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                      live_stream_&lt;timestamp&gt;
                    </span>{" "}
                    and updates the feed in real time.
                  </>
                )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
