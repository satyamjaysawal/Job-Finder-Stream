import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "./store/hooks";

import {
  clearToast,
  setBootstrapped,
  setDatabaseName,
} from "./store/slices/uiSlice";
import { fetchConfig } from "./store/slices/configSlice";
import { fetchScrapeJsonList } from "./store/slices/scrapeJsonSlice";
import { notifyError, notifySuccess } from "./store/notify";
import { apiUrl } from "./store/api";

import Header from "./components/Header";
import Toast from "./components/Toast";
import HomePage from "./pages/HomePage";
import JobsDashboardPage from "./pages/JobsDashboardPage";
import WebsocketLivePage from "./pages/WebsocketLivePage";

export default function App() {
  const dispatch = useAppDispatch();

  const { theme, toast, bootstrapped, page } = useAppSelector((s) => s.ui);
  const { loading: configLoading } = useAppSelector((s) => s.config);

  const toastTimer = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("job_portal_theme", theme);
    } catch (_) {}
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    if (toastTimer.current) clearTimeout(toastTimer.current);
    const ms = toast.type === "error" ? 3800 : 2600;
    toastTimer.current = setTimeout(() => dispatch(clearToast()), ms);
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [toast, dispatch]);

  useEffect(() => {
    // quiet: true — no success spam on first paint; failures still toast
    dispatch(fetchConfig());
    dispatch(fetchScrapeJsonList({ quiet: true }));

    // Use apiUrl so production hits the Vercel backend, not same-origin /api (404).
    fetch(apiUrl("health"))
      .then(async (res) => {
        if (!res.ok) {
          notifyError(dispatch, `API health check failed (HTTP ${res.status}).`);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (data?.database) {
          dispatch(setDatabaseName(data.database));
        }
        if (data?.status === "ok") {
          notifySuccess(dispatch, `API online · database “${data.database || "connected"}”.`);
        } else if (data?.status === "error") {
          notifyError(
            dispatch,
            data?.message || "API health check returned an error."
          );
        }
      })
      .catch(() => {
        notifyError(
          dispatch,
          "API health check failed — is the backend running?"
        );
      });
  }, [dispatch]);

  useEffect(() => {
    if (configLoading || bootstrapped) return;
    dispatch(setBootstrapped(true));
  }, [configLoading, bootstrapped, dispatch]);

  return (
    <div className="app-shell relative flex min-h-[100dvh] w-full flex-1 flex-col">
      <Toast toast={toast} onClose={() => dispatch(clearToast())} />

      <Header />

      <main className="safe-pad mx-auto flex w-full max-w-[1920px] flex-1 flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10">
        {page === "home" && <HomePage />}
        {page === "dashboard" && <JobsDashboardPage />}
        {page === "websocket-live" && <WebsocketLivePage />}
      </main>
    </div>
  );
}
