import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { notifyError, notifySuccess, notifyInfo } from "../store/notify";
import { fetchConfig } from "../store/slices/configSlice";
import { getWsUrl } from "../store/api";
import LiveStreamControls from "../components/websocket/LiveStreamControls";
import ProgressBar from "../components/websocket/ProgressBar";
import LogsTerminal from "../components/websocket/LogsTerminal";
import LiveJobsFeed from "../components/websocket/LiveJobsFeed";
import ScraperConfigCRUD from "../components/websocket/ScraperConfigCRUD";

export default function WebsocketLivePage() {
  const dispatch = useAppDispatch();
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [logs, setLogs] = useState([]);
  const [streamedJobs, setStreamedJobs] = useState([]);
  const [activeSession, setActiveSession] = useState(false);
  const [progress, setProgress] = useState(null);
  const [showScraperConfig, setShowScraperConfig] = useState(false);
  const [dbMeta, setDbMeta] = useState(null);
  const [sessionSaved, setSessionSaved] = useState(0);

  const [mobileTab, setMobileTab] = useState("controls"); // 'controls', 'logs', 'feed'

  const socketRef = useRef(null);

  const log = (message, type = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, message, type }]);
  };

  const connectWS = (scrapeParams) => {
    try {
      if (socketRef.current) {
        socketRef.current.close();
      }

      setWsStatus("connecting");
      log("Establishing socket connection…", "system");

      const wsUrl = getWsUrl("/ws/jobs");
      log(`Connecting WebSocket → ${wsUrl}`, "system");

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setWsStatus("connected");
        log("WebSocket connected. Streaming session ready.", "success");
        notifySuccess(dispatch, "WebSocket connected successfully.");

        if (scrapeParams) {
          log(
            `Scrape request (strict caps): query="${scrapeParams.search || "All"}", city="${scrapeParams.city || "All"}", target≤${scrapeParams.target}, results/q≤${scrapeParams.results_per}, hours=${scrapeParams.hours_old} → new collection ${scrapeParams.collection_name || "live_stream"}_{timestamp}`,
            "system"
          );
          notifyInfo(
            dispatch,
            "Live stream started — new MongoDB collection will be created for this run."
          );
          ws.send(
            JSON.stringify({
              action: "start_scrape",
              search: scrapeParams.search,
              city: scrapeParams.city,
              category:
                scrapeParams.category === "all" ? "" : scrapeParams.category,
              target: scrapeParams.target,
              results_per: scrapeParams.results_per,
              hours_old: scrapeParams.hours_old,
              min_exp: scrapeParams.min_exp,
              max_exp: scrapeParams.max_exp,
              countries: scrapeParams.countries,
              collection_name: scrapeParams.collection_name || "live_stream",
              name: scrapeParams.collection_name || "live_stream",
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "status") {
            log(data.message, "status");
          } else if (data.type === "db_info") {
            if (data.data) setDbMeta(data.data);
            if (data.message) log(data.message, "system");
          } else if (data.type === "initial_jobs") {
            log(data.message, "system");
            if (!scrapeParams) {
              setStreamedJobs(data.data || []);
            }
            if (data.db) setDbMeta(data.db);
          } else if (data.type === "job") {
            const job = data.data || {};
            if (data.db) setDbMeta(data.db);
            if (data.db?.session_saved != null) {
              setSessionSaved(data.db.session_saved);
            }
            const savedLabel =
              job.saved === true
                ? "SAVED"
                : job.saved === false
                  ? "SAVE FAIL"
                  : "STREAM";
            log(
              `[${savedLabel}] "${job.title}" @ "${job.company}" → ${
                job.database || data.db?.dbname || "db"
              }.${job.collection || data.db?.collection || "jobs"}`,
              job.saved === false ? "error" : "job"
            );
            setStreamedJobs((prev) => {
              const key = job._id || job.job_url;
              if (!key) return [job, ...prev];
              const without = prev.filter(
                (p) => p._id !== job._id && p.job_url !== job.job_url
              );
              return [job, ...without];
            });
            if (data.progress) setProgress(data.progress);
          } else if (data.type === "completed") {
            log(data.message, "success");
            if (data.db) setDbMeta(data.db);
            if (data.db?.session_saved != null) {
              setSessionSaved(data.db.session_saved);
            }
            if (data.collection_name) {
              log(
                `Dashboard collection ready: ${data.collection_name}` +
                  (data.scrape_json_id ? ` (id=${data.scrape_json_id})` : ""),
                "success"
              );
            }
            notifySuccess(
              dispatch,
              data.collection_name
                ? `Stream complete — saved as ${data.collection_name} (see Dashboard).`
                : data.message || "Live stream completed successfully."
            );
            setActiveSession(false);
            setProgress(null);
            setTimeout(() => {
              if (socketRef.current) socketRef.current.close();
            }, 1000);
          } else if (data.type === "new_job_broadcast") {
            log(
              `Broadcast: ${data.data.title} @ ${data.data.company}`,
              "broadcast"
            );
            setStreamedJobs((prev) => [data.data, ...prev]);
            if (window.Notification && Notification.permission === "granted") {
              new Notification("New Job Broadcasted!", {
                body: `${data.data.title} at ${data.data.company}`,
              });
            }
          }
        } catch (err) {
          console.error("Failed to parse websocket message", err);
        }
      };

      ws.onerror = (err) => {
        log("WebSocket transmission error.", "error");
        console.error("WebSocket error:", err);
        notifyError(dispatch, "WebSocket connection failure.");
        setActiveSession(false);
        setProgress(null);
      };

      ws.onclose = () => {
        setWsStatus("disconnected");
        log("WebSocket stream closed.", "system");
        setActiveSession(false);
        setProgress(null);
      };
    } catch (err) {
      log(`Socket connection failure: ${err.message}`, "error");
      notifyError(dispatch, `Connection error: ${err.message}`);
      setWsStatus("disconnected");
      setActiveSession(false);
      setProgress(null);
    }
  };

  useEffect(() => {
    dispatch(fetchConfig());
    if (window.Notification && Notification.permission === "default") {
      Notification.requestPermission();
    }
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [dispatch]);

  const startLiveStream = ({
    search,
    city,
    category,
    target,
    results_per,
    hours_old,
    min_exp,
    max_exp,
    countries,
    collection_name,
  }) => {
    setStreamedJobs([]);
    setActiveSession(true);
    setProgress(null);
    setLogs([]);
    setSessionSaved(0);
    connectWS({
      search,
      city,
      category,
      target,
      results_per,
      hours_old,
      min_exp,
      max_exp,
      countries,
      collection_name: collection_name || "live_stream",
    });
  };

  const statusLabel =
    wsStatus === "connected"
      ? "Connected"
      : wsStatus === "connecting"
        ? "Connecting…"
        : "Disconnected";

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-kicker">Live Analytics</p>
          <h2 className="page-title">Live Scraper Console</h2>
          <p className="page-subtitle mt-2">
            Configure scraper inputs and watch job documents flow in real time over WebSockets.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            className={`${
              showScraperConfig
                ? "btn-primary"
                : "btn-ghost"
            } text-xs font-bold inline-flex items-center gap-1.5 rounded-xl cursor-pointer active:scale-95 duration-200 shadow-sm`}
            onClick={() => setShowScraperConfig((v) => !v)}
            aria-expanded={showScraperConfig}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            {showScraperConfig ? "Hide Config" : "Configuration"}
          </button>
          
          {/* Connection status badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-wide select-none ${
              wsStatus === "connected"
                ? "border-emerald-200 bg-emerald-50/50 text-emerald-800 dark:border-emerald-950/40 dark:bg-emerald-950/40 dark:text-emerald-400"
                : wsStatus === "connecting"
                  ? "border-amber-200 bg-amber-50/50 text-amber-800 dark:border-amber-950/40 dark:bg-amber-950/40 dark:text-amber-400"
                  : "border-slate-200 bg-slate-100/50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"
            }`}
          >
            <span
              className={`status-dot ${
                wsStatus === "connected"
                  ? "status-online"
                  : wsStatus === "connecting"
                    ? "status-warn"
                    : "status-offline"
              }`}
            />
            {statusLabel}
          </span>
          
          {wsStatus === "disconnected" && (
            <button
              type="button"
              className="btn-ghost text-xs font-bold inline-flex items-center gap-1 py-1.5 px-3 rounded-lg cursor-pointer animate-pulse active:scale-95"
              onClick={() => connectWS()}
            >
              Reconnect
            </button>
          )}
        </div>
      </div>

      {showScraperConfig && (
        <div className="mb-6 w-full animate-[fade-up_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <ScraperConfigCRUD onClose={() => setShowScraperConfig(false)} />
        </div>
      )}

      {/* Mobile Tab switcher (only visible below lg breakpoint) */}
      <div className="flex lg:hidden bg-slate-150/70 dark:bg-slate-900/50 p-1.5 rounded-2xl mb-6 select-none border border-slate-200/40 dark:border-slate-800/40 gap-1">
        <button
          type="button"
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl cursor-pointer transition-all duration-200 ${
            mobileTab === "controls"
              ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-950 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          onClick={() => setMobileTab("controls")}
        >
          Parameters
        </button>
        <button
          type="button"
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl cursor-pointer transition-all duration-200 ${
            mobileTab === "logs"
              ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-950 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          onClick={() => setMobileTab("logs")}
        >
          Console ({logs.length})
        </button>
        <button
          type="button"
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl cursor-pointer transition-all duration-200 ${
            mobileTab === "feed"
              ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-950 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          onClick={() => setMobileTab("feed")}
        >
          Stream Feed ({streamedJobs.length})
        </button>
      </div>

      {/* Main Console Layout (Desktop: Split Panel Layout) */}
      <div className="hidden lg:grid min-h-0 flex-1 grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Stream controls */}
        <div className="flex flex-col gap-6 lg:col-span-4 xl:col-span-4 2xl:col-span-3">
          <LiveStreamControls
            activeSession={activeSession}
            wsStatus={wsStatus}
            onStartStream={startLiveStream}
          />
          <ProgressBar progress={progress} />
        </div>

        {/* Right Column: Console terminal & real-time jobs feed */}
        <div className="flex flex-col gap-6 lg:col-span-8 xl:col-span-8 2xl:col-span-9">
          <LogsTerminal logs={logs} />
          <LiveJobsFeed
            streamedJobs={streamedJobs}
            dbMeta={dbMeta}
            sessionSaved={sessionSaved}
          />
        </div>
      </div>

      {/* Mobile Tab-Filtered Views */}
      <div className="flex flex-col gap-5 lg:hidden">
        {mobileTab === "controls" && (
          <div className="flex flex-col gap-5 animate-[fade-up_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]">
            <LiveStreamControls
              activeSession={activeSession}
              wsStatus={wsStatus}
              onStartStream={startLiveStream}
            />
            <ProgressBar progress={progress} />
          </div>
        )}
        {mobileTab === "logs" && (
          <div className="animate-[fade-up_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]">
            <LogsTerminal logs={logs} />
          </div>
        )}
        {mobileTab === "feed" && (
          <div className="animate-[fade-up_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]">
            <LiveJobsFeed
              streamedJobs={streamedJobs}
              dbMeta={dbMeta}
              sessionSaved={sessionSaved}
            />
          </div>
        )}
      </div>
    </section>
  );
}
