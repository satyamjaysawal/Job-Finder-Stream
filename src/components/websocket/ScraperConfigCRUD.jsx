import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchConfig,
  saveConfigScalars,
  addQuery,
  editQuery,
  removeQuery,
  addQueryGroup,
  removeQueryGroup,
  addCity,
  editCity,
  removeCity,
  addCountry,
  editCountry,
  removeCountry,
  addCompany,
  editCompany,
  removeCompany,
} from "../../store/slices/configSlice";
import { groupLabel, queryGroupsFromConfig } from "../../utils/queryGroups";

function ConfigListPanel({
  title,
  items,
  placeholder,
  onAdd,
  onEdit,
  onRemove,
  hint,
  addLabel = "Add",
}) {
  const [newValue, setNewValue] = useState("");
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const tagClass =
    "inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-900 shadow-xs hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600";

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
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            {title} ({items?.length || 0})
          </h4>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 rounded-md border border-slate-200/80 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
            title={isExpanded ? "Collapse list view" : "Expand list view to show all items"}
          >
            <svg className="h-3 w-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={isExpanded ? "M9 9L4 4m0 0h5m-5 0v5m11 0V4m0 0h-5m5 0l-5 5M9 15l-5 5m0 0h5m-5 0v-5m11 5v-5m0 5h-5m5 0l-5-5" : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"} />
            </svg>
            <span>{isExpanded ? "Collapse" : "Expand"}</span>
          </button>
        </div>
        {hint && (
          <p className="text-[10px] leading-snug text-slate-400 dark:text-slate-500">
            {hint}
          </p>
        )}
        <div className={`flex flex-wrap gap-2 overflow-y-auto pr-1 scrollbar-thin transition-all duration-300 ${isExpanded ? "max-h-none overflow-visible" : "max-h-40"}`}>
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
                  onClick={() => {
                    if (window.confirm(`Delete "${item}" from the database?`)) onRemove(item);
                  }}
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
          {addLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * Department manager — Developer & HR are built-in; users can add/remove
 * custom departments. Each department gets its own query list everywhere
 * Stream parameters renders groups.
 */
function DepartmentPanel({ departments, onAdd, onRemove }) {
  const [name, setName] = useState("");

  const tagClass =
    "inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-900 shadow-xs hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600";

  const submit = () => {
    const next = name.trim();
    if (!next) return;
    onAdd(next);
    setName("");
  };

  return (
    <div className="panel-muted flex flex-col justify-between space-y-3.5 p-4">
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
          Departments ({departments.length + 2})
        </h4>
        <p className="text-[10px] leading-snug text-slate-400 dark:text-slate-500">
          Developer &amp; HR are built-in. Add your own departments — each one
          gets its own query list in Stream parameters. Deleting a department
          reverts its queries to auto-classification.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className={tagClass}>Developer</span>
          <span className={tagClass}>HR</span>
          {departments.map((g) => (
            <span key={g} className={tagClass}>
              {groupLabel(g)}
              <button
                type="button"
                className="ml-0.5 cursor-pointer font-bold text-slate-400 transition hover:text-rose-600 dark:hover:text-rose-400"
                title={`Delete department "${groupLabel(g)}"`}
                onClick={() => onRemove(g)}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-200/30 pt-3 dark:border-slate-800">
        <input
          type="text"
          placeholder="e.g. Sales, Data, Marketing…"
          className="input-field flex-1 py-1.5 text-xs"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          type="button"
          className="btn-ghost cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold"
          onClick={submit}
        >
          + Add department
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
    try {
      await dispatch(thunk(value)).unwrap();
      await dispatch(fetchConfig());
    } catch {
      /* toast already shown by thunk */
    }
  };

  const runEdit = async (thunk, oldValue, newValue) => {
    try {
      await dispatch(thunk({ oldValue, newValue })).unwrap();
      await dispatch(fetchConfig());
    } catch {
      /* toast already shown by thunk */
    }
  };

  const runRemove = async (thunk, value) => {
    try {
      await dispatch(thunk(value)).unwrap();
      await dispatch(fetchConfig());
    } catch {
      /* toast already shown by thunk */
    }
  };

  const updatedLabel = config?.updated_at
    ? String(config.updated_at).slice(0, 19)
    : "—";
  const queryGroups = queryGroupsFromConfig(config);
  const customGroups = Array.isArray(config?.custom_query_groups)
    ? config.custom_query_groups
    : [];

  const handleAddDepartment = async (name) => {
    try {
      await dispatch(addQueryGroup(name)).unwrap();
      await dispatch(fetchConfig());
    } catch {
      /* toast already shown by thunk */
    }
  };

  const handleRemoveDepartment = async (groupKey) => {
    const ok = window.confirm(
      `Delete department "${groupLabel(groupKey)}"? Its queries will revert to auto-classification.`
    );
    if (!ok) return;
    try {
      await dispatch(removeQueryGroup(groupKey)).unwrap();
      await dispatch(fetchConfig());
    } catch {
      /* toast already shown by thunk */
    }
  };

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

        {Object.keys(queryGroups).map((groupKey) => {
          const label = groupLabel(groupKey);
          return (
            <ConfigListPanel
              key={groupKey}
              title={`${label} queries`}
              items={queryGroups[groupKey]}
              placeholder={`Add ${label} query…`}
              addLabel="+ Custom"
              hint={`Live scrape → ${label} queries. Click a chip to edit, ✕ to delete.`}
              onAdd={(v) => runAdd(addQuery, { query: v, group: groupKey })}
              onEdit={(oldV, newV) => runEdit(editQuery, oldV, newV)}
              onRemove={(v) => runRemove(removeQuery, v)}
            />
          );
        })}

        <DepartmentPanel
          departments={customGroups}
          onAdd={handleAddDepartment}
          onRemove={handleRemoveDepartment}
        />

        <ConfigListPanel
          title="Companies"
          items={config.top_companies}
          placeholder="Add company…"
          addLabel="+ Custom"
          hint="Live scrape company shortlist. Select/deselect there; add/edit/delete here."
          onAdd={(v) => runAdd(addCompany, v)}
          onEdit={(oldV, newV) => runEdit(editCompany, oldV, newV)}
          onRemove={(v) => runRemove(removeCompany, v)}
        />

        <ConfigListPanel
          title="Cities"
          items={config.cities}
          placeholder="Add city…"
          addLabel="+ Custom"
          hint="Shown under Stream parameters → Cities"
          onAdd={(v) => runAdd(addCity, v)}
          onEdit={(oldV, newV) => runEdit(editCity, oldV, newV)}
          onRemove={(v) => runRemove(removeCity, v)}
        />

        <ConfigListPanel
          title="Countries"
          items={config.countries}
          placeholder="Add country…"
          addLabel="+ Custom"
          hint="Shown under Stream parameters → Countries"
          onAdd={(v) => runAdd(addCountry, v)}
          onEdit={(oldV, newV) => runEdit(editCountry, oldV, newV)}
          onRemove={(v) => runRemove(removeCountry, v)}
        />
      </div>
    </div>
  );
}
