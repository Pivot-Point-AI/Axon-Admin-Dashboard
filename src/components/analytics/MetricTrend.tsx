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
  /** Show the whole comparison; the parent lets the badge wrap to a new line. */
  full?: boolean;
}
export function MetricTrendBadge({
  trend,
  lowerIsBetter = false,
  showComparison = true,
  stacked = false,
  full = false,
}: Pick<
  MetricTrendProps,
  "trend" | "lowerIsBetter" | "showComparison" | "stacked" | "full"
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
  // The server's own wording ("+52.17% vs last month") is split so the figure
  // sits in the colored chip and the comparison reads as plain, muted text.
  const supplied = trend.display
    ? trend.display.replace(/^[\s↑↓▲▼↗↘—–]+/, "").trim()
    : "";
  const parts = supplied.match(/^([+-]?\d[\d.,]*%?)\s*(.*)$/);
  const chip = parts ? parts[1] : supplied;
  const rest = parts ? parts[2] : "";
  return (
    <span
      className={`min-w-0 items-center gap-1.5 ${full ? "text-theme-xs" : "text-[0.6875rem]"} ${stacked ? "inline-flex flex-col items-start" : `flex w-full ${full ? "flex-wrap gap-y-1 sm:flex-nowrap" : "flex-nowrap"}`}`}
    >
      <span
        // With no figure, the arrow is the whole message, so name it.
        aria-label={
          trend.change === null && !trend.display && trend.direction !== "flat"
            ? t(trend.direction === "up" ? "up" : "down")
            : undefined
        }
        className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 font-medium tabular-nums ${sentiment === "positive" ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400" : sentiment === "negative" ? "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}
      >
        {trend.direction === "up" ? (
          <ArrowUpIcon aria-hidden="true" className="size-3 shrink-0" />
        ) : trend.direction === "down" ? (
          <ArrowDownIcon aria-hidden="true" className="size-3 shrink-0" />
        ) : supplied || trend.change !== null ? null : (
          <span aria-hidden="true">—</span>
        )}
        {trend.change !== null ? (
          <span>
            {format.number(trend.change / 100, {
              style: "percent",
              maximumFractionDigits: 1,
              signDisplay: "exceptZero",
            })}
          </span>
        ) : supplied ? (
          <span>{chip}</span>
        ) : trend.direction === "flat" ? (
          <span title={t("missing")}>{"\u2014"}</span>
        ) : null}
      </span>
      {rest ? (
        <span
          className={`min-w-0 ${full ? "text-theme-xs" : "text-[0.6875rem]"} text-gray-500 dark:text-gray-400 ${full ? "whitespace-nowrap" : "truncate"}`}
          title={rest}
        >
          {rest}
        </span>
      ) : (
        showComparison &&
        text && (
          <span
            className={`min-w-0 ${full ? "text-theme-xs" : "text-[0.6875rem]"} text-gray-500 dark:text-gray-400 ${stacked ? "break-words whitespace-normal" : full ? "whitespace-nowrap" : "truncate"}`}
            title={`${text}${trend.previousCount !== null ? ` (${format.number(trend.previousCount)})` : ""}`}
          >
            {text}
            {trend.previousCount !== null && (
              <span
                className={stacked || full ? "" : "hidden @min-[15rem]:inline"}
              >
                {` (${format.number(trend.previousCount)})`}
              </span>
            )}
          </span>
        )
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
        <MetricTrendBadge trend={trend} lowerIsBetter={lowerIsBetter} stacked />
      </div>
    </div>
  );
}
