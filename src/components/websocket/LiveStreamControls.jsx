import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchConfig,
  addQuery,
  editQuery,
  removeQuery,
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
import { setBrowseCompanies, toggleBrowseCompany } from "../../store/slices/uiSlice";
import { notifyError, notifySuccess } from "../../store/notify";
import { groupLabel, queryGroupsFromConfig } from "../../utils/queryGroups";

function listHas(list, value) {
  const needle = String(value || "").trim().toLowerCase();
  if (!needle) return false;
  return (list || []).some((item) => String(item).toLowerCase() === needle);
}

function mergeUnique(base = [], extra = []) {
  const out = [];
  const seen = new Set();
  for (const item of [...base, ...extra]) {
    const value = String(item || "").trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

const JOBSPY_SOURCES = [
  ["linkedin", "LinkedIn"],
  ["indeed", "Indeed"],
  ["glassdoor", "Glassdoor"],
  ["zip_recruiter", "ZipRecruiter"],
  ["google", "Google Jobs"],
  ["bayt", "Bayt"],
  ["naukri", "Naukri"],
];

function MutateChip({
  value,
  selected,
  disabled,
  canEdit,
  canDelete,
  onToggle,
  onEdit,
  onRemove,
  tone = "select",
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const showActions = (canEdit || canDelete) && !disabled;
  const selectedBtn =
    tone === "exclude"
      ? "border-rose-600 bg-rose-600 text-white shadow-md"
      : "border-indigo-600 bg-indigo-600 text-white shadow-md";
  const selectedActions =
    tone === "exclude"
      ? "border-rose-600 bg-rose-700"
      : "border-indigo-600 bg-indigo-700";
  const selectedEditHover =
    tone === "exclude" ? "text-white/90 hover:bg-rose-800" : "text-white/90 hover:bg-indigo-800";

  if (editing && canEdit) {
    return (
      <span className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-slate-100 p-1 dark:border-indigo-900 dark:bg-slate-900">
        <input
          type="text"
          className="input-field w-28 px-1.5 py-0.5 text-xs"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const next = draft.trim();
              if (next) onEdit(value, next);
              setEditing(false);
            }
            if (e.key === "Escape") setEditing(false);
          }}
        />
        <button
          type="button"
          className="cursor-pointer text-[10px] font-bold text-emerald-600"
          onClick={() => {
            const next = draft.trim();
            if (next) onEdit(value, next);
            setEditing(false);
          }}
        >
          Save
        </button>
        <button
          type="button"
          className="cursor-pointer text-[10px] font-bold text-slate-400"
          onClick={() => setEditing(false)}
        >
          ✕
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggle(value)}
        className={`cursor-pointer rounded-xl border px-3 py-1 text-xs font-black transition-all duration-200 active:scale-95 ${
          showActions ? "rounded-r-none" : ""
        } ${
          selected
            ? selectedBtn
            : "border-slate-300 bg-white text-slate-900 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 shadow-2xs"
        }`}
      >
        {value}
      </button>
      {showActions && (
        <span
          className={`inline-flex overflow-hidden rounded-r-xl border border-l-0 ${
            selected ? selectedActions : "border-slate-300 dark:border-slate-700"
          }`}
        >
          {canEdit && (
            <button
              type="button"
              disabled={disabled}
              title="Edit"
              className={`cursor-pointer px-1.5 py-1 text-[10px] font-bold ${
                selected ? selectedEditHover : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
              onClick={() => {
                setDraft(value);
                setEditing(true);
              }}
            >
              ✎
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              disabled={disabled}
              title="Delete"
              className={`cursor-pointer px-1.5 py-1 text-[10px] font-bold ${
                selected ? "text-white/90 hover:bg-rose-600" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
              }`}
              onClick={() => onRemove(value)}
            >
              ✕
            </button>
          )}
        </span>
      )}
    </span>
  );
}

/**
 * Stream parameters are hydrated from MongoDB `config` (via Redux).
 * User can override selections in the UI; Start Live Stream sends the
 * effective parameters to the WebSocket/API.
 */
const BUILTIN_GROUP_LABEL_CLASSES = {
  developer: "text-indigo-700 dark:text-indigo-300",
  hr: "text-fuchsia-700 dark:text-fuchsia-300",
};
const CUSTOM_GROUP_LABEL_CLASSES = [
  "text-emerald-700 dark:text-emerald-300",
  "text-sky-700 dark:text-sky-300",
  "text-amber-700 dark:text-amber-300",
  "text-rose-700 dark:text-rose-300",
  "text-violet-700 dark:text-violet-300",
  "text-teal-700 dark:text-teal-300",
];

export default function LiveStreamControls({ activeSession, onStartStream, onStopStream, onToggleSidebar }) {
  const dispatch = useAppDispatch();
  const { config, loading: configLoading } = useAppSelector((s) => s.config);
  const browseCompanies = useAppSelector((s) => s.ui.browseCompanies);

  const searchQueries = useMemo(
    () => (Array.isArray(config?.search_queries) ? config.search_queries : []),
    [config?.search_queries]
  );
  const cities = useMemo(
    () => (Array.isArray(config?.cities) ? config.cities : []),
    [config?.cities]
  );
  const countries = useMemo(
    () => (Array.isArray(config?.countries) ? config.countries : []),
    [config?.countries]
  );
  const companies = useMemo(
    () => (Array.isArray(config?.top_companies) ? config.top_companies : []),
    [config?.top_companies]
  );
  const queryGroups = useMemo(() => queryGroupsFromConfig(config), [config]);
  const groupKeys = useMemo(() => Object.keys(queryGroups), [queryGroups]);

  const [selectedQueries, setSelectedQueries] = useState([]);
  const [customByGroup, setCustomByGroup] = useState({});
  const [showCustomByGroup, setShowCustomByGroup] = useState({});

  const [selectedCitiesList, setSelectedCitiesList] = useState([]);
  const [useCustomCity, setUseCustomCity] = useState(false);
  const [customCity, setCustomCity] = useState("");

  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedSites, setSelectedSites] = useState(["linkedin"]);
  const [companyOnly, setCompanyOnly] = useState("");
  const [showJobSources, setShowJobSources] = useState(false);
  const [showCompanyOnly, setShowCompanyOnly] = useState(false);
  const [useCustomCountry, setUseCustomCountry] = useState(false);
  const [customCountry, setCustomCountry] = useState("");

  const selectedCompanies = browseCompanies;
  const setSelectedCompanies = (updater) => {
    const next = typeof updater === "function" ? updater(browseCompanies) : updater;
    dispatch(setBrowseCompanies(Array.isArray(next) ? next : []));
  };
  const [useCustomCompany, setUseCustomCompany] = useState(false);
  const [customCompany, setCustomCompany] = useState("");
  const [extraQueries, setExtraQueries] = useState({});
  const allExtraQueries = useMemo(
    () => Object.values(extraQueries).flat(),
    [extraQueries]
  );
  const allQueriesVisible = useMemo(
    () => mergeUnique(searchQueries, allExtraQueries),
    [searchQueries, allExtraQueries]
  );
  const [extraCities, setExtraCities] = useState([]);
  const [extraCountries, setExtraCountries] = useState([]);
  const [extraCompanies, setExtraCompanies] = useState([]);

  const [minExp, setMinExp] = useState("");
  const [maxExp, setMaxExp] = useState("");

  const [target, setTarget] = useState("");
  const [resultsPer, setResultsPer] = useState("");
  const [hoursOld, setHoursOld] = useState("");
  const [largeSelectionConfirm, setLargeSelectionConfirm] = useState(null);

  const [expandQueries, setExpandQueries] = useState(false);
  const [expandCities, setExpandCities] = useState(false);
  const [expandCountries, setExpandCountries] = useState(false);
  const [expandCompanies, setExpandCompanies] = useState(false);

  const allExpanded = expandQueries && expandCities && expandCountries && expandCompanies;
  const toggleExpandAll = () => {
    const nextState = !allExpanded;
    setExpandQueries(nextState);
    setExpandCities(nextState);
    setExpandCountries(nextState);
    setExpandCompanies(nextState);
  };

  // Track whether form was hydrated from DB at least once
  const hydratedKeyRef = useRef("");
  const userTouchedRef = useRef(false);

  const applyConfigDefaults = (cfg, { force = false } = {}) => {
    if (!cfg) return;
    if (activeSession) return;
    if (userTouchedRef.current && !force) return;

    const qs = Array.isArray(cfg.search_queries) ? cfg.search_queries : [];
    const cs = Array.isArray(cfg.cities) ? cfg.cities : [];
    const cos = Array.isArray(cfg.countries) ? cfg.countries : [];

    // Default: empty selection (0 selected). User selects the queries they want to run.
    setSelectedQueries([]);
    setSelectedCitiesList([]);
    setSelectedCountries([]);
    setSelectedSites(["linkedin"]);
    setCompanyOnly("");
    void cs;
    void cos;

    setTarget(cfg.target != null ? String(cfg.target) : "20");
    setResultsPer(cfg.results_per != null ? String(cfg.results_per) : "10");
    setHoursOld(cfg.hours_old != null ? String(cfg.hours_old) : "6");

    // Optional experience fields if present in config
    if (cfg.min_exp != null && cfg.min_exp !== "") {
      setMinExp(String(cfg.min_exp));
    } else {
      setMinExp("");
    }
    if (cfg.max_exp != null && cfg.max_exp !== "") {
      setMaxExp(String(cfg.max_exp));
    } else {
      setMaxExp("");
    }

    setShowCustomByGroup({});
    setCustomByGroup({});
    setUseCustomCity(false);
    setCustomCity("");
    setUseCustomCountry(false);
    setCustomCountry("");
    setUseCustomCompany(false);
    setCustomCompany("");
    setExtraQueries({});
    setExtraCities([]);
    setExtraCountries([]);
    setExtraCompanies([]);
    userTouchedRef.current = false;
  };

  // Fresh config from API when panel mounts
  useEffect(() => {
    dispatch(fetchConfig());
  }, [dispatch]);

  // Full refresh whenever MongoDB config document changes (any CRUD save).
  // Stream parameters header (updated_at), lists, and performance fields all re-sync.
  useEffect(() => {
    if (configLoading || !config) return;
    if (activeSession) return;

    const key = [
      config.updated_at || "",
      (config.search_queries || []).join("|"),
      (config.cities || []).join("|"),
      (config.countries || []).join("|"),
      (config.top_companies || []).join("|"),
      config.target,
      config.results_per,
      config.hours_old,
      config.country,
      config.min_exp,
      config.max_exp,
    ].join("::");

    if (key === hydratedKeyRef.current) return;
    hydratedKeyRef.current = key;

    if (userTouchedRef.current) {
      const qset = new Set(searchQueries.map((q) => q.toLowerCase()));
      const cset = new Set(cities.map((c) => c.toLowerCase()));
      const oset = new Set(countries.map((c) => c.toLowerCase()));
      const pset = new Set(companies.map((c) => c.toLowerCase()));
      setExtraQueries((prev) => {
        const next = {};
        Object.entries(prev).forEach(([g, list]) => {
          next[g] = (list || []).filter((q) => !qset.has(q.toLowerCase()));
        });
        return next;
      });
      setExtraCities((prev) => prev.filter((c) => !cset.has(c.toLowerCase())));
      setExtraCountries((prev) => prev.filter((c) => !oset.has(c.toLowerCase())));
      setExtraCompanies((prev) => prev.filter((c) => !pset.has(c.toLowerCase())));
      return;
    }

    applyConfigDefaults(config, { force: true });
  }, [config, configLoading, activeSession, searchQueries, cities, countries, companies]);

  const markTouched = () => {
    userTouchedRef.current = true;
  };

  const toggleQuery = (q) => {
    if (activeSession) return;
    markTouched();
    setSelectedQueries((prev) =>
      prev.includes(q) ? prev.filter((item) => item !== q) : [...prev, q]
    );
  };

  const selectAllQueries = () => {
    if (activeSession) return;
    markTouched();
    const allQueries = mergeUnique(searchQueries, Object.values(extraQueries).flat());
    setSelectedQueries(
      selectedQueries.length === allQueries.length ? [] : allQueries
    );
  };

  const selectQueryGroup = (queries) => {
    if (activeSession || !queries.length) return;
    markTouched();
    setSelectedQueries((prev) => {
      const groupIsFullySelected = queries.every((query) => prev.includes(query));
      return groupIsFullySelected
        ? prev.filter((query) => !queries.includes(query))
        : [...new Set([...prev, ...queries])];
    });
  };

  const toggleCitySelection = (c) => {
    if (activeSession) return;
    markTouched();
    setSelectedCitiesList((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const selectAllCities = () => {
    if (activeSession) return;
    markTouched();
    const allCities = mergeUnique(cities, extraCities);
    setSelectedCitiesList(
      selectedCitiesList.length === allCities.length ? [] : allCities
    );
  };

  const toggleCountry = (co) => {
    if (activeSession) return;
    markTouched();
    setSelectedCountries((prev) =>
      prev.includes(co) ? prev.filter((item) => item !== co) : [...prev, co]
    );
  };

  const selectAllCountries = () => {
    if (activeSession) return;
    markTouched();
    const allCountries = mergeUnique(countries, extraCountries);
    setSelectedCountries(
      selectedCountries.length === allCountries.length ? [] : allCountries
    );
  };

  const toggleCompany = (company) => {
    markTouched();
    dispatch(toggleBrowseCompany(company));
  };

  const selectAllCompanies = () => {
    markTouched();
    const allCompanies = mergeUnique(companies, extraCompanies);
    const allSelected =
      allCompanies.length > 0 &&
      allCompanies.every((company) => listHas(selectedCompanies, company));
    dispatch(setBrowseCompanies(allSelected ? [] : allCompanies));
  };

  const renameIn = (setter, oldValue, newValue) => {
    setter((prev) =>
      prev.map((item) => (item === oldValue ? newValue : item)).filter((item, idx, arr) => arr.indexOf(item) === idx)
    );
  };

  const persistEdit = async (thunk, oldValue, newValue, selectedSetter, renameExtra) => {
    const next = String(newValue || "").trim();
    if (!next || next === oldValue) return;
    markTouched();
    if (selectedSetter) renameIn(selectedSetter, oldValue, next);
    renameExtra?.(oldValue, next);
    try {
      await dispatch(thunk({ oldValue, newValue: next })).unwrap();
      await dispatch(fetchConfig());
    } catch {
      notifyError(dispatch, `Could not update "${oldValue}".`);
    }
  };

  const persistRemove = async ({ thunk, value, selectedSetter, removeExtra, inDatabase }) => {
    const label = String(value || "").trim();
    if (!label || activeSession) return;
    const ok = window.confirm(
      inDatabase
        ? `Delete "${label}" from the database?`
        : `Remove "${label}" from this list?`
    );
    if (!ok) return;
    markTouched();
    if (selectedSetter) {
      selectedSetter((prev) => prev.filter((item) => item.toLowerCase() !== label.toLowerCase()));
    }
    removeExtra?.(label);
    if (inDatabase) {
      try {
        await dispatch(thunk(label)).unwrap();
        await dispatch(fetchConfig());
      } catch {
        notifyError(dispatch, `Could not delete "${label}".`);
      }
    } else {
      notifySuccess(dispatch, `"${label}" removed.`);
    }
  };

  const persistAdd = async ({
    thunk,
    value,
    selectedSetter,
    addExtra,
    payload,
    existing,
    kind,
  }) => {
    const next = String(value || "").trim();
    if (!next) {
      notifyError(dispatch, `Enter a ${kind} first.`);
      return false;
    }
    if (listHas(existing, next)) {
      notifyError(dispatch, `"${next}" is already in the list.`);
      return false;
    }
    markTouched();
    addExtra?.(next);
    if (selectedSetter) {
      selectedSetter((prev) => (listHas(prev, next) ? prev : [...prev, next]));
    }
    try {
      await dispatch(payload ? thunk(payload(next)) : thunk(next)).unwrap();
      await dispatch(fetchConfig());
    } catch {
      // thunk already toasted the API error; keep the chip for this scrape
    }
    return true;
  };

  const handleResetToConfig = () => {
    if (activeSession) return;
    userTouchedRef.current = false;
    applyConfigDefaults(config, { force: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const queriesList = [...selectedQueries];
    groupKeys.forEach((group) => {
      const extra = (customByGroup[group] || "").trim();
      if (showCustomByGroup[group] && extra && !queriesList.includes(extra)) {
        queriesList.push(extra);
      }
    });

    const citiesList = [...selectedCitiesList];
    if (useCustomCity && customCity.trim()) {
      citiesList.push(customCity.trim());
    }

    const countriesList = [...selectedCountries];
    if (useCustomCountry && customCountry.trim()) {
      countriesList.push(customCountry.trim());
    }

    const finalQueries = queriesList;
    const finalCities = citiesList;
    const finalCountries = countriesList;
    const finalSites = selectedSites;

    if (finalSites.length === 0) {
      notifyError(dispatch, "Select at least one job source.");
      return;
    }

    if (finalQueries.length === 0) {
      notifyError(
        dispatch,
        "Select at least one search query (city and country are optional — leave empty for global search)."
      );
      return;
    }

    // Strict parameter caps — integers ≥ 1 with hard ceilings (match backend)
    const clampInt = (raw, fallback, min, max) => {
      const n = parseInt(raw, 10);
      if (!Number.isFinite(n)) return fallback;
      return Math.min(max, Math.max(min, n));
    };
    const strictTarget = clampInt(
      target,
      Math.max(1, Number(config?.target) || 20),
      1,
      Number.MAX_SAFE_INTEGER
    );
    const strictResultsPer = clampInt(
      resultsPer,
      Math.max(1, Number(config?.results_per) || 10),
      1,
      50
    );
    const strictHoursOld = clampInt(
      hoursOld,
      Math.max(1, Number(config?.hours_old) || 6),
      1,
      168
    );

    const locationSlots = Math.max(
      1,
      finalCities.length || finalCountries.length || 1
    );
    const comboCount = Math.max(1, finalQueries.length * locationSlots);
    const geoLabel =
      finalCities.length && finalCountries.length
        ? `cities [${finalCities.join(", ")}] + countries [${finalCountries.join(", ")}]`
        : finalCities.length
          ? `cities [${finalCities.join(", ")}]`
          : finalCountries.length
            ? `countries [${finalCountries.join(", ")}]`
            : "GLOBAL (no city/country filter)";

    let strictMinExp = null;
    let strictMaxExp = null;
    if (minExp !== "") {
      const me = parseInt(minExp, 10);
      if (Number.isFinite(me) && me >= 0) strictMinExp = me;
    }
    if (maxExp !== "") {
      const xe = parseInt(maxExp, 10);
      if (Number.isFinite(xe) && xe >= 0) strictMaxExp = xe;
    }
    if (
      strictMinExp != null &&
      strictMaxExp != null &&
      strictMinExp > strictMaxExp
    ) {
      notifyError(dispatch, "Min experience cannot be greater than max experience.");
      return;
    }

    const streamParams = {
      search: finalQueries.join(","),
      // Empty string = global (backend must not substitute Hyderabad/India)
      city: finalCities.join(","),
      countries: finalCountries.join(","),
      companies: companyOnly.trim(),
      exclude_companies: selectedCompanies.join(","),
      sites: finalSites,
      category: "all",
      target: strictTarget,
      results_per: strictResultsPer,
      hours_old: strictHoursOld,
      min_exp: strictMinExp,
      max_exp: strictMaxExp,
      collection_name: "live_stream",
      from_config: !userTouchedRef.current,
      config_country: config?.country || null,
      strict_caps: true,
      combo_count: comboCount,
      geo_label: geoLabel,
    };

    if (comboCount > 30) {
      setLargeSelectionConfirm({
        comboCount,
        queriesCount: finalQueries.length,
        locationSlots,
        geoLabel,
        strictTarget,
        strictResultsPer,
        strictHoursOld,
        params: streamParams,
      });
      return;
    }

    onStartStream(streamParams);
  };

  const sectionLabel =
    "text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300";
  const wrapperTagsClass =
    "flex flex-wrap gap-1.5 max-h-36 overflow-y-auto rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-950/80 scrollbar-thin";

  const configReady =
    !configLoading &&
    (searchQueries.length > 0 || cities.length > 0 || countries.length > 0 || companies.length > 0);

  return (
    <div className="live-controls-panel panel relative overflow-x-auto p-5 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin">
      {onToggleSidebar && (
        <button
          type="button"
          onClick={onToggleSidebar}
          className="absolute right-3 top-3 hidden h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-100 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-300 lg:flex cursor-pointer active:scale-95 group"
          title="Hide Stream Parameters Sidebar"
          aria-label="Hide Stream Parameters Sidebar"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
          </svg>
        </button>
      )}
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="pr-9">
          <h3 className="section-card-title mb-0">Stream parameters</h3>
          <p className="mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Defaults from MongoDB{" "}
            <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
              config
            </span>
            {config?.updated_at
              ? ` · updated ${String(config.updated_at).slice(0, 19)}`
              : ""}
            {` · ${searchQueries.length} queries · ${cities.length} cities · ${countries.length} countries · ${companies.length} companies`}
            {config?.target != null ? ` · target ${config.target}` : ""}
            {config?.results_per != null ? ` · hits/q ${config.results_per}` : ""}
            {config?.hours_old != null ? ` · hours ${config.hours_old}` : ""}
            . Edit via Scraper Configuration; this panel auto-refreshes on every DB save.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {configLoading && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400">
              Loading config…
            </span>
          )}
          {configReady && !configLoading && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400">
              DB config loaded
            </span>
          )}
          <button
            type="button"
            className="btn-ghost rounded-lg px-2 py-1 text-[10px] font-bold cursor-pointer"
            disabled={activeSession || configLoading || !config}
            onClick={() => dispatch(fetchConfig())}
            title="Re-fetch config from API / MongoDB"
          >
            Refresh
          </button>
          <button
            type="button"
            className="btn-ghost rounded-lg px-2 py-1 text-[10px] font-bold cursor-pointer"
            disabled={activeSession || !config}
            onClick={handleResetToConfig}
            title="Reset form to MongoDB config defaults"
          >
            Reset
          </button>
          <button
            type="button"
            className="btn-ghost rounded-lg px-2 py-1 text-[10px] font-bold cursor-pointer flex items-center gap-1 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 bg-indigo-50/40 dark:bg-indigo-950/30"
            onClick={toggleExpandAll}
            title="Expand or collapse all chip lists"
          >
            <svg className="h-3 w-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={allExpanded ? "M9 9L4 4m0 0h5m-5 0v5m11 0V4m0 0h-5m5 0l-5 5M9 15l-5 5m0 0h5m-5 0v-5m11 5v-5m0 5h-5m5 0l-5-5" : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"} />
            </svg>
            {allExpanded ? "Collapse All" : "Expand All"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search queries pills */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className={sectionLabel}>
              Queries{" "}
              <span className="font-normal normal-case text-slate-400">
                ({selectedQueries.length}/{searchQueries.length} from DB)
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpandQueries(!expandQueries)}
                className="flex items-center gap-1 rounded-md border border-slate-200/80 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
                title={expandQueries ? "Collapse query list" : "Expand query list to show all options"}
              >
                <svg className="h-3 w-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={expandQueries ? "M9 9L4 4m0 0h5m-5 0v5m11 0V4m0 0h-5m5 0l-5 5M9 15l-5 5m0 0h5m-5 0v-5m11 5v-5m0 5h-5m5 0l-5-5" : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"} />
                </svg>
                <span>{expandQueries ? "Collapse" : "Expand"}</span>
              </button>
              <button
                type="button"
                className="cursor-pointer text-[10px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                onClick={selectAllQueries}
                disabled={activeSession || !allQueriesVisible.length}
              >
                {selectedQueries.length === allQueriesVisible.length && allQueriesVisible.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
          </div>
          <div className={`${wrapperTagsClass} ${expandQueries ? "max-h-none overflow-visible border-indigo-500/30 bg-indigo-50/10 dark:bg-indigo-950/10" : ""}`}>
            {configLoading && !searchQueries.length && (
              <span className="px-2 py-1 text-xs text-slate-400">
                Fetching queries from config…
              </span>
            )}
            {!configLoading && !searchQueries.length && (
              <span className="px-2 py-1 text-xs text-amber-600 dark:text-amber-400">
                No queries in DB config — add via Scraper Configuration.
              </span>
            )}
            <div className="grid w-full grid-cols-1 gap-3 xl:grid-cols-2">
              {groupKeys.map((groupKey) => {
                const label = groupLabel(groupKey);
                const queries = queryGroups[groupKey] || [];
                const isCustomGroup = !BUILTIN_GROUP_LABEL_CLASSES[groupKey];
                const customIdx = isCustomGroup
                  ? groupKeys.filter((k) => !BUILTIN_GROUP_LABEL_CLASSES[k]).indexOf(groupKey)
                  : 0;
                const labelClass =
                  BUILTIN_GROUP_LABEL_CLASSES[groupKey] ||
                  CUSTOM_GROUP_LABEL_CLASSES[customIdx % CUSTOM_GROUP_LABEL_CLASSES.length];
                const placeholder = `e.g. ${label} query`;
                const visibleQueries = mergeUnique(queries, extraQueries[groupKey] || []);
                const selectedCount = visibleQueries.filter((query) => selectedQueries.includes(query)).length;
                const groupSelected = visibleQueries.length > 0 && selectedCount === visibleQueries.length;
                const showCustom = showCustomByGroup[groupKey];
                const addCustomQuery = async () => {
                  const added = await persistAdd({
                    thunk: addQuery,
                    value: customByGroup[groupKey],
                    selectedSetter: setSelectedQueries,
                    addExtra: (next) =>
                      setExtraQueries((prev) => {
                        const list = prev[groupKey] || [];
                        return {
                          ...prev,
                          [groupKey]: listHas(list, next) ? list : [...list, next],
                        };
                      }),
                    payload: (next) => ({ query: next, group: groupKey }),
                    existing: allQueriesVisible,
                    kind: "query",
                  });
                  if (added) setCustomByGroup((prev) => ({ ...prev, [groupKey]: "" }));
                };
                return (
                  <div key={groupKey} className="rounded-lg border border-slate-200 bg-white/70 p-2 dark:border-slate-700 dark:bg-slate-900/50">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${labelClass}`}>
                        {label} ({selectedCount}/{visibleQueries.length})
                      </span>
                      <button
                        type="button"
                        disabled={activeSession || !visibleQueries.length}
                        onClick={() => selectQueryGroup(visibleQueries)}
                        className="cursor-pointer text-[10px] font-bold text-slate-500 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-indigo-300"
                      >
                        {groupSelected ? "Clear" : "Select all"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {visibleQueries.map((q) => (
                        <MutateChip
                          key={q}
                          value={q}
                          selected={selectedQueries.includes(q)}
                          disabled={activeSession}
                          canEdit={!activeSession}
                          canDelete={!activeSession}
                          onToggle={toggleQuery}
                          onEdit={(oldV, newV) =>
                            persistEdit(editQuery, oldV, newV, setSelectedQueries, (oldValue, next) => {
                              setExtraQueries((prev) => ({
                                ...prev,
                                [groupKey]: (prev[groupKey] || []).map((item) => (item === oldValue ? next : item)),
                              }));
                            })
                          }
                          onRemove={(v) =>
                            persistRemove({
                              thunk: removeQuery,
                              value: v,
                              selectedSetter: setSelectedQueries,
                              inDatabase: listHas(searchQueries, v),
                              removeExtra: (removed) =>
                                setExtraQueries((prev) => {
                                  const next = {};
                                  Object.entries(prev).forEach(([g, list]) => {
                                    next[g] = (list || []).filter(
                                      (item) => item.toLowerCase() !== removed.toLowerCase()
                                    );
                                  });
                                  return next;
                                }),
                            })
                          }
                        />
                      ))}
                      <button
                        type="button"
                        disabled={activeSession}
                        onClick={() => {
                          markTouched();
                          setShowCustomByGroup((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
                        }}
                        className={`cursor-pointer rounded-xl border px-2.5 py-1 text-xs font-bold transition-all duration-200 active:scale-95 ${
                          showCustom
                            ? "border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-500 shadow-sm"
                            : "border-dashed border-slate-300 bg-white/40 text-slate-500 hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-400"
                        }`}
                      >
                        + Custom
                      </button>
                    </div>
                    {showCustom && (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          placeholder={placeholder}
                          className="input-field flex-1 py-1.5 text-xs"
                          value={customByGroup[groupKey]}
                          onChange={(e) => {
                            markTouched();
                            setCustomByGroup((prev) => ({ ...prev, [groupKey]: e.target.value }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              e.stopPropagation();
                              addCustomQuery();
                            }
                          }}
                          disabled={activeSession}
                        />
                        <button
                          type="button"
                          className="btn-ghost cursor-pointer rounded-lg px-2 py-1 text-[10px] font-bold"
                          disabled={activeSession || !String(customByGroup[groupKey] || "").trim()}
                          onClick={addCustomQuery}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cities pills */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className={sectionLabel}>
              Cities{" "}
              <span className="font-normal normal-case text-slate-400">
                optional · empty = global · ({selectedCitiesList.length}/{mergeUnique(cities, extraCities).length})
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpandCities(!expandCities)}
                className="flex items-center gap-1 rounded-md border border-slate-200/80 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
                title={expandCities ? "Collapse city list" : "Expand city list to show all options"}
              >
                <svg className="h-3 w-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={expandCities ? "M9 9L4 4m0 0h5m-5 0v5m11 0V4m0 0h-5m5 0l-5 5M9 15l-5 5m0 0h5m-5 0v-5m11 5v-5m0 5h-5m5 0l-5-5" : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"} />
                </svg>
                <span>{expandCities ? "Collapse" : "Expand"}</span>
              </button>
              <button
                type="button"
                className="cursor-pointer text-[10px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                onClick={selectAllCities}
                disabled={activeSession || !mergeUnique(cities, extraCities).length}
              >
                {selectedCitiesList.length === mergeUnique(cities, extraCities).length && mergeUnique(cities, extraCities).length > 0
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
          </div>
          <div className={`${wrapperTagsClass} ${expandCities ? "max-h-none overflow-visible border-indigo-500/30 bg-indigo-50/10 dark:bg-indigo-950/10" : ""}`}>
            {configLoading && !cities.length && (
              <span className="px-2 py-1 text-xs text-slate-400">
                Fetching cities from config…
              </span>
            )}
            {!configLoading && !cities.length && (
              <span className="px-2 py-1 text-xs text-amber-600 dark:text-amber-400">
                No cities in DB config — add via Scraper Configuration.
              </span>
            )}
            {mergeUnique(cities, extraCities).map((c) => (
              <MutateChip
                key={c}
                value={c}
                selected={selectedCitiesList.includes(c)}
                disabled={activeSession}
                canEdit={!activeSession}
                canDelete={!activeSession}
                onToggle={toggleCitySelection}
                onEdit={(oldV, newV) =>
                  persistEdit(editCity, oldV, newV, setSelectedCitiesList, (oldValue, next) => {
                    setExtraCities((prev) => prev.map((item) => (item === oldValue ? next : item)));
                  })
                }
                onRemove={(v) =>
                  persistRemove({
                    thunk: removeCity,
                    value: v,
                    selectedSetter: setSelectedCitiesList,
                    inDatabase: listHas(cities, v),
                    removeExtra: (label) =>
                      setExtraCities((prev) => prev.filter((item) => item.toLowerCase() !== label.toLowerCase())),
                  })
                }
              />
            ))}
            <button
              type="button"
              disabled={activeSession}
              onClick={() => {
                markTouched();
                setUseCustomCity(!useCustomCity);
              }}
              className={`cursor-pointer rounded-xl border px-2.5 py-1 text-xs font-bold transition-all duration-200 active:scale-95 ${
                useCustomCity
                  ? "border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-500 shadow-sm"
                  : "border-dashed border-slate-300 bg-white/40 text-slate-500 hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-400"
              }`}
            >
              + Custom
            </button>
          </div>
          {useCustomCity && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="e.g. Bangalore"
                className="input-field flex-1"
                value={customCity}
                onChange={(e) => {
                  markTouched();
                  setCustomCity(e.target.value);
                }}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    const added = await persistAdd({
                      thunk: addCity,
                      value: customCity,
                      selectedSetter: setSelectedCitiesList,
                      addExtra: (next) =>
                        setExtraCities((prev) => (listHas(prev, next) ? prev : [...prev, next])),
                      existing: mergeUnique(cities, extraCities),
                      kind: "city",
                    });
                    if (added) setCustomCity("");
                  }
                }}
                disabled={activeSession}
              />
              <button
                type="button"
                className="btn-ghost cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold"
                disabled={activeSession || !customCity.trim()}
                onClick={async () => {
                  const added = await persistAdd({
                    thunk: addCity,
                    value: customCity,
                    selectedSetter: setSelectedCitiesList,
                    addExtra: (next) =>
                      setExtraCities((prev) => (listHas(prev, next) ? prev : [...prev, next])),
                    existing: mergeUnique(cities, extraCities),
                    kind: "city",
                  });
                  if (added) setCustomCity("");
                }}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Countries pills */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className={sectionLabel}>
              Countries{" "}
              <span className="font-normal normal-case text-slate-400">
                optional · empty = global · ({selectedCountries.length}/{mergeUnique(countries, extraCountries).length})
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpandCountries(!expandCountries)}
                className="flex items-center gap-1 rounded-md border border-slate-200/80 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
                title={expandCountries ? "Collapse country list" : "Expand country list to show all options"}
              >
                <svg className="h-3 w-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={expandCountries ? "M9 9L4 4m0 0h5m-5 0v5m11 0V4m0 0h-5m5 0l-5 5M9 15l-5 5m0 0h5m-5 0v-5m11 5v-5m0 5h-5m5 0l-5-5" : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"} />
                </svg>
                <span>{expandCountries ? "Collapse" : "Expand"}</span>
              </button>
              <button
                type="button"
                className="cursor-pointer text-[10px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                onClick={selectAllCountries}
                disabled={activeSession || !mergeUnique(countries, extraCountries).length}
              >
                {selectedCountries.length === mergeUnique(countries, extraCountries).length &&
                mergeUnique(countries, extraCountries).length > 0
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
          </div>
          <div className={`${wrapperTagsClass} ${expandCountries ? "max-h-none overflow-visible border-indigo-500/30 bg-indigo-50/10 dark:bg-indigo-950/10" : ""}`}>
            {configLoading && !countries.length && (
              <span className="px-2 py-1 text-xs text-slate-400">
                Fetching countries from config…
              </span>
            )}
            {!configLoading && !countries.length && (
              <span className="px-2 py-1 text-xs text-amber-600 dark:text-amber-400">
                No countries in DB config — add via Scraper Configuration.
              </span>
            )}
            {mergeUnique(countries, extraCountries).map((co) => (
              <MutateChip
                key={co}
                value={co}
                selected={selectedCountries.includes(co)}
                disabled={activeSession}
                canEdit={!activeSession}
                canDelete={!activeSession}
                onToggle={toggleCountry}
                onEdit={(oldV, newV) =>
                  persistEdit(editCountry, oldV, newV, setSelectedCountries, (oldValue, next) => {
                    setExtraCountries((prev) => prev.map((item) => (item === oldValue ? next : item)));
                  })
                }
                onRemove={(v) =>
                  persistRemove({
                    thunk: removeCountry,
                    value: v,
                    selectedSetter: setSelectedCountries,
                    inDatabase: listHas(countries, v),
                    removeExtra: (label) =>
                      setExtraCountries((prev) => prev.filter((item) => item.toLowerCase() !== label.toLowerCase())),
                  })
                }
              />
            ))}
            <button
              type="button"
              disabled={activeSession}
              onClick={() => {
                markTouched();
                setUseCustomCountry(!useCustomCountry);
              }}
              className={`cursor-pointer rounded-xl border px-2.5 py-1 text-xs font-bold transition-all duration-200 active:scale-95 ${
                useCustomCountry
                  ? "border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-500 shadow-sm"
                  : "border-dashed border-slate-300 bg-white/40 text-slate-500 hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-400"
              }`}
            >
              + Custom
            </button>
          </div>
          {useCustomCountry && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="e.g. United States"
                className="input-field flex-1"
                value={customCountry}
                onChange={(e) => {
                  markTouched();
                  setCustomCountry(e.target.value);
                }}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    const added = await persistAdd({
                      thunk: addCountry,
                      value: customCountry,
                      selectedSetter: setSelectedCountries,
                      addExtra: (next) =>
                        setExtraCountries((prev) => (listHas(prev, next) ? prev : [...prev, next])),
                      existing: mergeUnique(countries, extraCountries),
                      kind: "country",
                    });
                    if (added) setCustomCountry("");
                  }
                }}
                disabled={activeSession}
              />
              <button
                type="button"
                className="btn-ghost cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold"
                disabled={activeSession || !customCountry.trim()}
                onClick={async () => {
                  const added = await persistAdd({
                    thunk: addCountry,
                    value: customCountry,
                    selectedSetter: setSelectedCountries,
                    addExtra: (next) =>
                      setExtraCountries((prev) => (listHas(prev, next) ? prev : [...prev, next])),
                    existing: mergeUnique(countries, extraCountries),
                    kind: "country",
                  });
                  if (added) setCustomCountry("");
                }}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* JobSpy sources */}
        <div className="rounded-xl border border-indigo-200/70 bg-indigo-50/50 p-2.5 dark:border-indigo-900/60 dark:bg-indigo-950/20">
          <div className="flex items-center justify-between gap-2">
            <button type="button" className="flex items-center gap-1.5 text-left" onClick={() => setShowJobSources((value) => !value)} aria-expanded={showJobSources}>
              <span className={sectionLabel}>Job sources</span>
              <span className="rounded-md border border-indigo-300/70 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 dark:border-indigo-700 dark:text-indigo-300">{showJobSources ? "Hide" : "Show"}</span>
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-md border border-indigo-300/70 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950"
              disabled={activeSession}
              onClick={() => {
                markTouched();
                setSelectedSites(JOBSPY_SOURCES.map(([value]) => value));
              }}
            >
              Select all
            </button>
          </div>
          {showJobSources && <div className="mt-2 flex flex-wrap gap-1.5">
            {JOBSPY_SOURCES.map(([value, label]) => {
              const selected = selectedSites.includes(value);
              return (
                <label key={value} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-bold transition-colors ${selected ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selected}
                    disabled={activeSession}
                    onChange={() => {
                      markTouched();
                      setSelectedSites((prev) => prev.includes(value) ? prev.filter((site) => site !== value) : [...prev, value]);
                    }}
                  />
                  {selected ? "✓" : "○"} {label}
                </label>
              );
            })}
          </div>}
          <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">{selectedSites.length ? `${selectedSites.length} source${selectedSites.length === 1 ? "" : "s"} selected` : "No source selected"}. LinkedIn is selected by default.</p>
        </div>

        {/* Company-only target */}
        <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-2.5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between gap-2">
            <button type="button" className="flex items-center gap-1.5 text-left" onClick={() => setShowCompanyOnly((value) => !value)} aria-expanded={showCompanyOnly}>
              <span className={sectionLabel}>Company only</span>
              <span className="rounded-md border border-emerald-300/70 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:border-emerald-700 dark:text-emerald-300">{showCompanyOnly ? "Hide" : "Show"}</span>
            </button>
            <button type="button" className="cursor-pointer rounded-md border border-emerald-300/70 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950" disabled={activeSession || !companyOnly} onClick={() => { markTouched(); setCompanyOnly(""); }}>Deselect</button>
          </div>
          {showCompanyOnly && <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <select
              id="live-company-only"
              className="input-field text-xs"
              value={companyOnly}
              disabled={activeSession}
              onChange={(e) => { markTouched(); setCompanyOnly(e.target.value); }}
            >
              <option value="">All companies</option>
              {mergeUnique(companies, extraCompanies).map((company) => <option key={company} value={company}>{company}</option>)}
            </select>
            <input
              className="input-field text-xs"
              value={companyOnly && !mergeUnique(companies, extraCompanies).some((item) => item.toLowerCase() === companyOnly.toLowerCase()) ? companyOnly : ""}
              disabled={activeSession}
              placeholder="Or type a company name"
              onChange={(e) => { markTouched(); setCompanyOnly(e.target.value); }}
            />
          </div>}
          <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">{companyOnly ? `Selected: ${companyOnly}` : "All companies"}. Only matching employer names will be streamed.</p>
        </div>

        {/* Companies pills */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className={sectionLabel}>
              Companies{" "}
              <span className="font-normal normal-case text-slate-400">
                red = exclude · white = included with all others · ({selectedCompanies.length} excluded)
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpandCompanies(!expandCompanies)}
                className="flex items-center gap-1 rounded-md border border-slate-200/80 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
                title={expandCompanies ? "Collapse company list" : "Expand company list"}
              >
                <svg className="h-3 w-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={expandCompanies ? "M9 9L4 4m0 0h5m-5 0v5m11 0V4m0 0h-5m5 0l-5 5M9 15l-5 5m0 0h5m-5 0v-5m11 5v-5m0 5h-5m5 0l-5-5" : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"} />
                </svg>
                <span>{expandCompanies ? "Collapse" : "Expand"}</span>
              </button>
              <button
                type="button"
                className="cursor-pointer text-[10px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                onClick={selectAllCompanies}
                disabled={activeSession || !mergeUnique(companies, extraCompanies).length}
              >
                {selectedCompanies.length === mergeUnique(companies, extraCompanies).length && mergeUnique(companies, extraCompanies).length > 0
                  ? "Include All"
                  : "Exclude All"}
              </button>
            </div>
          </div>
          <div className={`${wrapperTagsClass} ${expandCompanies ? "max-h-none overflow-visible border-indigo-500/30 bg-indigo-50/10 dark:bg-indigo-950/10" : ""}`}>
            {configLoading && !companies.length && (
              <span className="px-2 py-1 text-xs text-slate-400">
                Fetching companies from config…
              </span>
            )}
            {!configLoading && !companies.length && (
              <span className="px-2 py-1 text-xs text-amber-600 dark:text-amber-400">
                No companies in DB config — add via + Custom or Scraper Configuration.
              </span>
            )}
            {mergeUnique(companies, extraCompanies).map((company) => (
              <MutateChip
                key={company}
                value={company}
                selected={listHas(selectedCompanies, company)}
                disabled={activeSession}
                canEdit={!activeSession}
                canDelete={!activeSession}
                tone="exclude"
                onToggle={toggleCompany}
                onEdit={(oldV, newV) =>
                  persistEdit(editCompany, oldV, newV, setSelectedCompanies, (oldValue, next) => {
                    setExtraCompanies((prev) => prev.map((item) => (item === oldValue ? next : item)));
                  })
                }
                onRemove={(v) =>
                  persistRemove({
                    thunk: removeCompany,
                    value: v,
                    selectedSetter: setSelectedCompanies,
                    inDatabase: listHas(companies, v),
                    removeExtra: (label) =>
                      setExtraCompanies((prev) => prev.filter((item) => item.toLowerCase() !== label.toLowerCase())),
                  })
                }
              />
            ))}
            <button
              type="button"
              disabled={activeSession}
              onClick={() => {
                markTouched();
                setUseCustomCompany(!useCustomCompany);
              }}
              className={`cursor-pointer rounded-xl border px-2.5 py-1 text-xs font-bold transition-all duration-200 active:scale-95 ${
                useCustomCompany
                  ? "border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-500 shadow-sm"
                  : "border-dashed border-slate-300 bg-white/40 text-slate-500 hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-400"
              }`}
            >
              + Custom
            </button>
          </div>
          {useCustomCompany && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="e.g. Zoho"
                className="input-field flex-1"
                value={customCompany}
                onChange={(e) => {
                  markTouched();
                  setCustomCompany(e.target.value);
                }}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    const added = await persistAdd({
                      thunk: addCompany,
                      value: customCompany,
                      addExtra: (next) =>
                        setExtraCompanies((prev) => (listHas(prev, next) ? prev : [...prev, next])),
                      existing: mergeUnique(companies, extraCompanies),
                      kind: "company",
                    });
                    if (added) setCustomCompany("");
                  }
                }}
                disabled={activeSession}
              />
              <button
                type="button"
                className="btn-ghost cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold"
                disabled={activeSession || !customCompany.trim()}
                onClick={async () => {
                  const added = await persistAdd({
                    thunk: addCompany,
                    value: customCompany,
                    addExtra: (next) =>
                      setExtraCompanies((prev) => (listHas(prev, next) ? prev : [...prev, next])),
                    existing: mergeUnique(companies, extraCompanies),
                    kind: "company",
                  });
                  if (added) setCustomCompany("");
                }}
              >
                Add
              </button>
            </div>
          )}
          <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
            Red (selected) companies are excluded from live scrape and browsing. White companies stay unrestricted and are included with every other employer. Empty red list = no company restriction.
          </p>
        </div>

        {/* Experience filters — hydrated from config.min_exp / config.max_exp */}
        <div>
          <span className={`mb-2 block ${sectionLabel}`}>
            Experience range (years)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="Min"
                className="input-field px-3 text-xs"
                value={minExp}
                onChange={(e) => {
                  markTouched();
                  setMinExp(e.target.value);
                }}
                disabled={activeSession}
              />
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="Max"
                className="input-field px-3 text-xs"
                value={maxExp}
                onChange={(e) => {
                  markTouched();
                  setMaxExp(e.target.value);
                }}
                disabled={activeSession}
              />
            </div>
          </div>
        </div>

        {/* Performance parameters from config */}
        <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-900">
          <span className={`block ${sectionLabel}`}>
            Performance parameters{" "}
            <span className="font-normal normal-case text-slate-400">
              strict caps — search stops at Target / attempt limit
            </span>
          </span>
          <p className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              {selectedQueries.length || 0} queries × {selectedCitiesList.length || 0}{" "}
              cities
            </span>{" "}
            = search combos. City & country optional (none selected → global).{" "}
            <span className="font-semibold text-indigo-600/80 dark:text-indigo-400/90">
              Target
            </span>{" "}
            is the hard job limit; Hits/Query auto-scales to fill it.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label
                htmlFor="ws-target"
                className="mb-1 block text-[10px] font-semibold text-slate-400 dark:text-slate-500"
                title="Hard stop — stream ends after this many unique saved jobs"
              >
                Target Cap
              </label>
              <input
                id="ws-target"
                type="number"
                min="1"
                step="1"
                className="input-field px-2 py-2 text-center text-xs font-bold"
                value={target}
                onChange={(e) => {
                  markTouched();
                  setTarget(e.target.value);
                }}
                disabled={activeSession}
                required
              />
            </div>
            <div>
              <label
                htmlFor="ws-results"
                className="mb-1 block text-[10px] font-semibold text-slate-400 dark:text-slate-500"
                title="Preferred batch size per query×city. Auto-scaled up to fill Target when few combos remain."
              >
                Hits/Query
              </label>
              <input
                id="ws-results"
                type="number"
                min="1"
                max="50"
                step="1"
                className="input-field px-2 py-2 text-center text-xs font-bold"
                value={resultsPer}
                onChange={(e) => {
                  markTouched();
                  setResultsPer(e.target.value);
                }}
                disabled={activeSession}
                required
              />
            </div>
            <div>
              <label
                htmlFor="ws-hours"
                className="mb-1 block text-[10px] font-semibold text-slate-400 dark:text-slate-500"
                title="Strict — no auto-expand; older posts dropped after scrape"
              >
                Hours Old
              </label>
              <input
                id="ws-hours"
                type="number"
                min="1"
                max="168"
                step="1"
                className="input-field px-2 py-2 text-center text-xs font-bold"
                value={hoursOld}
                onChange={(e) => {
                  markTouched();
                  setHoursOld(e.target.value);
                }}
                disabled={activeSession}
                required
              />
            </div>
          </div>
        </div>

        <div className="live-stream-actions flex items-center gap-2">
        <button
          type="submit"
          className="btn-primary live-stream-action flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-center text-[11px] font-bold"
          disabled={activeSession || configLoading}
        >
          {activeSession ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Streaming Jobs Live…
            </>
          ) : configLoading ? (
            <>Loading config from database…</>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z"
                />
              </svg>
              Start Live Stream
            </>
          )}
        </button>
        {activeSession && onStopStream && (
          <button
            type="button"
            onClick={onStopStream}
            className="live-stream-action flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2 py-1.5 text-center text-[11px] font-bold text-rose-700 transition-colors hover:bg-rose-100 active:scale-[.99] dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70"
          >
            <span className="h-2 w-2 rounded-sm bg-current" />
            Stop Streaming
          </button>
        )}
        </div>
      </form>

      {largeSelectionConfirm && (
        createPortal(<div className="large-selection-toast fixed right-4 top-4 z-[4000] w-[min( calc(100vw-2rem), 25rem)] rounded-xl border border-amber-300 bg-white p-3 shadow-2xl dark:border-amber-800 dark:bg-slate-950 animate-[fade-in_0.2s_ease-out]" role="alert">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">!</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Large Selection Warning</h3>
                <button type="button" className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" onClick={() => setLargeSelectionConfirm(null)} aria-label="Close warning">×</button>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-slate-600 dark:text-slate-300">
                {largeSelectionConfirm.queriesCount} queries × {largeSelectionConfirm.locationSlots} location(s) = <strong>{largeSelectionConfirm.comboCount} combinations</strong>.
              </p>
              <p className="mt-1 truncate text-[10px] text-slate-500 dark:text-slate-400" title={largeSelectionConfirm.geoLabel}>{largeSelectionConfirm.geoLabel}</p>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">Target ≤{largeSelectionConfirm.strictTarget} · Hits/query ≤{largeSelectionConfirm.strictResultsPer} · {largeSelectionConfirm.strictHoursOld}h limit</p>
              <div className="mt-2 flex items-center justify-end gap-1.5">
                <button type="button" className="btn-ghost cursor-pointer rounded-md px-2 py-1 text-[10px]" onClick={() => setLargeSelectionConfirm(null)}>Cancel</button>
                <button type="button" className="btn-primary cursor-pointer rounded-md px-2 py-1 text-[10px]" onClick={() => { onStartStream(largeSelectionConfirm.params); setLargeSelectionConfirm(null); }}>Continue</button>
              </div>
            </div>
          </div>
        </div>, document.body)
      )}
    </div>
  );
}
