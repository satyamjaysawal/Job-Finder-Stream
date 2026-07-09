import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchScrapeJsonList,
  backToCollections,
} from "../store/slices/scrapeJsonSlice";
import SnapshotStats from "../components/snapshots/SnapshotStats";
import SnapshotCard from "../components/snapshots/SnapshotCard";
import JobCard from "../components/JobCard";
import { formatWhen } from "../utils/display";

export default function JobsDashboardPage() {
  const dispatch = useAppDispatch();
  const {
    list: jobCollections,
    selectedJsonId,
    openCardId,
    openingId,
    deletingId,
    refreshingList,
    view,
    activeJobs,
    activeJsonMeta,
  } = useAppSelector((s) => s.scrapeJson);

  const [search, setSearch] = useState("");
  const [snapshotSearch, setSnapshotSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'live', 'snapshots'
  const [queriesExpanded, setQueriesExpanded] = useState(false);

  const queriesList = useMemo(() => {
    if (!activeJsonMeta?.search_term) return [];
    return activeJsonMeta.search_term
      .split(",")
      .map((q) => q.trim())
      .filter(Boolean);
  }, [activeJsonMeta?.search_term]);

  useEffect(() => {
    dispatch(fetchScrapeJsonList({ quiet: true }));
  }, [dispatch]);

  useEffect(() => {
    setSearch("");
    setQueriesExpanded(false);
  }, [selectedJsonId]);

  const isCardOpen = (key) => openCardId === key;
  const isCardActive = (key) => selectedJsonId === key;

  const totalCollections = jobCollections.length;
  const totalJobsTracked = jobCollections.reduce(
    (acc, item) => acc + (item.job_count || 0),
    0
  );

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeJobs;
    return activeJobs.filter((job) => {
      const title = (job.title || "").toLowerCase();
      const company = (job.company || "").toLowerCase();
      const location = (job.location || job.city || "").toLowerCase();
      return title.includes(q) || company.includes(q) || location.includes(q);
    });
  }, [activeJobs, search]);

  const liveStreamsCount = useMemo(() => {
    return jobCollections.filter(
      (item) =>
        item.source === "live_stream" ||
        String(item.collection_name || item.name || "").startsWith("live_stream_")
    ).length;
  }, [jobCollections]);

  const savedSnapshotsCount = useMemo(() => {
    return totalCollections - liveStreamsCount;
  }, [totalCollections, liveStreamsCount]);

  const filteredCollections = useMemo(() => {
    let result = jobCollections;

    // Filter by active tab
    if (activeTab === "live") {
      result = result.filter(
        (item) =>
          item.source === "live_stream" ||
          String(item.collection_name || item.name || "").startsWith("live_stream_")
      );
    } else if (activeTab === "snapshots") {
      result = result.filter(
        (item) =>
          !(
            item.source === "live_stream" ||
            String(item.collection_name || item.name || "").startsWith("live_stream_")
          )
      );
    }

    // Filter by search keyword
    const q = snapshotSearch.trim().toLowerCase();
    if (!q) return result;

    return result.filter((item) => {
      const name = (item.collection_name || item.name || "").toLowerCase();
      const query = (item.search_term || "").toLowerCase();
      const id = (item.id || "").toLowerCase();
      const city = (item.filters?.city || "").toLowerCase();
      return (
        name.includes(q) ||
        query.includes(q) ||
        id.includes(q) ||
        city.includes(q)
      );
    });
  }, [jobCollections, activeTab, snapshotSearch]);

  const isLoadingJobs = !!openingId;

  const handleClearFilters = () => {
    setSnapshotSearch("");
    setActiveTab("all");
  };

  if (view === "jobs" || isLoadingJobs) {
    const colName =
      activeJsonMeta?.collection_name ||
      activeJsonMeta?.name ||
      "Job collection";

    const activeLimit = activeJsonMeta?.filters?.target ?? activeJsonMeta?.filters?.limit ?? activeJsonMeta?.config_snapshot?.target;
    const activeResultsPer = activeJsonMeta?.filters?.results_per ?? activeJsonMeta?.config_snapshot?.results_per;
    const activeHours = activeJsonMeta?.filters?.hours_old ?? activeJsonMeta?.config_snapshot?.hours_old;
    const activeCity = activeJsonMeta?.filters?.city ?? (Array.isArray(activeJsonMeta?.config_snapshot?.cities) ? activeJsonMeta.config_snapshot.cities.join(", ") : "");

    return (
      <section className="page-shell">
        <div className="page-header animate-[fade-in_0.25s_ease-out]">
          <div className="min-w-0 w-full">
            <button
              type="button"
              className="btn-ghost mb-4 text-xs cursor-pointer inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-slate-100 transition-all duration-200 active:scale-95 shadow-sm"
              onClick={() => dispatch(backToCollections())}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Collections
            </button>
            <p className="page-kicker">Open Collection</p>
            <h2 className="page-title break-all text-xl sm:text-2xl" title={colName}>
              {colName}
            </h2>
            
            {/* Metadata Badges strip */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-250/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isLoadingJobs ? "Loading..." : `${activeJobs.length} jobs loaded`}
              </span>
              
              {activeJsonMeta?.created_at && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-900/70 dark:border-slate-800 dark:text-slate-400">
                  <svg className="h-3.5 w-3.5 text-slate-450 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Scraped {formatWhen(activeJsonMeta.created_at)}
                </span>
              )}

              {activeCity && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-950/40 dark:border-violet-900/60 dark:text-violet-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0z" />
                  </svg>
                  {activeCity}
                </span>
              )}

              {activeLimit != null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-400">
                  🎯 Cap: {activeLimit}
                </span>
              )}

              {activeResultsPer != null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:bg-sky-950/40 dark:border-sky-900/60 dark:text-sky-450">
                  📊 Hits/Q: {activeResultsPer}
                </span>
              )}

              {activeHours != null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-450">
                  ⏱️ Age: {activeHours}h
                </span>
              )}
            </div>

            {/* Queries chip container */}
            {queriesList.length > 0 && (
              <div className="mt-4 p-3 rounded-xl border border-slate-150/70 bg-slate-50/40 dark:border-slate-850/60 dark:bg-slate-950/20 max-w-4xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 select-none">
                    <svg className="h-3.5 w-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                    </svg>
                    Search Queries Used ({queriesList.length})
                  </span>
                  {queriesList.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setQueriesExpanded(!queriesExpanded)}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 hover:underline cursor-pointer transition-all"
                    >
                      {queriesExpanded ? "Collapse List" : `Show All (+${queriesList.length - 4})`}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(queriesExpanded ? queriesList : queriesList.slice(0, 4)).map((q, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-lg border border-indigo-100 bg-indigo-50/40 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:border-indigo-950 dark:bg-indigo-950/30 dark:text-indigo-400"
                    >
                      {q}
                    </span>
                  ))}
                  {!queriesExpanded && queriesList.length > 4 && (
                    <span className="inline-flex items-center rounded-lg border border-dashed border-slate-200 bg-slate-100/50 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900/20 dark:text-slate-450 select-none">
                      + {queriesList.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {!isLoadingJobs && (
          <div className="panel mb-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            {/* Magnifying glass search bar wrapper */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                </svg>
              </span>
              <input
                type="search"
                className="input-field pl-10"
                placeholder="Filter roles by title, company name, or location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex shrink-0 items-center justify-between sm:justify-end gap-2.5">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Showing</span>
              <span className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-extrabold text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-400">
                {filteredJobs.length} of {activeJobs.length}
              </span>
            </div>
          </div>
        )}

        {isLoadingJobs ? (
          <div className="empty-state py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent dark:border-indigo-400" />
            <p className="mt-4 text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse">
              Loading matching jobs from MongoDB snapshot…
            </p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <JobCard key={job._id || job.job_url} job={job} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-450 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-550">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-950 dark:text-white">
              {activeJobs.length === 0
                ? "No jobs in this collection"
                : "No jobs match your filter"}
            </p>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {activeJobs.length === 0
                ? "This MongoDB collection contains no job items."
                : "Try editing your query filter keyword or location name."}
            </p>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-kicker">Data Warehouse</p>
          <h2 className="page-title">Database Collections</h2>
          <p className="page-subtitle mt-2">
            Audit and browse every MongoDB snapshot — including each{" "}
            <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded-md text-[11.5px] border border-slate-200/50 dark:border-slate-800 select-none">
              Start Live Stream
            </span>{" "}
             run (<span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">live_stream_&lt;timestamp&gt;</span>).
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost self-start text-xs font-bold inline-flex items-center gap-1.5 rounded-xl cursor-pointer shadow-sm hover:bg-slate-100 transition-all active:scale-95 duration-200"
          disabled={refreshingList}
          onClick={() => dispatch(fetchScrapeJsonList())}
        >
          <svg
            className={`h-3.5 w-3.5 ${refreshingList ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {refreshingList ? "Syncing MongoDB…" : "Refresh Database"}
        </button>
      </div>

      <SnapshotStats
        totalCollections={totalCollections}
        totalJobsTracked={totalJobsTracked}
      />

      {/* Snapshot Search & Tab Filters Panel */}
      {jobCollections.length > 0 && (
        <div className="panel mb-6 p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Tab Buttons */}
          <div className="flex gap-1 bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-xl self-start select-none border border-slate-200/25 dark:border-slate-800/40">
            <button
              type="button"
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg cursor-pointer transition-all duration-200 ${
                activeTab === "all"
                  ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-950 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-850 dark:text-slate-450 dark:hover:text-slate-250"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All ({totalCollections})
            </button>
            <button
              type="button"
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg cursor-pointer transition-all duration-200 ${
                activeTab === "live"
                  ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-950 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-850 dark:text-slate-450 dark:hover:text-slate-250"
              }`}
              onClick={() => setActiveTab("live")}
            >
              Live Streams ({liveStreamsCount})
            </button>
            <button
              type="button"
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg cursor-pointer transition-all duration-200 ${
                activeTab === "snapshots"
                  ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-950 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-850 dark:text-slate-450 dark:hover:text-slate-250"
              }`}
              onClick={() => setActiveTab("snapshots")}
            >
              Snapshots ({savedSnapshotsCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md w-full">
            <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search collections by name, ID, or query term..."
              className="input-field pl-10 pr-9 py-2 text-xs"
              value={snapshotSearch}
              onChange={(e) => setSnapshotSearch(e.target.value)}
            />
            {snapshotSearch && (
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                onClick={() => setSnapshotSearch("")}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Snapshot Cards Grid */}
      <div className="grid w-full flex-1 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredCollections.map((item) => (
          <SnapshotCard
            key={item.id}
            item={item}
            active={isCardActive(item.id)}
            open={isCardOpen(item.id)}
            opening={openingId === item.id}
            deleting={deletingId === item.id}
          />
        ))}
      </div>

      {/* Filtered out empty state */}
      {jobCollections.length > 0 && filteredCollections.length === 0 && (
        <div className="empty-state mt-4 p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30">
          <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-450 dark:bg-slate-900 dark:text-slate-500 border border-slate-200/50 dark:border-slate-800">
            <svg className="h-5 w-5 animate-pulse text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            No snapshots match your filters
          </p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-450 dark:text-slate-500">
            There are no collections matching your search &ldquo;{snapshotSearch}&rdquo; in this tab category.
          </p>
          <button
            type="button"
            className="btn-primary mt-4 text-xs cursor-pointer py-1.5 px-3 rounded-lg font-bold"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Database totally empty state */}
      {jobCollections.length === 0 && (
        <div className="empty-state mt-2">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-950 dark:text-white">
            No Saved collections found
          </p>
          <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Run <strong>Start Live Stream</strong> on the Live Stream page — each
            run creates a new <span className="font-mono">live_stream_&lt;timestamp&gt;</span>{" "}
            collection and appears here automatically.
          </p>
        </div>
      )}
    </section>
  );
}
