import { createSlice } from "@reduxjs/toolkit";

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("job_portal_theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch (_) {}
  return "dark";
}

export const VALID_PAGES = ["home", "dashboard", "websocket-live", "users"];

/** Derive the current page from the clean pathname. */
export function pageFromLocation() {
  try {
    const raw = window.location.pathname.replace(/^\/+|\/+$/g, "");
    return VALID_PAGES.includes(raw) ? raw : "home";
  } catch (_) {
    return "home";
  }
}

const BROWSE_COMPANIES_KEY = "job_portal_browse_companies";

function readBrowseCompanies() {
  try {
    const raw = localStorage.getItem(BROWSE_COMPANIES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item || "").trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function persistBrowseCompanies(list) {
  try {
    localStorage.setItem(BROWSE_COMPANIES_KEY, JSON.stringify(list));
  } catch (_) {}
}

const initialState = {
  theme: getInitialTheme(),
  toast: null,
  backendOnline: false,
  bootstrapped: false,
  // Restore the same page after a browser reload via the URL hash.
  page: pageFromLocation(),
  databaseName: "MongoDB",
  browseCompanies: readBrowseCompanies(),
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
    /**
     * payload: { message: string, type?: "success" | "error" | "info" }
     */
    showToast(state, action) {
      const { message, type = "success" } = action.payload || {};
      const kind =
        type === "error" || type === "info" || type === "success"
          ? type
          : "success";
      // Unique id every time so Toast remounts (key) and animation re-runs.
      state.toast = {
        message: String(message || ""),
        type: kind,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
    },
    clearToast(state) {
      state.toast = null;
    },
    setBackendOnline(state, action) {
      state.backendOnline = action.payload;
    },
    setBootstrapped(state, action) {
      state.bootstrapped = action.payload;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    setDatabaseName(state, action) {
      state.databaseName = action.payload;
    },
    setBrowseCompanies(state, action) {
      const incoming = Array.isArray(action.payload) ? action.payload : [];
      const seen = new Set();
      const next = [];
      incoming.forEach((item) => {
        const value = String(item || "").trim();
        if (!value) return;
        const key = value.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        next.push(value);
      });
      state.browseCompanies = next;
      persistBrowseCompanies(next);
    },
    toggleBrowseCompany(state, action) {
      const value = String(action.payload || "").trim();
      if (!value) return;
      const exists = state.browseCompanies.some(
        (item) => item.toLowerCase() === value.toLowerCase()
      );
      const next = exists
        ? state.browseCompanies.filter((item) => item.toLowerCase() !== value.toLowerCase())
        : [...state.browseCompanies, value];
      state.browseCompanies = next;
      persistBrowseCompanies(next);
    },
  },
});

export const {
  toggleTheme,
  showToast,
  clearToast,
  setBackendOnline,
  setBootstrapped,
  setPage,
  setDatabaseName,
  setBrowseCompanies,
  toggleBrowseCompany,
} = uiSlice.actions;

export default uiSlice.reducer;
