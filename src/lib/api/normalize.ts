// Several endpoints don't declare a response_model on the backend, so the
// OpenAPI spec can't tell us the real shape. In practice they return either
// a bare array, or an object wrapping one under a common key. This coerces
// either into an array so list UIs have something consistent to render.
export function asRecordArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    );
  }
  if (payload && typeof payload === "object") {
    for (const key of [
      "items",
      "data",
      "results",
      "banks",
      "billers",
      "donations",
      "biller_types",
      "biller_categories",
      "card_types",
      "types",
      "categories",
    ]) {
      const candidate = (payload as Record<string, unknown>)[key];
      if (Array.isArray(candidate)) {
        return candidate.filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null,
        );
      }
    }
  }
  return [];
}

/** Read actual record identifiers without coercing missing values into zero.
 * List endpoints may expose the database key as `id` or `bankId` instead
 * of the resource-specific `bank_id` used in the update/delete route.
 * Names and array positions are never safe identifiers.
 */
export function recordId(
  record: Record<string, unknown>,
  idField: string,
): number | null {
  const camelCase = idField.replace(/_([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
  for (const key of new Set([idField, camelCase, "id"])) {
    const value = record[key];
    if (typeof value !== "number" && typeof value !== "string") continue;
    if (typeof value === "string" && !/^\d+$/.test(value.trim())) continue;
    const id = Number(value);
    if (Number.isSafeInteger(id) && id >= 0) return id;
  }
  return null;
}
