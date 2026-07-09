import { useEffect, useRef, useState } from "react";

export default function LogsTerminal({ logs }) {
  const terminalEndRef = useRef(null);
  const [clearedOffset, setClearedOffset] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  const visibleLogs = logs.slice(clearedOffset);

  useEffect(() => {
    if (autoScroll && visibleLogs.length > 0) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll, visibleLogs.length]);

  // Reset cleared offset if logs gets fully emptied from parent
  useEffect(() => {
    if (logs.length === 0) {
      setClearedOffset(0);
    }
  }, [logs]);

  const handleClear = () => {
    setClearedOffset(logs.length);
  };

  const handleCopy = () => {
    if (visibleLogs.length === 0) return;
    const text = visibleLogs.map((l) => `[${l.time}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="panel flex min-h-[260px] flex-1 flex-col overflow-hidden bg-slate-950 border border-slate-900 shadow-xl shadow-indigo-950/5">
      {/* Console Top Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-900 bg-slate-950 px-4 py-2">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="ml-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Console Logs
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Auto Scroll Checkbox */}
          <label className="flex cursor-pointer items-center gap-1.5 font-mono text-[9px] font-semibold text-slate-400 select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-900 border-slate-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 accent-indigo-500"
            />
            AutoScroll
          </label>
          
          <button
            type="button"
            onClick={handleCopy}
            disabled={visibleLogs.length === 0}
            className="font-mono text-[9px] font-bold text-slate-400 hover:text-indigo-400 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={visibleLogs.length === 0}
            className="font-mono text-[9px] font-bold text-slate-400 hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Console Output area */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[10.5px] leading-relaxed text-slate-350 space-y-1 scrollbar-thin max-h-[300px]">
        {visibleLogs.map((l, index) => {
          let colorClass = "text-slate-300";
          if (l.type === "success") colorClass = "text-emerald-450 font-bold";
          else if (l.type === "error") colorClass = "text-rose-450 font-bold";
          else if (l.type === "system") colorClass = "text-cyan-400 font-semibold";
          else if (l.type === "status") colorClass = "text-sky-350";
          else if (l.type === "broadcast") colorClass = "text-amber-400 font-semibold";
          else if (l.type === "job") colorClass = "text-indigo-300";

          return (
            <div key={index} className="break-words px-1.5 py-0.5 rounded hover:bg-slate-900/40">
              <span className="mr-2 text-slate-600 select-none">[{l.time}]</span>
              <span className={colorClass}>{l.message}</span>
            </div>
          );
        })}
        
        {/* Cursor & Blinking Caret */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-500">
          <span>&gt;</span>
          <span className="h-3 w-1.5 bg-indigo-500 animate-pulse" />
        </div>

        {visibleLogs.length === 0 && (
          <div className="px-1.5 py-3 text-slate-600 italic">No output logs standard stream active.</div>
        )}
        
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
