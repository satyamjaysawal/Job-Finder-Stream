export default function ProgressBar({ progress }) {
  if (!progress) return null;

  return (
    <div className="panel p-4 shadow-sm shadow-indigo-500/5">
      <div className="mb-2.5 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[9px]">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          Scraper progress
        </span>
        <span className="font-mono text-slate-700 dark:text-slate-200 text-[10.5px]">
          {progress.current} / {progress.total} ({progress.percentage}%)
        </span>
      </div>
      <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/80 p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-300 ease-out animate-progress-stripes"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
}
