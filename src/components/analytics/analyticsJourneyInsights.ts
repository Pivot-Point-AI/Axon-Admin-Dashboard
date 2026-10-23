import { analyticsTimestamp } from "./analyticsPeriods";
import {
  analyticsNumber,
  analyticsTableRows,
  asAnalyticsRecord,
} from "./analyticsData";
import { metricTrend } from "./analyticsTrends";

export const journeyColors = [
  "brand-600",
  "blue-light-400",
  "success-500",
  "orange-400",
  "theme-purple-500",
  "gray-400",
];

const count = (...values: unknown[]) =>
  values.map(analyticsNumber).find((value) => value !== null && value >= 0) ??
  null;
const rate = (...values: unknown[]) => {
  const value = count(...values);
  return value !== null && value <= 100 ? value : null;
};
const reportedCount = (row: Record<string, unknown>, ...keys: string[]) =>
  count(
    ...keys.flatMap((key) => [
      row[key],
      row[`${key}.count`],
      row[`counts.${key}`],
      row[`outcomes.${key}`],
    ]),
  );

export function journeyLabelKey(key: string) {
  const labels: Record<string, string> = {
    bankfundtransfer: "bankFundTransfer",
    showlist: "showList",
    raastfundtransfer: "raastFundTransfer",
    addbeneficiary: "addBeneficiary",
    chat: "chat",
    others: "others",
    other: "others",
  };
  return labels[key.toLowerCase().replace(/[^a-z0-9]/g, "")];
}

export function journeyCategories(data: Record<string, unknown>) {
  const sources = [
    data.flow_breakdown_by_type,
    data.journey_outcomes_detail,
    data.journey_outcomes,
    data.most_popular_journeys,
    data.top_popular_flows,
  ];
  const categories = sources.flatMap((source) =>
    analyticsTableRows(source).flatMap((row, index) => {
      const key = String(
        row.flow_type ??
          row.journey_type ??
          row.intent_name ??
          row.name ??
          row.type ??
          row.category ??
          row.key ??
          index + 1,
      );
      if (["total", "count", "metrics"].includes(key)) return [];
      const total = reportedCount(
        row,
        "total",
        "initialized",
        "started",
        "total_initialized_flows",
        "total_flows",
        "total_started",
        "initiated",
        "initiated_count",
        "initialized_count",
        "started_count",
        "total_count",
        "count",
        "value",
      );
      const completed = reportedCount(
        row,
        "completed",
        "total_completed_flows",
        "completed_count",
      );
      const abandoned = reportedCount(
        row,
        "abandoned",
        "total_abandoned_flows",
        "abandoned_flows_count",
        "abandoned_count",
      );
      const completionRate =
        rate(
          row.completion_rate_pct,
          row.completion_rate,
          row.flow_completion_rate_pct,
        ) ??
        (total !== null && total > 0 && completed !== null && completed <= total
          ? (completed / total) * 100
          : null);
      const abandonmentRate =
        rate(
          row.abandonment_rate_pct,
          row.abandonment_rate,
          row.flow_abandonment_rate_pct,
        ) ??
        (total !== null && total > 0 && abandoned !== null && abandoned <= total
          ? (abandoned / total) * 100
          : null);
      if (
        total === null &&
        completed === null &&
        abandoned === null &&
        completionRate === null &&
        abandonmentRate === null
      )
        return [];
      return [
        {
          key,
          count: total,
          completed,
          abandoned,
          completionRate,
          abandonmentRate,
        },
      ];
    }),
  );
  // Merge matching categories from the detail and popularity blocks, preserving
  // explicitly reported zero counts and rates from the first available source.
  const merged = new Map<string, (typeof categories)[number]>();
  for (const row of categories) {
    const id = row.key.toLowerCase().replace(/[^a-z0-9]/g, "");
    const existing = merged.get(id);
    merged.set(
      id,
      existing
        ? {
            key: existing.key,
            count: existing.count ?? row.count,
            completed: existing.completed ?? row.completed,
            abandoned: existing.abandoned ?? row.abandoned,
            completionRate: existing.completionRate ?? row.completionRate,
            abandonmentRate: existing.abandonmentRate ?? row.abandonmentRate,
          }
        : row,
    );
  }
  return [...merged.values()].map((row) => ({
    ...row,
    completionRate:
      row.completionRate ??
      (row.count !== null &&
      row.count > 0 &&
      row.completed !== null &&
      row.completed <= row.count
        ? (row.completed / row.count) * 100
        : null),
    abandonmentRate:
      row.abandonmentRate ??
      (row.count !== null &&
      row.count > 0 &&
      row.abandoned !== null &&
      row.abandoned <= row.count
        ? (row.abandoned / row.count) * 100
        : null),
  }));
}

