"use client";

import { useFormatter, useTranslations } from "next-intl";
import AnalyticsCardActions from "./AnalyticsCardActions";
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
import AnalyticsViewAll from "./AnalyticsViewAll";
import AnalyticsPeriodChart from "./AnalyticsPeriodChart";
import AnalyticsPeriodMetrics from "./AnalyticsPeriodMetrics";
import {
  blockInfo,
  metricHistory,
  metricTrend,
  blockDescription,
} from "./analyticsTrends";
import useTwoDayData from "./useTwoDayData";

type Granularity = "daily" | "weekly" | "monthly";

const DAY_MS = 86_400_000;

/** Long ranges are summarised so each plotted point stays readable. */
function granularityFor(days: number, count: number): Granularity {
  if (count <= 45) return "daily";
  return days <= 280 ? "weekly" : "monthly";
}

function bucketStart(timestamp: number, granularity: Granularity) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  if (granularity === "monthly") date.setDate(1);
  else date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date.getTime();
}

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
  const spanDays = visibleHistory.length
    ? (visibleHistory[visibleHistory.length - 1].timestamp -
        visibleHistory[0].timestamp) /
        DAY_MS +
      1
    : 0;
  const granularity = granularityFor(spanDays, visibleHistory.length);
  const buckets = new Map<
    number,
    { total: number; count: number; end: number }
  >();
  if (granularity !== "daily")
    for (const point of visibleHistory) {
      const key = bucketStart(point.timestamp, granularity);
      const bucket = buckets.get(key) ?? { total: 0, count: 0, end: key };
      bucket.total += point.value ?? 0;
      bucket.count += 1;
      bucket.end = Math.max(bucket.end, point.timestamp);
      buckets.set(key, bucket);
    }
  const chartPoints = !hasHistory
    ? points
    : granularity === "daily"
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
      : [...buckets.entries()]
          .sort(([a], [b]) => a - b)
          .map(([start, bucket]) => {
            const monthly = granularity === "monthly";
            const short = format.dateTime(
              start,
              monthly
                ? { month: "short", year: "2-digit" }
                : { month: "short", day: "numeric" },
            );
            return {
              value: Math.round((bucket.total / bucket.count) * 10) / 10,
              axisLabel: short,
              label: monthly
                ? format.dateTime(start, { month: "long", year: "numeric" })
                : `${short} – ${format.dateTime(bucket.end, { month: "short", day: "numeric" })}`,
            };
          });

  const content = (tall: boolean) => (
    <div className="flex min-h-80 flex-1 flex-col justify-between">
      <AnalyticsPeriodChart points={chartPoints} tall={tall} />
      {hasHistory && granularity !== "daily" && (
        <p className="mt-2 text-theme-xs text-gray-500 dark:text-gray-400">
          {t(`design.activeAudienceGranularity.${granularity}`)}
        </p>
      )}
      <AnalyticsPeriodMetrics points={points} limit={tall ? 3 : 2} />
    </div>
  );

  const description =
    blockDescription(data, "active_audience") ??
    t("design.activeAudienceDescription");

  return (
    <ComponentCard
      title={t("design.activeAudience")}
      description={description}
      className="flex h-full flex-col"
      icon={<GroupIcon />}
      info={blockInfo(data, "active_audience") ?? tInfo("activeAudience")}
      actions={
        <AnalyticsCardActions>
          <AnalyticsViewAll
            title={t("design.activeAudience")}
            description={description}
            icon={<GroupIcon />}
          >
            {content(true)}
          </AnalyticsViewAll>
          {reporting && (
            <AnalyticsJourneyPeriod
              value={reporting.period ?? "customRange"}
              onChange={reporting.onChange}
            />
          )}
        </AnalyticsCardActions>
      }
    >
      {content(false)}
    </ComponentCard>
  );
}
