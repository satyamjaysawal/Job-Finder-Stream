/**
 * API + base URL helpers (from Vite env via python-style .env → import.meta.env).
 *
 * VITE_API_BASE:
 *   - "/api"                         → same-origin (Vite proxy to backend)
 *   - "http://127.0.0.1:5000/api"     → direct backend (needs backend CORS)
 *
 * VITE_BASE_URL:
 *   - frontend origin, e.g. http://127.0.0.1:5173
 *
 * VITE_BACKEND_URL / VITE_API_PROXY_TARGET:
 *   - backend origin, e.g. http://127.0.0.1:5000
 */

function stripTrailingSlash(url) {
  return String(url || "").replace(/\/+$/, "");
}

function stripLeadingSlash(path) {
  return String(path || "").replace(/^\/+/, "");
}

/** Frontend public origin (page base). */
export const BASE_URL = stripTrailingSlash(
  import.meta.env.VITE_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
);

/** Backend origin without /api (proxy target). */
export const BACKEND_URL = stripTrailingSlash(
  import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_PROXY_TARGET ||
    "http://127.0.0.1:5000"
);

/**
 * REST API base path or absolute URL.
 * Examples: "/api" | "http://127.0.0.1:5000/api"
 */
export const API_BASE = stripTrailingSlash(
  import.meta.env.VITE_API_BASE || "/api"
);

/** True when API_BASE is an absolute http(s) URL (bypass Vite proxy). */
export const API_IS_ABSOLUTE = /^https?:\/\//i.test(API_BASE);

/**
 * Build a full REST URL from a path like "/config" or "config".
 */
export function apiUrl(path = "") {
  const p = stripLeadingSlash(path);
  if (!p) return API_BASE;
  return `${API_BASE}/${p}`;
}

/**
 * WebSocket URL for live scrape feed.
 * - Relative API_BASE → same host as the page (Vite proxy ws: true)
 * - Absolute API_BASE → derive ws(s) from that host
 */
export function getWsUrl(path = "/ws/jobs") {
  const cleanPath = `/${stripLeadingSlash(path)}`;

  if (API_IS_ABSOLUTE) {
    try {
      const u = new URL(API_BASE);
      const wsProtocol = u.protocol === "https:" ? "wss:" : "ws:";
      const basePath = stripTrailingSlash(u.pathname || "/api");
      return `${wsProtocol}//${u.host}${basePath}${cleanPath}`;
    } catch {
      // fall through to same-origin
    }
  }

  if (typeof window === "undefined") {
    return `ws://127.0.0.1:5000/api${cleanPath}`;
  }

  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const apiPath = API_BASE.startsWith("/") ? API_BASE : "/api";
  return `${wsProtocol}//${window.location.host}${apiPath}${cleanPath}`;
}

export function apiError(data, fallback = "Request failed") {
  if (!data) return fallback;
  const d = data.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d) && d.length) {
    return d[0].msg || d[0].message || fallback;
  }
  if (data.details?.[0]?.msg) return data.details[0].msg;
  if (data.error) return data.error;
  if (data.message) return data.message;
  return fallback;
}

export async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export const EMPTY_CONFIG = {
  search_queries: [],
  cities: [],
  countries: [],
  target: null,
  results_per: null,
  hours_old: null,
  country: null,
  min_exp: null,
  max_exp: null,
  updated_at: null,
  is_ready: false,
  collection: "config",
};
