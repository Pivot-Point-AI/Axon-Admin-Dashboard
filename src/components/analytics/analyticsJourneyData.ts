import { analyticsNumber, analyticsTableRows } from "./analyticsData";

export const journeySeries = [
  {
    key: "total",
    aliases: [
      "total",
      "initialized",
      "started",
      "total_initialized_flows",
      "count",
      "value",
    ],
    color: "var(--color-brand-500)",
  },
  {
    key: "completed",
    aliases: ["completed", "total_completed_flows"],
    color: "var(--color-success-500)",
  },
  {
    key: "cancelled",
    aliases: ["cancelled", "total_cancelled_flows"],
    color: "var(--color-theme-purple-500)",
  },
  {
    key: "failed",
    aliases: ["failed", "total_failed_flows"],
    color: "var(--color-error-500)",
  },
  {
    key: "abandoned",
    aliases: ["abandoned", "total_abandoned_flows"],
    color: "var(--color-orange-400)",
  },
] as const;

export type JourneySeriesKey = (typeof journeySeries)[number]["key"];

export function journeyChartRows(value: unknown) {
  return analyticsTableRows(value).map((row, index) => ({
    label: String(
      row.flow_type ?? row.name ?? row.type ?? index + 1,
    ).replaceAll("_", " "),
    values: Object.fromEntries(
      journeySeries.map((series) => {
        const key = series.aliases.find((alias) => {
          const count = analyticsNumber(row[alias]);
          return count !== null && count >= 0;
        });
        return [
          series.key,
          key === undefined ? null : analyticsNumber(row[key]),
        ];
      }),
    ) as Record<JourneySeriesKey, number | null>,
  }));
}
