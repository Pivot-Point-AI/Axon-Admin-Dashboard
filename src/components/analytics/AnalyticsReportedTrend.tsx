"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { TrendLineIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsHistoryState from "./AnalyticsHistoryState";
import useDailyAnalyticsHistory from "./useDailyAnalyticsHistory";
import AnalyticsJourneyPeriod, {
  type JourneyPeriod,
} from "./AnalyticsJourneyPeriod";
import { useAnalyticsPeriod } from "./AnalyticsPeriodContext";
import {
  filterPeriodPoints,
  filterCustomPoints,
  periodFilters,
  customPeriodFilters,
} from "./analyticsPeriods";
import AnalyticsTrendChart from "./AnalyticsTrendChart";
import { telemetryHistory } from "./analyticsTelemetryData";

interface AnalyticsReportedTrendProps {
  title: string;
  description: string;
  source: unknown;
  snapshot?: unknown;
  series: { key: string; label: string; token: string }[];
  compactAxis?: boolean;
}

export default function AnalyticsReportedTrend({
  title,
  description,
  source,
  snapshot,
  series,
  compactAxis,
}: AnalyticsReportedTrendProps) {
  const t = useTranslations("analytics.telemetry");
  const reporting = useAnalyticsPeriod();
  const [period, setPeriod] = useState<JourneyPeriod>("last7Days");
  const [customRange, setCustomRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const wireHistory = useMemo(
    () =>
      telemetryHistory(
        source,
        series.map((item) => item.key),
      ),
    [source, series],
  );

  const filters = customRange
    ? customPeriodFilters(customRange.start, customRange.end)
    : period === "allTime" && reporting?.filters.date
      ? reporting.filters
      : periodFilters(period);
  const daily = useDailyAnalyticsHistory(
    "performance",
    filters,
    wireHistory,
    snapshot,
  );
  const history = daily.points;
  const points = customRange
    ? filterCustomPoints(history, customRange.start, customRange.end)
    : filterPeriodPoints(history, period);

  return (
    <AnalyticsChartCard
      title={title}
      description={description}
      icon={<TrendLineIcon />}
      actions={
        <AnalyticsJourneyPeriod
          value={customRange ? "customRange" : period}
          start={customRange?.start}
          end={customRange?.end}
          onCustomChange={(start, end) => setCustomRange({ start, end })}
          onChange={(next) => {
            setCustomRange(null);
            setPeriod(next);
          }}
        />
      }
    >
      {points.length ? (
        <AnalyticsTrendChart
          key={period}
          title={title}
          points={points}
          series={series}
          curve="straight"
          compactAxis={compactAxis}
        />
      ) : (
        <AnalyticsHistoryState
          loading={daily.loading}
          failed={daily.failed}
          message={t("historyUnavailable")}
        />
      )}
    </AnalyticsChartCard>
  );
}
