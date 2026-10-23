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
import { UserIcon } from "@/icons";
import { analyticsNumber } from "./analyticsData";
import AnalyticsPeriodChart from "./AnalyticsPeriodChart";
import AnalyticsPeriodMetrics from "./AnalyticsPeriodMetrics";
import { metricHistory, metricTrend } from "./analyticsTrends";
import useTwoDayData from "./useTwoDayData";

interface AnalyticsAcquisitionProps {
  data: Record<string, unknown>;
}

export default function AnalyticsAcquisition({
  data,
}: AnalyticsAcquisitionProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const reporting = useAnalyticsPeriod();
  const points = [
    "new_users_today",
    "new_users_this_week",
    "new_users_this_month",
  ].map((field) => ({
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
      className="flex h-full flex-col"
    >
      <div className="min-h-64 flex-1">
        <AnalyticsPeriodChart points={chartPoints} variant="bar" fillHeight />
      </div>
      <AnalyticsPeriodMetrics points={points} isAcquisition />
    </ComponentCard>
  );
}
