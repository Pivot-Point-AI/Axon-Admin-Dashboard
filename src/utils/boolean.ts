// APIs may serialize booleans as strings or numbers; Boolean("false") is true.
export function asBoolean(value: unknown, fallback = false): boolean {
  if (value == null) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string")
    return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
  return false;
}
