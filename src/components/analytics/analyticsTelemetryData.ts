import { analyticsTimestamp } from "./analyticsPeriods";
import {
  analyticsNumber,
  analyticsTableRows,
  asAnalyticsRecord,
} from "./analyticsData";
import { latencyData } from "./analyticsLatencyData";
import type { AnalyticsTrendPoint } from "./AnalyticsTrendChart";
import { metricValue } from "./analyticsTrends";

export const telemetryNumber = (...values: unknown[]) =>
  values.map(analyticsNumber).find((value) => value !== null && value >= 0) ??
  null;

export type ErrorKind = "api" | "validation" | "timeout" | "others";
export const errorCategories = [
  "api",
  "validation",
  "timeout",
  "others",
  "unknown",
] as const;

/** How many occurrences a listed error stands for. The API lists each
 * distinct error once with a `count`; a row without one is a single event. */
export function errorWeight(row: Record<string, unknown>): number {
  const count = telemetryNumber(row.count, row.occurrences);
  return count === null ? 1 : Math.round(count);
}

/** The KPI is the full count; the error list can be a capped sample. */
export function errorSnapshot(data: Record<string, unknown>) {
  const source = data.errors ?? data.recognized_errors;
  const errors = analyticsTableRows(source);
  const counts: Record<(typeof errorCategories)[number], number> = {
    api: 0,
    validation: 0,
    timeout: 0,
    others: 0,
    unknown: 0,
  };
  let listed = 0;
  for (const error of errors) {
    const weight = errorWeight(error);
    counts[classifyError(error)] += weight;
    listed += weight;
  }
  const reported = telemetryNumber(
    data.recorded_errors,
    metricValue(data, "recorded_errors"),
  );
  const total = Math.max(listed, reported ?? 0);
  counts.unknown = total - listed;
  return {
    counts,
    total,
    listed,
    truncated: total > listed,
    available: Array.isArray(source) || reported !== null,
  };
}

/** The type is often generic ("ner_extraction_failed"); the message says why. */
export function classifyError(row: Record<string, unknown>): ErrorKind {
  const text = [
    row.error_type ?? row.type ?? row.category ?? "",
    typeof row.error === "string" ? row.error : "",
    row.message ?? "",
  ]
    .join(" ")
    .toLowerCase();
  if (/time.?out|timed out/.test(text)) return "timeout";
  if (text.includes("validation")) return "validation";
  if (/api|server error|unauthorized|\b[45]\d\d\b/.test(text)) return "api";
  return "others";
}

export function telemetryRows(value: unknown) {
  const root = asAnalyticsRecord(value);
  const wrapper = [
    "rows",
    "data",
    "items",
    "history",
    "points",
    "buckets",
    "distribution",
    "categories",
  ].find((key) => root[key] !== null && typeof root[key] === "object");
  return analyticsTableRows(wrapper ? root[wrapper] : value);
}

export function telemetryDistribution(value: unknown) {
  return telemetryRows(value).flatMap((row, index) => {
    const count = telemetryNumber(
      row.count,
      row.total,
      row.value,
      row.frequency,
    );
    if (count === null) return [];
    const key = String(
      row.key ??
        row.category ??
        row.action ??
        row.action_name ??
        row.source ??
        row.event ??
        row.label ??
        row.name ??
        row.type ??
        index + 1,
    );
    return [{ key, count, percentage: null }];
  });
}

export function telemetryHistory(
  value: unknown,
  keys: string[],
): AnalyticsTrendPoint[] {
  return telemetryRows(value)
    .flatMap((row) => {
      const date = row.date ?? row.day ?? row.timestamp ?? row.name;
      const timestamp =
        typeof date === "string" ? analyticsTimestamp(date) : NaN;
      if (!Number.isFinite(timestamp)) return [];
      const point: AnalyticsTrendPoint = { timestamp };
      const values = asAnalyticsRecord(row.values);
      const metrics = asAnalyticsRecord(row.metrics);
      for (const key of keys)
        point[key] = telemetryNumber(
          row[key],
          values[key],
          metrics[key],
          row[`values.${key}`],
          row[`metrics.${key}`],
        );
      return keys.some((key) => point[key] !== null) ? [point] : [];
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}

/** Keep uncategorized errors visible so the breakdown reconciles with totals. */
export function errorHistory(value: unknown): AnalyticsTrendPoint[] {
  return telemetryHistory(value, [
    "total",
    "api",
    "validation",
    "timeout",
    "others",
    "unknown",
  ]).map((point) => {
    const categorized = errorCategories.reduce(
      (sum, key) => sum + (point[key] ?? 0),
      0,
    );
    if (point.total !== null) {
      point.unknown =
        (point.unknown ?? 0) + Math.max(0, point.total - categorized);
      point.total = Math.max(point.total, categorized);
    } else if (
      ["api", "validation", "timeout", "others"].every(
        (key) => point[key] !== null,
      )
    ) {
      point.total = categorized;
    }
    return point;
  });
}

export function performanceStages(data: Record<string, unknown>) {
  return [
    ["response", data.end_to_end_latency_ms],
    ["speech", data.stt_transcription_latency_ms],
    ["generation", data.llm_generation_latency_ms],
    [
      "total",
      data.total_processing_percentiles ?? data.total_processing_latency_ms,
    ],
  ].flatMap(([key, value]) => {
    const timing = latencyData(value);
    const average = timing.average;
    const p95 =
      timing.percentiles.find((row) => row.percentile === 95)?.value ?? null;
    return average === null && p95 === null
      ? []
      : [{ key: String(key), average, p95 }];
  });
}

export function responseHistogram(data: Record<string, unknown>) {
  const latency = asAnalyticsRecord(data.end_to_end_latency_ms);
  return telemetryRows(
    data.response_time_distribution ??
      latency.histogram ??
      latency.distribution,
  ).flatMap((row, index) => {
    const count = telemetryNumber(row.count, row.requests, row.value);
    if (count === null) return [];
    const lower = telemetryNumber(row.lower_ms, row.min_ms);
    const upper = telemetryNumber(row.upper_ms, row.max_ms);
    const label =
      row.label ??
      row.range ??
      row.bucket ??
      row.name ??
      (lower !== null && upper !== null ? `${lower}–${upper}` : index + 1);
    return [{ label: String(label), value: count }];
  });
}
