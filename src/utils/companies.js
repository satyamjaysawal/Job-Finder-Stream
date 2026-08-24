const COMPANY_NOISE =
  /[.,()|&+/]+|\b(?:inc|incorporated|llc|ltd|limited|pvt|private|plc|corp|corporation|co|company|group|services|solutions|technologies|technology|india|usa|uk|federal\s+services|engineering|web\s+services|aws|acceleration\s+centers?|global(?:\s+tech)?|north\s+america)\b|\bin\s+india\b/gi;

export function normalizeCompanyKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(COMPANY_NOISE, " ")
    .replace(/^the\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenIn(haystack, needle) {
  if (!needle) return false;
  if (haystack === needle) return true;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[\\s,;/|(])${escaped}(?:$|[\\s,;/)|])`).test(haystack);
}

export function companiesMatch(jobCompany, selected) {
  const names = (Array.isArray(selected) ? selected : [selected])
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  if (!names.length) return true;
  const rawJob = String(jobCompany || "").trim().toLowerCase();
  if (!rawJob) return false;
  const jobKey = normalizeCompanyKey(jobCompany);
  return names.some((sel) => {
    const rawSel = sel.toLowerCase();
    const selKey = normalizeCompanyKey(sel);
    if (tokenIn(rawJob, rawSel) || tokenIn(rawSel, rawJob)) return true;
    if (selKey && jobKey && selKey.length >= 3 && jobKey.length >= 3) {
      if (tokenIn(jobKey, selKey) || tokenIn(selKey, jobKey)) return true;
    }
    return false;
  });
}

export function canonicalizeCompany(name, known = []) {
  const original = String(name || "").trim() || "Unknown";
  if (original === "Unknown" || !known.length) return original;
  let best = null;
  known.forEach((knownName) => {
    if (companiesMatch(original, [knownName])) {
      if (!best || knownName.length > best.length) best = knownName;
    }
  });
  return best || original;
}

export function uniqueCanonicalCompanies(jobCompanies, known = []) {
  const seen = new Set();
  const out = [];
  (jobCompanies || []).forEach((name) => {
    const canon = canonicalizeCompany(name, known);
    const key = canon.toLowerCase();
    if (!key || key === "unknown" || seen.has(key)) return;
    seen.add(key);
    out.push(canon);
  });
  return out.sort((a, b) => a.localeCompare(b));
}
