export const HR_QUERY_PATTERN =
  /\b(?:hr|human resources|recruit(?:er|ment)|talent acquisition|people operations|people ops|payroll)\b/i;

export const BUILTIN_GROUPS = ["developer", "hr"];

/** Display label for a group key: "hr" → "HR", "sales" → "Sales". */
export function groupLabel(key) {
  const k = String(key || "");
  if (k === "hr") return "HR";
  return k.replace(/^\w/, (c) => c.toUpperCase());
}

export function classifyQuery(query, overrides = {}) {
  const q = String(query || "").trim();
  if (!q) return "developer";
  const mapping = {};
  Object.entries(overrides || {}).forEach(([key, value]) => {
    const k = String(key || "").trim().toLowerCase();
    const v = String(value || "").trim().toLowerCase();
    if (k && (v === "hr" || v === "developer")) mapping[k] = v;
  });
  if (mapping[q.toLowerCase()]) return mapping[q.toLowerCase()];
  return HR_QUERY_PATTERN.test(q) ? "hr" : "developer";
}

export function groupQueries(queries, overrides = {}) {
  return (Array.isArray(queries) ? queries : []).reduce(
    (groups, query) => {
      const q = String(query || "").trim();
      if (!q) return groups;
      groups[classifyQuery(q, overrides)].push(q);
      return groups;
    },
    { developer: [], hr: [] }
  );
}

export function queryGroupsFromConfig(config) {
  const custom = (
    Array.isArray(config?.custom_query_groups) ? config.custom_query_groups : []
  )
    .map((g) => String(g || "").trim().toLowerCase())
    .filter((g) => g && !BUILTIN_GROUPS.includes(g));

  const result = { developer: [], hr: [] };
  custom.forEach((g) => {
    result[g] = [];
  });

  const grouped = config?.query_groups;
  if (grouped && typeof grouped === "object") {
    Object.keys(result).forEach((key) => {
      result[key] = Array.isArray(grouped[key]) ? grouped[key] : [];
    });
    return result;
  }

  // Fallback (no server grouping): local classify only knows developer/hr.
  const fallback = groupQueries(
    config?.search_queries || [],
    config?.query_group_overrides || {}
  );
  return { ...result, ...fallback };
}
