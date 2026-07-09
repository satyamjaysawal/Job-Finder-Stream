import { createSlice } from "@reduxjs/toolkit";

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("job_portal_theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch (_) {}
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return "dark";
}

const initialState = {
  theme: getInitialTheme(),
  toast: null,
  backendOnline: false,
  bootstrapped: false,
  page: "dashboard",
  databaseName: "MongoDB",
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
      state.toast = {
        message: String(message || ""),
        type: kind,
        id: Date.now(),
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
} = uiSlice.actions;

export default uiSlice.reducer;
