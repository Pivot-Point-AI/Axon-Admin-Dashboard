"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { trendSentiment, type MetricTrendData } from "./analyticsTrends";
import type { SparklineTone } from "./MetricSparkline";

interface MetricTrendProps {
  trend: MetricTrendData | null;
  tone?: SparklineTone;
  variant?: "line" | "bar";
  lowerIsBetter?: boolean;
  compact?: boolean;
  showComparison?: boolean;
  stacked?: boolean;
}
export function MetricTrendBadge({
  trend,
  lowerIsBetter = false,
  showComparison = true,
  stacked = false,
}: Pick<
  MetricTrendProps,
  "trend" | "lowerIsBetter" | "showComparison" | "stacked"
>) {
  const t = useTranslations("metricTrends"),
    format = useFormatter();
  if (!trend || trend.direction === null) return null;
  const sentiment = trendSentiment(trend, lowerIsBetter);
  const comparison = trend.comparison;
  const periodKey = comparison
    ?.toLowerCase()
    .replaceAll(" ", "_")
    .replace(/^vs\.?_/, "");
  const knownPeriods: Record<string, string> = {
    yesterday: t("yesterday"),
    last_month: t("lastMonth"),
    last_week: t("lastWeek"),
    last_hour: t("lastHour"),
    previous_period: t("previousPeriod"),
    last_period: t("previousPeriod"),
  };
  const label = comparison
    ? (knownPeriods[periodKey ?? ""] ?? comparison)
    : null;
  const text = label
    ? /^vs\.?\s|^compared\s/i.test(label)
      ? label
      : t("versus", { period: label })
    : null;
  return (
    <span
      className={`inline-flex min-w-0 items-center gap-1.5 text-theme-xs ${stacked ? "flex-col items-start" : "flex-nowrap"}`}
    >
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-medium tabular-nums ${sentiment === "positive" ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400" : sentiment === "negative" ? "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}
      >
        {trend.direction === "up" ? (
          <ArrowUpIcon aria-hidden="true" className="size-3" />
        ) : trend.direction === "down" ? (
          <ArrowDownIcon aria-hidden="true" className="size-3" />
        ) : (
          <span aria-hidden="true">—</span>
        )}
        {trend.change === null
          ? t(trend.direction)
          : format.number(trend.change / 100, {
              style: "percent",
              maximumFractionDigits: 1,
              signDisplay: "exceptZero",
            })}
      </span>
      {showComparison && text && (
        <span
          className="min-w-0 truncate text-[11px] text-gray-500 dark:text-gray-400"
          title={`${text}${trend.previousCount !== null ? ` (${format.number(trend.previousCount)})` : ""}`}
        >
          {text}
          {trend.previousCount !== null
            ? ` (${format.number(trend.previousCount)})`
            : ""}
        </span>
      )}
    </span>
  );
}
export default function MetricTrend({
  trend,
  lowerIsBetter = false,
  compact = false,
}: MetricTrendProps) {
  if (!trend) return null;
  if (compact)
    return (
      <MetricTrendBadge
        trend={trend}
        lowerIsBetter={lowerIsBetter}
        showComparison={false}
      />
    );
  if (trend.direction === null) return null;
  return (
    <div className="mt-auto flex items-end justify-between gap-2 pt-3">
      <div className="min-w-0 flex-1">
        <MetricTrendBadge
          trend={trend}
          lowerIsBetter={lowerIsBetter}
          stacked
        />
      </div>
    </div>
  );
}
