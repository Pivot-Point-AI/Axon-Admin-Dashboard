import type { AnalyticsFilters } from "@/lib/api/analytics";
import type { AnalyticsTrendPoint } from "./AnalyticsTrendChart";
import { analyticsTableRows } from "./analyticsData";
import { historyDates, loadDailyHistory } from "./analyticsDailyHistory";
import { analyticsTimestamp, periodFilters } from "./analyticsPeriods";
import { errorSnapshot } from "./analyticsTelemetryData";

/** Discover the full date range using aggregate totals, then load real buckets.
 * The list's oldest timestamp is a starting hint, never the coverage boundary.
 */
export async function loadAllTimeErrorHistory(
  snapshot: Record<string, unknown>,
  read: (filters: AnalyticsFilters) => Promise<unknown>,
  signal: AbortSignal,
  now = new Date(),
): Promise<AnalyticsTrendPoint[]> {
  const expected = errorSnapshot(snapshot).total;
  if (expected === 0) return [];
  const today = periodFilters("today", now).end_date!;
  const hints = analyticsTableRows(
    snapshot.errors ?? snapshot.recognized_errors,
  )
    .map((row) => String(row.timestamp ?? row.date ?? "").slice(0, 10))
    .filter(
      (date) =>
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        Number.isFinite(analyticsTimestamp(date)) &&
        date <= today,
    )
    .sort();
  let start = hints[0] ?? periodFilters("last7Days", now).start_date!;
  let target = expected;
  // Expand backward with aggregate requests before fetching any daily data.
  // At most 90 buckets are loaded, even for many years of history.
  for (;;) {
    signal.throwIfAborted();
    const result = await read({ start_date: start, end_date: today });
    signal.throwIfAborted();
    const scope = errorSnapshot(
      result !== null && typeof result === "object"
        ? (result as Record<string, unknown>)
        : {},
    );
    if (scope.available && scope.total >= expected) {
      target = scope.total;
      break;
    }
    if (start === "1970-01-01")
      throw new Error(
        "All-time error history does not reconcile with the reported total",
      );
    const days = historyDates({ start_date: start, end_date: today }).length;
    const earlier = new Date(`${start}T12:00:00`);
    earlier.setDate(earlier.getDate() - Math.max(7, days));
    start = periodFilters("today", earlier).start_date!;
    if (start < "1970-01-01") start = "1970-01-01";
  }
  const dates = historyDates({ start_date: start, end_date: today });
  const size = Math.max(1, Math.ceil(dates.length / 90));
  const buckets = new Map<string, string>();
  for (let index = 0; index < dates.length; index += size)
    buckets.set(
      dates[index],
      dates[Math.min(index + size - 1, dates.length - 1)],
    );
  const points = await loadDailyHistory(
    "logs",
    [...buckets.keys()],
    (date) => {
      const end = buckets.get(date)!;
      return read(
        date === end ? { date } : { start_date: date, end_date: end },
      );
    },
    signal,
  );
  // Failed/missing buckets must never become an apparently complete timeline.
  if (
    points.some((point) => point.total == null) ||
    points.reduce((sum, point) => sum + (point.total ?? 0), 0) !== target
  )
    throw new Error("All-time error history is incomplete");
  const ends = new Map(
    [...buckets].map(([start, end]) => [
      analyticsTimestamp(start),
      analyticsTimestamp(end),
    ]),
  );
  return points.map((point) => ({
    ...point,
    ...(size > 1 ? { endTimestamp: ends.get(point.timestamp)! } : {}),
  }));
}
