export const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export function apiError(data, fallback = "Request failed") {
  if (!data) return fallback;
  const d = data.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d) && d.length) return d[0].msg || d[0].message || fallback;
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
