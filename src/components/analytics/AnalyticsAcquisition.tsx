"use client";

import { useFormatter, useTranslations } from "next-intl";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import { useAnalyticsPeriod } from "./AnalyticsPeriodContext";
import {
  filterPeriodPoints,
  filterTodayAndYesterday,
  filterCustomPoints,
  analyticsTimestamp,
} from "./analyticsPeriods";
import ComponentCard from "@/components/common/ComponentCard";
import { CalenderIcon, UserIcon } from "@/icons";
import { analyticsNumber } from "./analyticsData";
import AnalyticsPeriodChart from "./AnalyticsPeriodChart";
import MetricTrend from "./MetricTrend";
import AnalyticsValue from "./AnalyticsValue";
import { blockInfo, metricHistory, metricTrend } from "./analyticsTrends";
import useTwoDayData from "./useTwoDayData";

interface AnalyticsAcquisitionProps {
  data: Record<string, unknown>;
}

export default function AnalyticsAcquisition({
  data,
}: AnalyticsAcquisitionProps) {
  const t = useTranslations("analytics");
  const tInfo = useTranslations("analytics.design.info");
  const format = useFormatter();
  const reporting = useAnalyticsPeriod();
  const fields = [
    "new_users_today",
    "new_users_this_week",
    "new_users_this_month",
  ];
  const points = fields.map((field) => ({
    label: t(`fields.${field}`),
    value: analyticsNumber(data[field]),
    trend: metricTrend(data, field, ["new_user_acquisition"]),
  }));
  const trendData = useTwoDayData("users", data);
  const history = metricHistory(trendData, "new_user_acquisition");
  const hasHistory = history.some((point) => point.value !== null);
  const dated = (
    points: { label: string | null; value: number | null; timestamp: number }[],
  ) =>
    reporting?.period === "today" || reporting?.period === "yesterday"
      ? filterTodayAndYesterday(points)
      : filterPeriodPoints(points, reporting?.period ?? "last7Days");
  const datedHistory = dated(
    history.flatMap((point) => {
      const timestamp =
        point.label && /^\d{4}-\d{2}-\d{2}/.test(point.label)
          ? analyticsTimestamp(point.label)
          : NaN;
      return Number.isFinite(timestamp) ? [{ ...point, timestamp }] : [];
    }),
  );
  const twoDays =
    reporting?.period === "today" || reporting?.period === "yesterday";
  const visibleHistory =
    !twoDays && reporting?.filters.start_date && reporting.filters.end_date
      ? filterCustomPoints(
          datedHistory,
          reporting.filters.start_date,
          reporting.filters.end_date,
        )
      : datedHistory;
  const chartPoints = hasHistory
    ? visibleHistory.map((point, index) => {
        const date =
          point.label && /^\d{4}-\d{2}-\d{2}/.test(point.label)
            ? new Date(point.timestamp)
            : null;
        return {
          value: point.value,
          label:
            date && Number.isFinite(date.getTime())
              ? format.dateTime(date, { month: "short", day: "numeric" })
              : (point.label ?? format.number(index + 1)),
        };
      })
    : points;

  const actions = reporting ? (
    <AnalyticsJourneyPeriod
      value={reporting.period ?? "customRange"}
      onChange={reporting.onChange}
    />
  ) : undefined;

  return (
    <ComponentCard
      title={t("design.newUsers")}
      description={t(
        hasHistory
          ? "design.newUsersHistoryDescription"
          : "design.newUsersDescription",
      )}
      icon={<UserIcon />}
      actions={actions}
      info={blockInfo(data, "new_user_acquisition") ?? tInfo("newUsers")}
      className="flex h-full flex-col"
    >
      <div className="min-h-64 flex-1">
        <AnalyticsPeriodChart points={chartPoints} variant="bar" fillHeight />
      </div>
      <dl className="mt-4 divide-y divide-gray-100 border-t border-gray-200 pt-4 dark:divide-gray-800 dark:border-gray-700">
        {fields.map((field, index) => (
          <div
            key={field}
            className="grid grid-cols-[minmax(0,1.2fr)_5rem_minmax(0,1fr)] items-center gap-x-3 py-3 first:pt-0 last:pb-0"
          >
            <dt className="flex min-w-0 items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300"
              >
                <CalenderIcon className="size-4" />
              </span>
              <span className="min-w-0 break-words">{points[index].label}</span>
            </dt>
            <dd className="contents">
              <span className="text-center text-sm font-bold text-gray-950 tabular-nums dark:text-white">
                <AnalyticsValue
                  value={points[index].value ?? 0}
                  field={field}
                />
              </span>
              <span className="flex min-w-0 justify-end [&>span]:justify-end">
                <MetricTrend compact trend={points[index].trend} />
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </ComponentCard>
  );
}
