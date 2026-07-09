import JobCard from "../JobCard";

function MetaChip({ label, value, accent = false, mono = false }) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-0.5 rounded-xl border px-3 py-2 transition-colors duration-200 ${
        accent
          ? "border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-950/35 dark:bg-emerald-950/20"
          : "border-slate-200/50 bg-white/50 dark:border-slate-850/50 dark:bg-slate-950/25"
      }`}
    >
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 select-none">
        {label}
      </span>
      <span
        className={`truncate text-xs font-extrabold ${
          accent
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-slate-850 dark:text-slate-200"
        } ${mono ? "font-mono tracking-tight" : ""}`}
        title={value != null && value !== "" ? String(value) : "—"}
      >
        {value != null && value !== "" ? String(value) : "—"}
      </span>
    </div>
  );
}

export default function LiveJobsFeed({ streamedJobs, dbMeta, sessionSaved = 0 }) {
  const meta = dbMeta || {};
  const totalCount =
    meta.total_count != null ? meta.total_count : null;
  const savedInSession =
    meta.session_saved != null ? meta.session_saved : sessionSaved;

  return (
    <div className="panel flex h-full min-h-[50vh] flex-1 flex-col p-5">
      <div className="mb-4.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5 dark:border-slate-900/60 select-none">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Realtime Feed
          </h3>
          {meta.connected ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="status-dot status-online" />
              MongoDB live
            </span>
          ) : meta.connected === false ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-250/30 bg-rose-50/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
              <span className="status-dot status-offline" />
              DB offline
            </span>
          ) : null}
        </div>
        <span className="rounded-full border border-indigo-100/50 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-extrabold text-indigo-600 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-400">
          {streamedJobs.length} in feed
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
          label="Total count"
          value={totalCount != null ? totalCount : "—"}
          accent
        />
        <MetaChip
          label="Session saved"
          value={savedInSession}
          accent
        />
      </div>

      {(meta.host || meta.session_id || meta.unique_index) && (
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 rounded-xl border border-dashed border-slate-200/80 bg-slate-50/50 px-3 py-2 text-[10px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400">
          {meta.host && (
            <span>
              Host:{" "}
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {meta.host}
              </span>
            </span>
          )}
          {meta.scheme && (
            <span>
              Scheme:{" "}
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {meta.scheme}
              </span>
            </span>
          )}
          {meta.unique_index && (
            <span>
              Unique key:{" "}
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {meta.unique_index}
              </span>
            </span>
          )}
          {meta.session_id && (
            <span>
              Session:{" "}
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {String(meta.session_id).slice(0, 12)}…
              </span>
            </span>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="jobs-grid">
          {streamedJobs.map((job, idx) => (
            <div
              key={job._id || job.job_url || idx}
              className="relative animate-[fade-up_0.3s_ease-out_forwards]"
            >
              {job.saved === true && (
                <span className="absolute right-2 top-2 z-10 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-400">
                  Saved
                </span>
              )}
              {job.saved === false && (
                <span className="absolute right-2 top-2 z-10 rounded-md border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-400">
                  Not saved
                </span>
              )}
              <JobCard job={job} />
            </div>
          ))}
        </div>

        {streamedJobs.length === 0 && (
          <div className="flex h-full min-h-[40vh] flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-450 dark:border-slate-800 dark:bg-slate-900">
              <svg
                className="h-6 w-6 animate-pulse text-indigo-500"
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
            <p className="text-sm font-bold text-slate-850 dark:text-slate-200">
              Live Feed Inactive
            </p>
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Click &quot;Start Live Stream&quot; — each run creates a new MongoDB
              collection{" "}
              <span className="font-mono font-bold">
                live_stream_&lt;timestamp&gt;
              </span>{" "}
              (strict parameter caps) and lists it on the Dashboard. Active
              collection:{" "}
              <span className="font-mono font-bold">
                {(meta.dbname || meta.database || "db") +
                  "." +
                  (meta.collection_name || meta.collection || "—")}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
