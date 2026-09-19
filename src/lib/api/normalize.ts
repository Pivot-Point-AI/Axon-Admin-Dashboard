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
    for (const key of ["items", "data", "results", "banks", "billers", "donations"]) {
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
