import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchConfig,
  saveConfigScalars,
  addQuery,
  editQuery,
  removeQuery,
  addCity,
  editCity,
  removeCity,
  addCountry,
  editCountry,
  removeCountry,
} from "../../store/slices/configSlice";

function ConfigListPanel({
  title,
  items,
  placeholder,
  onAdd,
  onEdit,
  onRemove,
  hint,
}) {
  const [newValue, setNewValue] = useState("");
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");

  const tagClass =
    "inline-flex items-center gap-1.5 rounded-xl border border-slate-200/60 bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-350 dark:hover:border-slate-700 backdrop-blur-sm";

  const startEdit = (value) => {
    setEditing(value);
    setEditValue(value);
  };

  const commitEdit = async () => {
    const next = editValue.trim();
    if (!editing || !next) return;
    await onEdit(editing, next);
    setEditing(null);
    setEditValue("");
  };

  return (
    <div className="panel-muted flex flex-col justify-between space-y-3.5 p-4">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {title} ({items?.length || 0})
          </h4>
        </div>
        {hint && (
          <p className="text-[10px] leading-snug text-slate-400 dark:text-slate-500">
            {hint}
          </p>
        )}
        <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-1 scrollbar-thin">
          {(items || []).length === 0 && (
            <span className="text-xs text-slate-400">No items yet — add below.</span>
          )}
          {(items || []).map((item) =>
            editing === item ? (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-slate-100 p-1.5 dark:border-indigo-900 dark:bg-slate-900"
              >
                <input
                  type="text"
                  className="input-field w-28 px-1.5 py-0.5 text-xs"
                  value={editValue}
                  autoFocus
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitEdit();
                    }
                    if (e.key === "Escape") {
                      setEditing(null);
                      setEditValue("");
                    }
                  }}
                />
                <button
                  type="button"
                  className="cursor-pointer text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  onClick={commitEdit}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="cursor-pointer text-[10px] font-bold text-slate-400 hover:text-slate-600"
                  onClick={() => {
                    setEditing(null);
                    setEditValue("");
                  }}
                >
                  ✕
                </button>
              </span>
            ) : (
              <span key={item} className={tagClass}>
                <button
                  type="button"
                  className="cursor-pointer hover:text-indigo-650 hover:underline dark:hover:text-indigo-400"
                  title="Click to edit value"
                  onClick={() => startEdit(item)}
                >
                  {item}
                </button>
                <button
                  type="button"
                  className="ml-0.5 cursor-pointer font-bold text-slate-400 transition hover:text-rose-600 dark:hover:text-rose-400"
                  title="Delete Item"
                  onClick={() => onRemove(item)}
                >
                  ✕
                </button>
              </span>
            )
          )}
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-200/30 pt-3 dark:border-slate-800">
        <input
          type="text"
          placeholder={placeholder}
          className="input-field flex-1 py-1.5 text-xs"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (newValue.trim()) {
                onAdd(newValue.trim());
                setNewValue("");
              }
            }
          }}
        />
        <button
          type="button"
          className="btn-ghost cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold"
          onClick={() => {
            if (newValue.trim()) {
              onAdd(newValue.trim());
              setNewValue("");
            }
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

/**
 * Full MongoDB `config` editor — mirrors Stream parameters:
 * queries, cities, countries, experience, performance limits, primary country.
 * Every save updates Redux → Live Stream Controls auto-refreshes.
 */
export default function ScraperConfigCRUD({ onClose }) {
  const dispatch = useAppDispatch();
  const { config, loading } = useAppSelector((s) => s.config);

  const [draftTarget, setDraftTarget] = useState(20);
  const [draftResultsPer, setDraftResultsPer] = useState(20);
  const [draftHoursOld, setDraftHoursOld] = useState(6);
  const [draftCountry, setDraftCountry] = useState("India");
  const [draftMinExp, setDraftMinExp] = useState("");
  const [draftMaxExp, setDraftMaxExp] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchConfig());
  }, [dispatch]);

  useEffect(() => {
    if (!config) return;
    setDraftTarget(config.target ?? 20);
    setDraftResultsPer(config.results_per ?? 20);
    setDraftHoursOld(config.hours_old ?? 6);
    setDraftCountry(config.country ?? "India");
    setDraftMinExp(
      config.min_exp != null && config.min_exp !== ""
        ? String(config.min_exp)
        : ""
    );
    setDraftMaxExp(
      config.max_exp != null && config.max_exp !== ""
        ? String(config.max_exp)
        : ""
    );
  }, [config]);

  const handleSaveScalars = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        target: parseInt(draftTarget, 10),
        results_per: parseInt(draftResultsPer, 10),
        hours_old: parseInt(draftHoursOld, 10),
        country: String(draftCountry || "").trim() || "India",
        min_exp: draftMinExp === "" ? null : parseInt(draftMinExp, 10),
        max_exp: draftMaxExp === "" ? null : parseInt(draftMaxExp, 10),
      };
      await dispatch(saveConfigScalars(payload));
      // Ensure Stream parameters picks up latest document (updated_at etc.)
      await dispatch(fetchConfig());
    } finally {
      setSaving(false);
    }
  };

  const runAdd = async (thunk, value) => {
    await dispatch(thunk(value));
    await dispatch(fetchConfig());
  };

  const runEdit = async (thunk, oldValue, newValue) => {
    await dispatch(thunk({ oldValue, newValue }));
    await dispatch(fetchConfig());
  };

  const runRemove = async (thunk, value) => {
    await dispatch(thunk(value));
    await dispatch(fetchConfig());
  };

  const updatedLabel = config?.updated_at
    ? String(config.updated_at).slice(0, 19)
    : "—";

  return (
    <div className="panel w-full p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-900">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Scraper Configuration
          </h3>
          <p className="mt-1 max-w-2xl text-xs text-slate-450 dark:text-slate-500">
            Edit the same fields used by{" "}
            <strong className="font-semibold text-slate-600 dark:text-slate-300">
              Stream parameters
            </strong>
            . Saved to MongoDB collection{" "}
            <span className="rounded-md border border-slate-200/50 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-350">
              config
            </span>
            . Stream parameters refresh automatically after every save.
          </p>
          <p className="mt-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            DB updated:{" "}
            <span className="font-mono text-slate-600 dark:text-slate-300">
              {updatedLabel}
            </span>
            {loading ? " · syncing…" : " · live"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-ghost cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold"
            onClick={() => dispatch(fetchConfig())}
            disabled={loading}
          >
            Refresh from DB
          </button>
          {onClose && (
            <button
              type="button"
              className="btn-ghost cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold"
              onClick={onClose}
            >
              Close Settings
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm lg:grid-cols-2 xl:grid-cols-3">
        {/* Performance + primary country + experience — saved together */}
        <form
          onSubmit={handleSaveScalars}
          className="panel-muted flex flex-col justify-between space-y-4 p-4 lg:col-span-2 xl:col-span-1"
        >
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Performance parameters
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-[9px] font-bold uppercase text-slate-450">
                  Target Cap
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-field px-1.5 py-1.5 text-center text-xs font-bold"
                  value={draftTarget}
                  onChange={(e) => setDraftTarget(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[9px] font-bold uppercase text-slate-450">
                  Hits/Query
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-field px-1.5 py-1.5 text-center text-xs font-bold"
                  value={draftResultsPer}
                  onChange={(e) => setDraftResultsPer(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[9px] font-bold uppercase text-slate-450">
                  Hours Old
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-field px-1.5 py-1.5 text-center text-xs font-bold"
                  value={draftHoursOld}
                  onChange={(e) => setDraftHoursOld(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[9px] font-bold uppercase text-slate-450">
                Primary country (default ★)
              </label>
              <select
                className="input-field py-1.5 text-xs font-semibold dark:bg-slate-900"
                value={draftCountry}
                onChange={(e) => setDraftCountry(e.target.value)}
              >
                {(config.countries || []).length === 0 && (
                  <option value={draftCountry}>{draftCountry || "India"}</option>
                )}
                {(config.countries || []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                {draftCountry &&
                  !(config.countries || []).includes(draftCountry) && (
                    <option value={draftCountry}>{draftCountry}</option>
                  )}
              </select>
              <p className="mt-1 text-[10px] text-slate-400">
                Used as the default country on Stream parameters.
              </p>
            </div>

            <div>
              <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Experience range (years)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    className="input-field px-3 text-xs"
                    value={draftMinExp}
                    onChange={(e) => setDraftMinExp(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    className="input-field px-3 text-xs"
                    value={draftMaxExp}
                    onChange={(e) => setDraftMaxExp(e.target.value)}
                  />
                </div>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Optional defaults for Stream parameters (leave blank = no filter).
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full cursor-pointer py-2 text-xs font-bold"
            disabled={saving}
          >
            {saving ? "Saving to MongoDB…" : "Save performance & experience"}
          </button>
        </form>

        <ConfigListPanel
          title="Search queries"
          items={config.search_queries}
          placeholder="Add query…"
          hint="Shown under Stream parameters → Queries"
          onAdd={(v) => runAdd(addQuery, v)}
          onEdit={(oldV, newV) => runEdit(editQuery, oldV, newV)}
          onRemove={(v) => runRemove(removeQuery, v)}
        />

        <ConfigListPanel
          title="Cities"
          items={config.cities}
          placeholder="Add city…"
          hint="Shown under Stream parameters → Cities"
          onAdd={(v) => runAdd(addCity, v)}
          onEdit={(oldV, newV) => runEdit(editCity, oldV, newV)}
          onRemove={(v) => runRemove(removeCity, v)}
        />

        <ConfigListPanel
          title="Countries"
          items={config.countries}
          placeholder="Add country…"
          hint="Shown under Stream parameters → Countries"
          onAdd={(v) => runAdd(addCountry, v)}
          onEdit={(oldV, newV) => runEdit(editCountry, oldV, newV)}
          onRemove={(v) => runRemove(removeCountry, v)}
        />
      </div>
    </div>
  );
}
