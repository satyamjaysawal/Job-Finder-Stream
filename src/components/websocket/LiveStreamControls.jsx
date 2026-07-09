import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchConfig } from "../../store/slices/configSlice";

/**
 * Stream parameters are hydrated from MongoDB `config` (via Redux).
 * User can override selections in the UI; Start Live Stream sends the
 * effective parameters to the WebSocket/API.
 */
export default function LiveStreamControls({ activeSession, onStartStream }) {
  const dispatch = useAppDispatch();
  const { config, loading: configLoading } = useAppSelector((s) => s.config);

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

  const [selectedQueries, setSelectedQueries] = useState([]);
  const [useCustomSearch, setUseCustomSearch] = useState(false);
  const [customSearch, setCustomSearch] = useState("");

  const [selectedCitiesList, setSelectedCitiesList] = useState([]);
  const [useCustomCity, setUseCustomCity] = useState(false);
  const [customCity, setCustomCity] = useState("");

  const [selectedCountries, setSelectedCountries] = useState([]);
  const [useCustomCountry, setUseCustomCountry] = useState(false);
  const [customCountry, setCustomCountry] = useState("");

  const [minExp, setMinExp] = useState("");
  const [maxExp, setMaxExp] = useState("");

  const [target, setTarget] = useState("");
  const [resultsPer, setResultsPer] = useState("");
  const [hoursOld, setHoursOld] = useState("");

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

    // Default: all queries & cities from DB; primary country from config.country
    setSelectedQueries([...qs]);
    setSelectedCitiesList([...cs]);
    const primary = (cfg.country || "").trim();
    if (primary && cos.some((c) => c.toLowerCase() === primary.toLowerCase())) {
      const match = cos.find((c) => c.toLowerCase() === primary.toLowerCase());
      setSelectedCountries(match ? [match] : [...cos]);
    } else if (cos.length) {
      setSelectedCountries([...cos]);
    } else {
      setSelectedCountries(primary ? [primary] : []);
    }

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

    setUseCustomSearch(false);
    setCustomSearch("");
    setUseCustomCity(false);
    setCustomCity("");
    setUseCustomCountry(false);
    setCustomCountry("");
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
      config.target,
      config.results_per,
      config.hours_old,
      config.country,
      config.min_exp,
      config.max_exp,
    ].join("::");

    if (key === hydratedKeyRef.current) return;
    hydratedKeyRef.current = key;

    // Always re-apply full defaults after DB save so Stream parameters stays in sync
    userTouchedRef.current = false;
    applyConfigDefaults(config, { force: true });
  }, [config, configLoading, activeSession]);

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
    setSelectedQueries(
      selectedQueries.length === searchQueries.length ? [] : [...searchQueries]
    );
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
    setSelectedCitiesList(
      selectedCitiesList.length === cities.length ? [] : [...cities]
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
    setSelectedCountries(
      selectedCountries.length === countries.length ? [] : [...countries]
    );
  };

  const handleResetToConfig = () => {
    if (activeSession) return;
    userTouchedRef.current = false;
    applyConfigDefaults(config, { force: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const queriesList = [...selectedQueries];
    if (useCustomSearch && customSearch.trim()) {
      queriesList.push(customSearch.trim());
    }

    const citiesList = [...selectedCitiesList];
    if (useCustomCity && customCity.trim()) {
      citiesList.push(customCity.trim());
    }

    const countriesList = [...selectedCountries];
    if (useCustomCountry && customCountry.trim()) {
      countriesList.push(customCountry.trim());
    }

    // Fall back to full config lists if user cleared everything
    const finalQueries =
      queriesList.length > 0
        ? queriesList
        : searchQueries.length
          ? [...searchQueries]
          : [];
    const finalCities =
      citiesList.length > 0 ? citiesList : cities.length ? [...cities] : [];
    const finalCountries =
      countriesList.length > 0
        ? countriesList
        : countries.length
          ? [...countries]
          : config?.country
            ? [config.country]
            : [];

    if (
      finalQueries.length === 0 &&
      finalCities.length === 0 &&
      finalCountries.length === 0
    ) {
      alert(
        "No stream parameters available. Load config from the database or select at least one query, city, or country."
      );
      return;
    }

    // Strict parameter caps — integers ≥ 1; never send zero/NaN to the API
    const t = parseInt(target, 10);
    const rp = parseInt(resultsPer, 10);
    const ho = parseInt(hoursOld, 10);
    const strictTarget =
      Number.isFinite(t) && t >= 1 ? t : Math.max(1, Number(config?.target) || 20);
    const strictResultsPer =
      Number.isFinite(rp) && rp >= 1
        ? rp
        : Math.max(1, Number(config?.results_per) || 10);
    const strictHoursOld =
      Number.isFinite(ho) && ho >= 1
        ? ho
        : Math.max(1, Number(config?.hours_old) || 6);

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
      alert("Min experience cannot be greater than max experience.");
      return;
    }

    onStartStream({
      search: finalQueries.join(","),
      city: finalCities.join(","),
      countries: finalCountries.join(","),
      category: "all",
      target: strictTarget,
      results_per: strictResultsPer,
      hours_old: strictHoursOld,
      min_exp: strictMinExp,
      max_exp: strictMaxExp,
      // Each run creates MongoDB collection live_stream_{timestamp}
      collection_name: "live_stream",
      // extras for logging / future API use
      from_config: !userTouchedRef.current,
      config_country: config?.country || null,
      strict_caps: true,
    });
  };

  const sectionLabel =
    "text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500";
  const wrapperTagsClass =
    "flex flex-wrap gap-1.5 max-h-36 overflow-y-auto rounded-xl border border-slate-200/50 p-2 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10";

  const configReady =
    !configLoading &&
    (searchQueries.length > 0 || cities.length > 0 || countries.length > 0);

  return (
    <div className="panel p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="section-card-title mb-0">Stream parameters</h3>
          <p className="mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Defaults from MongoDB{" "}
            <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
              config
            </span>
            {config?.updated_at
              ? ` · updated ${String(config.updated_at).slice(0, 19)}`
              : ""}
            {` · ${searchQueries.length} queries · ${cities.length} cities · ${countries.length} countries`}
            {config?.target != null ? ` · target ${config.target}` : ""}
            {config?.results_per != null ? ` · hits/q ${config.results_per}` : ""}
            {config?.hours_old != null ? ` · hours ${config.hours_old}` : ""}
            . Edit via Scraper Configuration; this panel auto-refreshes on every DB save.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
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
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search queries pills */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className={sectionLabel}>
              Queries{" "}
              <span className="font-normal normal-case text-slate-400">
                ({selectedQueries.length}/{searchQueries.length} from DB)
              </span>
            </span>
            <button
              type="button"
              className="cursor-pointer text-[10px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
              onClick={selectAllQueries}
              disabled={activeSession || !searchQueries.length}
            >
              {selectedQueries.length === searchQueries.length &&
              searchQueries.length > 0
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
          <div className={wrapperTagsClass}>
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
            {searchQueries.map((q) => {
              const selected = selectedQueries.includes(q);
              return (
                <button
                  key={q}
                  type="button"
                  disabled={activeSession}
                  onClick={() => toggleQuery(q)}
                  className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold tracking-wide transition-all ${
                    selected
                      ? "border-indigo-650 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-500"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-350 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {q}
                </button>
              );
            })}
            <button
              type="button"
              disabled={activeSession}
              onClick={() => {
                markTouched();
                setUseCustomSearch(!useCustomSearch);
              }}
              className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wide transition-all ${
                useCustomSearch
                  ? "border-violet-650 bg-violet-600 text-white dark:border-violet-400 dark:bg-violet-500"
                  : "border-dashed border-slate-300 bg-white text-slate-500 hover:border-slate-400 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-400"
              }`}
            >
              + Custom
            </button>
          </div>
          {useCustomSearch && (
            <input
              type="text"
              placeholder="e.g. Python Developer"
              className="input-field mt-2"
              value={customSearch}
              onChange={(e) => {
                markTouched();
                setCustomSearch(e.target.value);
              }}
              disabled={activeSession}
            />
          )}
        </div>

        {/* Cities pills */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className={sectionLabel}>
              Cities{" "}
              <span className="font-normal normal-case text-slate-400">
                ({selectedCitiesList.length}/{cities.length} from DB)
              </span>
            </span>
            <button
              type="button"
              className="cursor-pointer text-[10px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
              onClick={selectAllCities}
              disabled={activeSession || !cities.length}
            >
              {selectedCitiesList.length === cities.length && cities.length > 0
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
          <div className={wrapperTagsClass}>
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
            {cities.map((c) => {
              const selected = selectedCitiesList.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  disabled={activeSession}
                  onClick={() => toggleCitySelection(c)}
                  className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold tracking-wide transition-all ${
                    selected
                      ? "border-indigo-650 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-500"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-350 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {c}
                </button>
              );
            })}
            <button
              type="button"
              disabled={activeSession}
              onClick={() => {
                markTouched();
                setUseCustomCity(!useCustomCity);
              }}
              className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wide transition-all ${
                useCustomCity
                  ? "border-violet-650 bg-violet-600 text-white dark:border-violet-400 dark:bg-violet-500"
                  : "border-dashed border-slate-300 bg-white text-slate-500 hover:border-slate-400 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-400"
              }`}
            >
              + Custom
            </button>
          </div>
          {useCustomCity && (
            <input
              type="text"
              placeholder="e.g. Bangalore"
              className="input-field mt-2"
              value={customCity}
              onChange={(e) => {
                markTouched();
                setCustomCity(e.target.value);
              }}
              disabled={activeSession}
            />
          )}
        </div>

        {/* Countries pills */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className={sectionLabel}>
              Countries{" "}
              <span className="font-normal normal-case text-slate-400">
                ({selectedCountries.length}/{countries.length}
                {config?.country ? ` · default: ${config.country}` : ""})
              </span>
            </span>
            <button
              type="button"
              className="cursor-pointer text-[10px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
              onClick={selectAllCountries}
              disabled={activeSession || !countries.length}
            >
              {selectedCountries.length === countries.length &&
              countries.length > 0
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
          <div className={wrapperTagsClass}>
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
            {countries.map((co) => {
              const selected = selectedCountries.includes(co);
              const isPrimary =
                config?.country &&
                co.toLowerCase() === String(config.country).toLowerCase();
              return (
                <button
                  key={co}
                  type="button"
                  disabled={activeSession}
                  onClick={() => toggleCountry(co)}
                  className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold tracking-wide transition-all ${
                    selected
                      ? "border-indigo-650 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-500"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-350 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700"
                  }`}
                  title={isPrimary ? "Primary country in DB config" : undefined}
                >
                  {co}
                  {isPrimary ? " ★" : ""}
                </button>
              );
            })}
            <button
              type="button"
              disabled={activeSession}
              onClick={() => {
                markTouched();
                setUseCustomCountry(!useCustomCountry);
              }}
              className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wide transition-all ${
                useCustomCountry
                  ? "border-violet-650 bg-violet-600 text-white dark:border-violet-400 dark:bg-violet-500"
                  : "border-dashed border-slate-300 bg-white text-slate-500 hover:border-slate-400 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-400"
              }`}
            >
              + Custom
            </button>
          </div>
          {useCustomCountry && (
            <input
              type="text"
              placeholder="e.g. United States"
              className="input-field mt-2"
              value={customCountry}
              onChange={(e) => {
                markTouched();
                setCustomCountry(e.target.value);
              }}
              disabled={activeSession}
            />
          )}
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
              strict caps (API never exceeds these)
            </span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label
                htmlFor="ws-target"
                className="mb-1 block text-[10px] font-semibold text-slate-400 dark:text-slate-500"
                title="Hard cap — stream stops after this many unique jobs"
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
                title="Hard cap — max LinkedIn results requested per query"
              >
                Hits/Query
              </label>
              <input
                id="ws-results"
                type="number"
                min="1"
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
                title="Strict — no auto-expand beyond this window"
              >
                Hours Old
              </label>
              <input
                id="ws-hours"
                type="number"
                min="1"
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

        <button
          type="submit"
          className="btn-primary flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2.5 text-center font-bold"
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
      </form>
    </div>
  );
}
