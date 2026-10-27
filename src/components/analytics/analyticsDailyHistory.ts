import type { AnalyticsFilters } from "@/lib/api/analytics";
import type { AnalyticsTrendPoint } from "./AnalyticsTrendChart";
import { analyticsNumber } from "./analyticsData";
import { analyticsTimestamp, periodFilters } from "./analyticsPeriods";
import { analyticsSummaryData } from "./analyticsSummaryData";
import { latencyData } from "./analyticsLatencyData";
import { qualityKey, qualityRows } from "./analyticsQualityData";
import { errorSnapshot } from "./analyticsTelemetryData";

export type DailyHistorySection = "flows" | "nlp" | "performance" | "logs";

/** A daily endpoint can supply observations only for an explicitly bounded period. */
export function historyDates(
  filters: AnalyticsFilters,
  now = new Date(),
): string[] {
  const date = filters.date;
  const range =
    date === "today" || date === "yesterday"
      ? periodFilters(date, now)
      : date && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? { start_date: date, end_date: date }
        : filters;
  if (!range.start_date || !range.end_date) return [];
  const cursor = new Date(`${range.start_date}T12:00:00`);
  const end = new Date(`${range.end_date}T12:00:00`);
  if (!Number.isFinite(cursor.getTime()) || !Number.isFinite(end.getTime()))
    return [];
  const dates: string[] = [];
  while (cursor <= end) {
    dates.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`,
    );
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/** Each point comes from a separate daily request, never from a period total. */
export function dailyTrendPoint(
  section: DailyHistorySection,
  date: string,
  input: unknown,
): AnalyticsTrendPoint | null {
  const data = analyticsSummaryData(section, input);
  if (data.found === false) return null;
  // A dated response for a different day must not be relabeled as the requested day.
  if (
    typeof data.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(data.date) &&
    data.date !== date
  )
    return null;
  const point: AnalyticsTrendPoint = { timestamp: analyticsTimestamp(date) };
  if (section === "flows") {
    point.started = analyticsNumber(
      data.total_initialized_flows ?? data.total_flows_initiated,
    );
    point.completed = analyticsNumber(data.total_completed_flows);
    point.abandoned = analyticsNumber(data.total_abandoned_flows);
  } else if (section === "performance") {
    const latency = latencyData(data.end_to_end_latency_ms);
    point.average = latency.average;
    point.p95 =
      latency.percentiles.find((row) => row.percentile === 95)?.value ?? null;
  } else if (section === "logs") {
    const snapshot = errorSnapshot(data);
    if (!snapshot.available) return null;
    Object.assign(point, snapshot.counts, { total: snapshot.total });
  } else {
    point.total = analyticsNumber(data.guardrail_violations_count);
    const rows = qualityRows(
      "guardrail_violations_by_risk",
      data.guardrail_violations_by_risk,
    );
    for (const level of ["critical", "high", "medium", "low"])
      point[level] =
        rows.find(
          (row) =>
            qualityKey(row.key)
              .replace(/^risk_/, "")
              .replace(/_risk$/, "") === level,
        )?.count ?? (point.total === 0 ? 0 : null);
  }
  for (const key of Object.keys(point))
    if (key !== "timestamp" && point[key] !== null && point[key]! < 0)
      point[key] = null;
  return Object.entries(point).some(
    ([key, value]) => key !== "timestamp" && value !== null,
  )
    ? point
    : null;
}

export async function loadDailyHistory(
  section: DailyHistorySection,
  dates: string[],
  read: (date: string) => Promise<unknown>,
  signal: AbortSignal,
): Promise<AnalyticsTrendPoint[]> {
  let next = 0;
  const points: AnalyticsTrendPoint[] = [];
  await Promise.all(
    Array.from({ length: Math.min(4, dates.length) }, async () => {
      while (next < dates.length) {
        signal.throwIfAborted();
        const date = dates[next++];
        const result = await read(date);
        signal.throwIfAborted();
        const point = dailyTrendPoint(section, date, result);
        points.push(
          point ?? {
            timestamp: analyticsTimestamp(date),
            ...(section === "flows"
              ? { started: null, completed: null, abandoned: null }
              : section === "performance"
                ? { average: null, p95: null }
                : section === "logs"
                  ? {
                      total: null,
                      api: null,
                      validation: null,
                      timeout: null,
                      others: null,
                      unknown: null,
                    }
                  : {
                      total: null,
                      critical: null,
                      high: null,
                      medium: null,
                      low: null,
                    }),
          },
        );
      }
    }),
  );
  if (
    !points.some((point) =>
      Object.entries(point).some(
        ([key, value]) => key !== "timestamp" && value !== null,
      ),
    )
  )
    return [];
  return points.sort((a, b) => a.timestamp - b.timestamp);
}
