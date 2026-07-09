export function displayValue(value, emptyLabel = "—") {
  if (value === null || value === undefined || value === "") return emptyLabel;
  return value;
}

export function formatWhen(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch (_) {
    return iso;
  }
}
