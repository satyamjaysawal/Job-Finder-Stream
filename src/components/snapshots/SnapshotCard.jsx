import { useEffect, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import {
  openJsonCard,
  deleteScrapeJson,
  toggleOpenCard,
} from "../../store/slices/scrapeJsonSlice";
import { formatWhen } from "../../utils/display";
import { API_BASE } from "../../store/api";
import { notifyError } from "../../store/notify";

export default function SnapshotCard({ item, active, open, opening, deleting }) {
  const dispatch = useAppDispatch();
  const [fullData, setFullData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const collectionName = item.collection_name || item.name;
  const isLiveStream =
    item.source === "live_stream" ||
    String(collectionName || "").startsWith("live_stream_");
  const caps = item.filters || {};
  const limitVal = caps.target !== undefined && caps.target !== null ? caps.target : caps.limit;

  useEffect(() => {
    if (open && !fullData && !loadingDetails) {
      setLoadingDetails(true);
      fetch(`${API_BASE}/scrape-jsons/${item.id}`)
        .then(async (res) => {
          if (!res.ok) {
            notifyError(
              dispatch,
              `Failed to load collection details (HTTP ${res.status}).`
            );
            setLoadingDetails(false);
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data) setFullData(data);
          setLoadingDetails(false);
        })
        .catch((err) => {
          console.error("Failed to load collection details", err);
          notifyError(dispatch, "Failed to load collection details.");
          setLoadingDetails(false);
        });
    }
  }, [open, item.id, fullData, loadingDetails, dispatch]);

  const handleDelete = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!item.id) return;
    if (
      !window.confirm(
        `Delete job collection from MongoDB?\n\n${collectionName || item.id}\n\nThis drops the collection and cannot be undone.`
      )
    )
      return;
    dispatch(deleteScrapeJson({ id: item.id, name: collectionName }));
  };

  const handleOpen = () => {
    dispatch(openJsonCard(item.id));
  };

  const handleCopy = () => {
    if (!fullData) return;
    navigator.clipboard
      .writeText(JSON.stringify(fullData, null, 2))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  // Prettified key/value syntax-highlighter for JSON preview container
  const highlightJson = (obj) => {
    if (!obj) return null;
    const jsonStr = JSON.stringify(obj, null, 2);

    return jsonStr.split("\n").map((line, idx) => {
      const match = line.match(/^(\s*)(".*?")(\s*:\s*)(.*)$/);
      if (match) {
        const [, indent, key, colon, rest] = match;
        let highlightedVal = rest;

        if (rest.startsWith('"')) {
          highlightedVal = `<span class="text-emerald-400 dark:text-emerald-400 font-semibold">${rest}</span>`;
        } else if (
          rest.endsWith(",") &&
          rest.slice(0, -1).trim().match(/^(true|false|null|\d+(\.\d+)?)$/)
        ) {
          const valOnly = rest.slice(0, -1);
          highlightedVal = `<span class="text-amber-450 dark:text-amber-400 font-semibold">${valOnly}</span>,`;
        } else if (rest.trim().match(/^(true|false|null|\d+(\.\d+)?)$/)) {
          highlightedVal = `<span class="text-amber-450 dark:text-amber-400 font-semibold">${rest}</span>`;
        }

        return (
          <div key={idx} className="hover:bg-slate-900/60 px-1.5 py-0.5 leading-relaxed">
            <span className="text-[9px] text-slate-600 select-none mr-2.5 font-mono w-4 inline-block text-right">
              {idx + 1}
            </span>
            <span className="font-mono text-[11px] text-slate-300">{indent}</span>
            <span className="font-mono text-[11px] text-indigo-300 font-bold">{key}</span>
            <span className="font-mono text-[11px] text-slate-500">{colon}</span>
            <span className="font-mono text-[11px]" dangerouslySetInnerHTML={{ __html: highlightedVal }} />
          </div>
        );
      }

      return (
        <div key={idx} className="hover:bg-slate-900/60 px-1.5 py-0.5 leading-relaxed">
          <span className="text-[9px] text-slate-600 select-none mr-2.5 font-mono w-4 inline-block text-right">
            {idx + 1}
          </span>
          <span className="font-mono text-[11px] text-slate-400">{line}</span>
        </div>
      );
    });
  };

  return (
    <article
      className={`panel flex flex-col p-5 transition-all duration-300 relative overflow-hidden group ${
        active
          ? "border-indigo-500 ring-2 ring-indigo-500/10 shadow-lg shadow-indigo-500/[0.03] dark:border-indigo-400 dark:ring-indigo-400/10 scale-[1.01]"
          : "hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      {/* Decorative top strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300 ${
          isLiveStream
            ? "bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse"
            : "bg-gradient-to-r from-slate-400 to-indigo-500"
        }`}
      />

      <div className="flex flex-wrap items-start justify-between gap-3 mt-1.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {isLiveStream ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Live Stream Run
              </span>
            ) : (
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                Database Snapshot
              </span>
            )}
          </div>
          <h3
            className="mt-2 break-all text-sm font-extrabold leading-snug tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
            title={collectionName}
          >
            {collectionName}
          </h3>
          <p className="mt-2 text-xs font-semibold text-slate-450 dark:text-slate-500 flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatWhen(item.created_at)}
            {item.status && item.status !== "completed" ? (
              <>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-amber-600 font-bold dark:text-amber-400 animate-pulse capitalize">
                  {item.status}
                </span>
              </>
            ) : null}
          </p>
        </div>
        
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {active && (
            <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-150 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-400">
              Active
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-900/70 dark:border-slate-800 dark:text-slate-400">
            <svg className="h-3 w-3 text-slate-450 dark:text-slate-550" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {item.job_count ?? 0} jobs
          </span>
        </div>
      </div>

      {/* Scrape Parameters Metadata Badges */}
      {(item.search_term ||
        limitVal != null ||
        caps.results_per != null ||
        caps.hours_old != null ||
        caps.city) && (
        <div className="mt-4 p-3 rounded-xl border border-slate-150/70 bg-slate-50/40 dark:border-slate-850/60 dark:bg-slate-950/20 flex flex-wrap gap-1.5">
          {item.search_term && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50/40 px-2 py-1 text-[10px] font-bold text-indigo-700 dark:border-indigo-950 dark:bg-indigo-950/20 dark:text-indigo-450">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
              </svg>
              “{item.search_term}”
            </span>
          )}
          {caps.city && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-violet-100 bg-violet-50/40 px-2 py-1 text-[10px] font-bold text-violet-700 dark:border-violet-950 dark:bg-violet-950/20 dark:text-violet-450">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0z" />
              </svg>
              {caps.city}
            </span>
          )}
          {limitVal != null && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50/40 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-450">
              🎯 Cap: {limitVal}
            </span>
          )}
          {caps.results_per != null && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-sky-100 bg-sky-50/40 px-2 py-1 text-[10px] font-bold text-sky-700 dark:border-sky-950 dark:bg-sky-950/20 dark:text-sky-450">
              📊 Hits/Q: {caps.results_per}
            </span>
          )}
          {caps.hours_old != null && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-100 bg-amber-50/40 px-2 py-1 text-[10px] font-bold text-amber-700 dark:border-amber-950 dark:bg-amber-950/20 dark:text-amber-450">
              ⏱️ {caps.hours_old}h limit
            </span>
          )}
        </div>
      )}

      {open && (
        <div className="mt-4 border-t border-slate-150 dark:border-slate-850 pt-4 space-y-4 text-xs animate-[fade-down_0.2s_ease-out]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-150/70 bg-slate-50/40 dark:border-slate-850/60 dark:bg-slate-900/10 p-3">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Collection Identifier
              </span>
              <div className="mt-1 break-all font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400 selection:bg-indigo-500 selection:text-white">
                {item.id}
              </div>
            </div>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Default Filter Details
              </span>
              <div className="mt-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {item.filters?.city || "All Cities"}
                {item.filters?.countries ? ` · ${item.filters.countries}` : ""}
                {item.filters?.category ? ` · ${item.filters.category}` : ""}
                {limitVal != null ? ` · target≤${limitVal}` : ""}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-500 flex items-center gap-1">
                <svg className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
                Complete MongoDB Snapshot JSON
              </span>
              {fullData && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-lg bg-slate-100/70 border border-slate-200/50 hover:border-slate-300/80 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer inline-flex items-center gap-1"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {copied ? "Copied JSON!" : "Copy JSON"}
                </button>
              )}
            </div>

            {loadingDetails ? (
              <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-slate-150/70 bg-slate-950/5 dark:border-slate-850/60 p-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400" />
                <p className="mt-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
                  Querying database document...
                </p>
              </div>
            ) : (
              <div className="relative rounded-xl border border-slate-850/75 bg-slate-950 shadow-inner overflow-hidden">
                {/* Mock code terminal top bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-850 bg-slate-900">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-[9px] tracking-wide text-slate-500 uppercase select-none">
                    mongodb_schema.json
                  </span>
                  <div className="w-12 h-3" /> {/* Spacer spacer */}
                </div>
                {/* Terminal console area */}
                <pre className="max-h-56 overflow-y-auto p-3 font-mono text-[10px] leading-relaxed select-text scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {fullData ? (
                    highlightJson(fullData)
                  ) : (
                    <div className="text-slate-650 italic px-1.5 font-mono select-none">
                      // MongoDB collection currently empty. No documents to sample.
                    </div>
                  )}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button Row */}
      <div className="mt-auto pt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-900/60">
        <button
          type="button"
          className="btn-primary text-xs cursor-pointer py-1.5 px-3.5 rounded-xl font-bold inline-flex items-center gap-1.5 shadow-sm active:scale-95 duration-200"
          disabled={opening || deleting}
          onClick={handleOpen}
        >
          {opening ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Loading...
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
              </svg>
              Browse Jobs
            </>
          )}
        </button>
        <button
          type="button"
          className="btn-ghost text-xs cursor-pointer py-1.5 px-3.5 rounded-xl font-bold inline-flex items-center gap-1.5 active:scale-95 duration-200"
          onClick={() => dispatch(toggleOpenCard(item.id))}
        >
          {open ? (
            <>
              <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
              Collapse
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Audit Details
            </>
          )}
        </button>
        <button
          type="button"
          className="btn-danger inline-flex items-center gap-1 py-1.5 px-3.5 rounded-xl font-bold cursor-pointer transition-all duration-200 active:scale-95 ml-auto"
          disabled={deleting || opening}
          onClick={handleDelete}
        >
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {deleting ? "Deleting…" : "Delete Snapshot"}
        </button>
      </div>
    </article>
  );
}
