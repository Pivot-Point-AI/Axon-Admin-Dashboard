"use client";
import { blocksInfo } from "./analyticsTrends";
import { useMemo } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { TableIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsHistoryState from "./AnalyticsHistoryState";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import { useAnalyticsPeriod } from "./AnalyticsPeriodContext";
import useDailyAnalyticsHistory from "./useDailyAnalyticsHistory";
import {
  periodFilters,
  filterPeriodPoints,
  filterCustomPoints,
  analyticsTimestamp,
} from "./analyticsPeriods";
import type { AnalyticsTrendPoint } from "./AnalyticsTrendChart";
import AnalyticsRankingChart from "./AnalyticsRankingChart";
import AnalyticsTrendChart from "./AnalyticsTrendChart";
import { analyticsTableRows } from "./analyticsData";
import {
  classifyError,
  errorCategories,
  errorHistory,
  errorSnapshot,
} from "./analyticsTelemetryData";

interface AnalyticsActivityErrorsProps {
  data: Record<string, unknown>;
}
const colors = {
  api: "orange-400",
  validation: "theme-purple-500",
  timeout: "brand-500",
  others: "gray-400",
  unknown: "gray-300",
};
export default function AnalyticsActivityErrors({
  data,
}: AnalyticsActivityErrorsProps) {
  const t = useTranslations("analytics.telemetry");
  const tInfo = useTranslations("analytics.design.info");
  const format = useFormatter();
  const snapshot = errorSnapshot(data);
  // The card's dropdown drives its own scope, which loads the summary for the
  // chosen period, so `data` always matches the period shown here.
  const reporting = useAnalyticsPeriod();
  const filters = reporting?.filters ?? periodFilters("last7Days");
  const period = reporting ? reporting.period : "last7Days";
  const customRange =
    !period && filters.start_date && filters.end_date
      ? { start: filters.start_date, end: filters.end_date }
      : null;
  const reported = useMemo(
    () => errorHistory(data.error_trend ?? data.errors_trend),
    [data],
  );
  const daily = useDailyAnalyticsHistory("logs", filters, reported, data);
  // A complete list can supply history. A capped sample cannot represent
  // the full period: its missing timestamps are unknown.
  const rowPoints = useMemo(() => {
    const days = new Map<string, AnalyticsTrendPoint>();
    for (const row of analyticsTableRows(data.errors)) {
      const day = String(row.timestamp ?? row.date ?? "").slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
      const point = days.get(day) ?? {
        timestamp: analyticsTimestamp(day),
        total: 0,
        api: 0,
        validation: 0,
        timeout: 0,
        others: 0,
      };
      const kind = classifyError(row);
      point[kind] = (point[kind] ?? 0) + 1;
      point.total = (point.total ?? 0) + 1;
      days.set(day, point);
    }
    return [...days.values()].sort((a, b) => a.timestamp - b.timestamp);
  }, [data.errors]);
  const points = daily.points.length
    ? daily.points
    : daily.loading || daily.failed || snapshot.truncated
      ? []
      : rowPoints;
  const history = customRange
    ? filterCustomPoints(points, customRange.start, customRange.end)
    : filterPeriodPoints(points, period ?? "allTime");
  // Break the same days the chart shows down by type, so the two always agree
  // with this card's period. Without daily history, fall back to the page data.
  const rows = (
    daily.points.length && history.length
      ? errorCategories.map((key) => ({
          key,
          count: history.reduce((sum, point) => sum + (point[key] ?? 0), 0),
        }))
      : snapshot.available
        ? errorCategories.map((key) => ({ key, count: snapshot.counts[key] }))
        : []
  ).filter((row) => row.key !== "unknown" || row.count > 0);
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  // Nothing recorded in this period: one empty state beats a flat chart and a
  // distribution of zeros.
  const empty =
    !daily.loading &&
    !daily.failed &&
    rows.every((row) => row.count === 0) &&
    !history.some((point) => (point.total ?? 0) > 0);
  const truncated = !daily.points.length && snapshot.truncated;
  return (
    <AnalyticsChartCard
      title={t("errorsTitle")}
      info={
        blocksInfo(data, ["recognized_errors", "errors"]) ?? tInfo("errors")
      }
      description={t("errorsDescription")}
      icon={<TableIcon />}
      actions={<AnalyticsJourneyPeriod />}
    >
      {empty ? (
        <AnalyticsEmptyState />
      ) : (
        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          <p className="flex items-baseline gap-2 text-sm text-gray-600 lg:col-span-3 dark:text-gray-300">
            {t("errorLabels.total")}
            <strong className="text-title-sm font-semibold text-gray-950 tabular-nums dark:text-gray-100">
              {format.number(total)}
            </strong>
          </p>
          <div className="relative min-h-64 min-w-0 lg:col-span-2">
            {daily.loading || daily.failed ? (
              <AnalyticsHistoryState
                loading={daily.loading}
                failed={daily.failed}
                onRetry={daily.retry}
              />
            ) : history.length ? (
              <AnalyticsTrendChart
                title={t("errorsTitle")}
                points={history}
                curve="straight"
                fillHeight
                series={[
                  {
                    key: "total",
                    label: t("errorLabels.total"),
                    token: "error-500",
                  },
                  {
                    key: "api",
                    label: t("errorLabels.api"),
                    token: "orange-400",
                  },
                  {
                    key: "validation",
                    label: t("errorLabels.validation"),
                    token: "theme-purple-500",
                  },
                  {
                    key: "timeout",
                    label: t("errorLabels.timeout"),
                    token: "brand-500",
                  },
                  {
                    key: "others",
                    label: t("errorLabels.others"),
                    token: "gray-400",
                  },
                  ...(rows.some((row) => row.key === "unknown")
                    ? [
                        {
                          key: "unknown",
                          label: t("errorLabels.unknown"),
                          token: "gray-300",
                        },
                      ]
                    : []),
                ]}
              />
            ) : (
              <AnalyticsEmptyState
                message={total === 0 ? t("noErrors") : t("historyUnavailable")}
                description={
                  truncated ? t("errorsHistoryIncomplete") : undefined
                }
              />
            )}
          </div>
          <div className="min-w-0 rounded-xl border border-gray-100 px-3 py-2 dark:border-gray-800">
            <h3 className="mb-2 text-theme-xs font-semibold text-gray-800 dark:text-gray-200">
              {t("errorDistribution")}
            </h3>
            <AnalyticsRankingChart
              rows={rows}
              label={(key) => t(`errorLabels.${key}`)}
              color={(key) => colors[key as keyof typeof colors]}
              shares
              categoryColors
            />
          </div>
        </div>
      )}
    </AnalyticsChartCard>
  );
}
