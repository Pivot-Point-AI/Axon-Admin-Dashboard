import {
  analyticsNumber,
  analyticsTableRows,
  asAnalyticsRecord,
  type DistributionRow,
} from "./analyticsData";
import { chartRows } from "./analyticsChartData";
import type { AnalyticsTrendPoint } from "./AnalyticsTrendChart";

export type QualityField =
  | "intent_confidence_buckets"
  | "fallback_reasons"
  | "guardrail_violations_by_risk"
  | "intent_distribution";
export const qualityKey = (key: string) =>
  key.toLowerCase().replace(/[\s-]+/g, "_");
export function qualityRows(
  field: QualityField,
  value: unknown,
): DistributionRow[] {
  const rows = chartRows(field, value);
  if (
    field === "intent_confidence_buckets" ||
    field === "guardrail_violations_by_risk"
  ) {
    const order = ["critical", "high", "medium", "low"];
    return [...rows].sort((a, b) => {
      const first = order.indexOf(qualityKey(a.key)),
        second = order.indexOf(qualityKey(b.key));
      return (
        (first < 0 ? order.length : first) -
        (second < 0 ? order.length : second)
      );
    });
  }
  return rows;
}

export function qualityColor(
  field: QualityField,
  key: string,
  index: number,
): string {
  const level = qualityKey(key);
  if (field === "guardrail_violations_by_risk")
    return (
      {
        critical: "error-700",
        high: "error-500",
        medium: "orange-400",
        low: "success-500",
      }[level] ?? "gray-400"
    );
  if (field === "intent_confidence_buckets")
    return (
      { high: "brand-500", medium: "theme-purple-500", low: "blue-light-400" }[
        level
      ] ?? "brand-400"
    );
  if (["other", "others", "unknown"].includes(level)) return "gray-400";
  return [
    "brand-500",
    "theme-purple-500",
    "blue-light-400",
    "orange-400",
    "success-500",
  ][index % 5];
}

export function qualityDistribution(field: QualityField, value: unknown) {
  const rows = qualityRows(field, value);
  const sum = rows.reduce((total, row) => total + row.count, 0);
  const reported = analyticsNumber(asAnalyticsRecord(value).total);
  const total = Math.max(
    sum,
    reported !== null && reported >= 0 ? reported : 0,
  );
  if (total > sum && rows.length) {
    const other = rows.find((row) =>
      ["other", "others"].includes(qualityKey(row.key)),
    );
    if (other) other.count += total - sum;
    else rows.push({ key: "others", count: total - sum, percentage: null });
  }
  return {
    total,
    rows: rows.map((row) => ({
      ...row,
      percentage: total > 0 ? (row.count / total) * 100 : 0,
    })),
  };
}

// The daily summary does not imply a time series. Render only reported dates.
export function safetyTrendPoints(
  data: Record<string, unknown>,
): AnalyticsTrendPoint[] {
  return analyticsTableRows(
    data.guardrail_violations_trend ?? data.safety_blocks_trend,
  )
    .flatMap((row) => {
      const date = row.date ?? row.day ?? row.timestamp ?? row.name;
      const timestamp = typeof date === "string" ? Date.parse(date) : NaN;
      if (!Number.isFinite(timestamp)) return [];
      const point: AnalyticsTrendPoint = { timestamp };
      for (const level of ["critical", "high", "medium", "low"]) {
        const value = analyticsNumber(
          row[level] ?? row[`risk_levels.${level}`] ?? row[`by_risk.${level}`],
        );
        point[level] = value !== null && value >= 0 ? value : null;
      }
      return ["critical", "high", "medium", "low"].some(
        (level) => point[level] !== null,
      )
        ? [point]
        : [];
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}
