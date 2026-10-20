import {
  asAnalyticsRecord,
  distributionRows,
  type DistributionRow,
} from "./analyticsData";

export type AnalyticsChartKind = "columns" | "area" | "donut" | "ranking";

export const chartKinds: Record<string, AnalyticsChartKind> = {
  peak_activity_hours: "columns",
  activity_by_day_of_week: "area",
  top_popular_flows: "ranking",
  intent_confidence_buckets: "columns",
  fallback_reasons: "donut",
  guardrail_violations_by_risk: "columns",
  guardrail_violations_by_reason: "ranking",
  intent_distribution: "donut",
  stage_averages_ms: "ranking",
  sources: "donut",
  stt_events: "columns",
  token_usage: "columns",
  dispatched_actions: "ranking",
};

export function chartRows(field: string, value: unknown): DistributionRow[] {
  // Keep the original payload intact and order only real, reported categories.
  const source =
    field === "activity_by_day_of_week" && Array.isArray(value)
      ? [...value].sort((a, b) => {
          const first = asAnalyticsRecord(a).day_index;
          const second = asAnalyticsRecord(b).day_index;
          return typeof first === "number" && typeof second === "number"
            ? first - second
            : 0;
        })
      : value;
  const rows = distributionRows(source);
  if (field === "peak_activity_hours")
    return rows.sort((a, b) => Number(a.key) - Number(b.key));
  if (field === "activity_by_day_of_week") return rows;
  if (field === "intent_confidence_buckets") {
    const levels: Record<string, number> = { low: 0, medium: 1, high: 2 };
    return rows.sort((a, b) => {
      const first = levels[a.key.toLowerCase()] ?? Number.parseFloat(a.key);
      const second = levels[b.key.toLowerCase()] ?? Number.parseFloat(b.key);
      return Number.isFinite(first) && Number.isFinite(second)
        ? first - second
        : 0;
    });
  }
  return rows.sort((a, b) => b.count - a.count);
}

export const chartColors = [
  "var(--color-brand-500)",
  "var(--color-theme-purple-500)",
  "var(--color-blue-light-400)",
  "var(--color-success-500)",
  "var(--color-orange-400)",
  "var(--color-theme-pink-500)",
];

export function chartColor(field: string, key: string, index: number): string {
  if (field === "peak_activity_hours") return "var(--color-brand-500)";
  const level = key.toLowerCase();
  if (
    (field === "intent_confidence_buckets" ||
      field === "guardrail_violations_by_risk") &&
    ["low", "medium", "high"].includes(level)
  ) {
    if (level === "medium") return "var(--color-warning-500)";
    const good =
      field === "intent_confidence_buckets"
        ? level === "high"
        : level === "low";
    return good ? "var(--color-success-500)" : "var(--color-error-500)";
  }
  return chartColors[index % chartColors.length];
}