export function journeyDistribution(data: Record<string, unknown>) {
  const categories = journeyCategories(data).filter(
    (row) => row.count !== null,
  );
  const sorted = categories
    .map((row) => ({ key: row.key, count: row.count! }))
    .sort((a, b) => b.count - a.count);
  const sum = sorted.reduce((total, row) => total + row.count, 0);
  const total = Math.max(
    sum,
    count(data.total_initialized_flows, data.total_flows_initiated) ?? 0,
  );
  const named = sorted.filter((row) => journeyLabelKey(row.key) !== "others");
  const others = sorted
    .filter((row) => journeyLabelKey(row.key) === "others")
    .reduce((total, row) => total + row.count, 0);
  const remainder =
    others +
    Math.max(0, total - sum) +
    named.slice(5).reduce((total, row) => total + row.count, 0);
  const rows = named.slice(0, 5);
  if (remainder > 0 && categories.length)
    rows.push({ key: "others", count: remainder });
  return { rows, total };
}

export interface JourneyTrendPoint {
  timestamp: number;
  started: number | null;
  completed: number | null;
  abandoned: number | null;
}

// Only dated observations can form a trend; aggregate totals cannot supply a history.
export function journeyTrendPoints(
  data: Record<string, unknown>,
): JourneyTrendPoint[] {
  const source =
    data.journey_trends ?? data.daily_flow_trends ?? data.flow_trends;
  const history = analyticsTableRows(source)
    .flatMap((row) => {
      const date = row.date ?? row.day ?? row.timestamp ?? row.name;
      const timestamp =
        typeof date === "string" ? analyticsTimestamp(date) : NaN;
      if (!Number.isFinite(timestamp)) return [];
      const started = count(
        row.started,
        row.initialized,
        row.total_initialized_flows,
      );
      const completed = count(row.completed, row.total_completed_flows);
      const abandoned = count(row.abandoned, row.total_abandoned_flows);
      return started === null && completed === null && abandoned === null
        ? []
        : [{ timestamp, started, completed, abandoned }];
    })
    .sort((a, b) => a.timestamp - b.timestamp);
  if (history.length) return history;
  // Dated KPI observations are also real history; undated sparklines do not
  // establish dates and cannot be used for this daily chart.
  const dated = new Map<number, JourneyTrendPoint>();
  for (const [key, field] of [
    ["started", "total_initialized_flows"],
    ["completed", "total_completed_flows"],
    ["abandoned", "total_abandoned_flows"],
  ] as const) {
    for (const point of metricTrend(data, field)?.points ?? []) {
      if (!point.label || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(point.label))
        continue;
      const timestamp = analyticsTimestamp(point.label);
      if (
        !Number.isFinite(timestamp) ||
        point.value === null ||
        point.value < 0
      )
        continue;
      const row = dated.get(timestamp) ?? {
        timestamp,
        started: null,
        completed: null,
        abandoned: null,
      };
      row[key] = point.value;
      dated.set(timestamp, row);
    }
  }
  return [...dated.values()].sort((a, b) => a.timestamp - b.timestamp);
}

export function journeySteps(data: Record<string, unknown>) {
  const source = data.journey_steps ?? data.flow_step_breakdown;
  const root = asAnalyticsRecord(source);
  const rows = analyticsTableRows(
    Array.isArray(root.steps) ? root.steps : source,
  );
  return rows.flatMap((row, index) => {
    const value = count(row.count, row.users, row.remaining, row.value);
    if (value === null) return [];
    const key = String(row.key ?? row.step ?? row.name ?? index + 1);
    return [
      {
        key,
        label: typeof row.label === "string" ? row.label : null,
        count: value,
      },
    ];
  });
}
