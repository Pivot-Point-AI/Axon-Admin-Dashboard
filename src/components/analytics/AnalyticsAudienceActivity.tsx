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
import { GroupIcon } from "@/icons";
import { analyticsNumber } from "./analyticsData";
import AnalyticsPeriodChart from "./AnalyticsPeriodChart";
import AnalyticsPeriodMetrics from "./AnalyticsPeriodMetrics";
import { blockInfo, metricHistory, metricTrend } from "./analyticsTrends";
import useTwoDayData from "./useTwoDayData";

interface AnalyticsAudienceActivityProps {
  data: Record<string, unknown>;
}

export default function AnalyticsAudienceActivity({
  data,
}: AnalyticsAudienceActivityProps) {
  const t = useTranslations("analytics");
  const tInfo = useTranslations("analytics.design.info");
  const format = useFormatter();
  const reporting = useAnalyticsPeriod();
  const periods = [
    "daily_active_users",
    "weekly_active_users",
    "monthly_active_users",
  ] as const;
  const points = periods.map((field, index) => ({
    label: t(`design.periods.${index}`),
    value: analyticsNumber(data[field]),
    trend: metricTrend(data, field, ["active_audience", "top_kpis"]),
  }));
  const trendData = useTwoDayData("users", data);
  const history = metricHistory(trendData, "active_audience");
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
      title={t("design.activeAudience")}
      description={t("design.activeAudienceDescription")}
      className="flex h-full flex-col"
      icon={<GroupIcon />}
      info={blockInfo(data, "active_audience") ?? tInfo("activeAudience")}
      actions={actions}
    >
      <div className="flex min-h-80 flex-1 flex-col justify-between">
        <AnalyticsPeriodChart points={chartPoints} />
        <AnalyticsPeriodMetrics points={points} />
      </div>
    </ComponentCard>
  );
}
