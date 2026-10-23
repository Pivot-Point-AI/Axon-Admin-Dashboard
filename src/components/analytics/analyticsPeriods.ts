import type { AnalyticsFilters } from "@/lib/api/analytics";

export const analyticsPeriods = [
  "today",
  "yesterday",
  "last7Days",
  "last14Days",
  "last30Days",
  "allTime",
] as const;
export type AnalyticsPeriod = (typeof analyticsPeriods)[number];

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function periodFilters(
  period: AnalyticsPeriod,
  now = new Date(),
): AnalyticsFilters {
  if (period === "allTime") return { period: "all_time" };
  const end = new Date(now);
  if (period === "yesterday") end.setDate(end.getDate() - 1);
  const start = new Date(end);
  const days = Number(period.match(/\d+/)?.[0] ?? 1);
  start.setDate(start.getDate() - days + 1);
  return {
    period:
      period === "today"
        ? "today"
        : period === "last7Days"
          ? "last_7_days"
          : period === "last30Days"
            ? "last_30_days"
            : undefined,
    start_date: dateKey(start),
    end_date: dateKey(end),
    start_time: new Date(`${dateKey(start)}T00:00:00`).toISOString(),
    end_time: new Date(`${dateKey(end)}T23:59:59.999`).toISOString(),
  };
}

export function selectedPeriod(
  filters: AnalyticsFilters,
  now = new Date(),
): AnalyticsPeriod | undefined {
  if (
    !filters.start_date &&
    !filters.end_date &&
    !filters.start_time &&
    !filters.end_time
  )
    return filters.period === "today"
      ? "today"
      : filters.period === "last_7_days"
        ? "last7Days"
        : filters.period === "last_30_days"
          ? "last30Days"
          : "allTime";
  return analyticsPeriods.find((period) => {
    const next = periodFilters(period, now);
    return filters.start_date || filters.end_date
      ? filters.start_date === next.start_date &&
          filters.end_date === next.end_date
      : filters.start_time === next.start_time &&
          filters.end_time === next.end_time;
  });
}

export function filterPeriodPoints<T extends { timestamp: number }>(
  points: T[],
  period: AnalyticsPeriod,
  now = new Date(),
): T[] {
  if (period === "allTime") return points;
  const range = periodFilters(period, now);
  const start = Date.parse(range.start_time!);
  const end = Date.parse(range.end_time!);
  return points.filter(
    (point) => point.timestamp >= start && point.timestamp <= end,
  );
}

/** Yesterday and today together: the two-day view used when either day is picked. */
export function filterTodayAndYesterday<T extends { timestamp: number }>(
  points: T[],
  now = new Date(),
): T[] {
  const start = Date.parse(periodFilters("yesterday", now).start_time!);
  const end = Date.parse(periodFilters("today", now).end_time!);
  return points.filter(
    (point) => point.timestamp >= start && point.timestamp <= end,
  );
}

export function analyticsTimestamp(value: string): number {
  return Date.parse(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
  );
}

export function customPeriodFilters(
  start: string,
  end: string,
): AnalyticsFilters {
  return {
    start_date: start,
    end_date: end,
    start_time: new Date(`${start}T00:00:00`).toISOString(),
    end_time: new Date(`${end}T23:59:59.999`).toISOString(),
  };
}

export function filterCustomPoints<T extends { timestamp: number }>(
  points: T[],
  start: string,
  end: string,
): T[] {
  const range = customPeriodFilters(start, end);
  return points.filter(
    (point) =>
      point.timestamp >= Date.parse(range.start_time!) &&
      point.timestamp <= Date.parse(range.end_time!),
  );
}
