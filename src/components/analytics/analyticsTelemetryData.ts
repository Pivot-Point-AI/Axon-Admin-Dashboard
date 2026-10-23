import { analyticsTimestamp } from "./analyticsPeriods";
import {
  analyticsNumber,
  analyticsTableRows,
  asAnalyticsRecord,
} from "./analyticsData";
import { latencyData } from "./analyticsLatencyData";
import type { AnalyticsTrendPoint } from "./AnalyticsTrendChart";

export const telemetryNumber = (...values: unknown[]) =>
  values.map(analyticsNumber).find((value) => value !== null && value >= 0) ??
  null;

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
      for (const key of keys)
        point[key] = telemetryNumber(
          row[key],
          row[`values.${key}`],
          row[`metrics.${key}`],
        );
      return keys.some((key) => point[key] !== null) ? [point] : [];
    })
    .sort((a, b) => a.timestamp - b.timestamp);
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
