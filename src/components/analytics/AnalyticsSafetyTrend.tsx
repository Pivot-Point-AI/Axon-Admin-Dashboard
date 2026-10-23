"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { PieChartIcon } from "@/icons";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
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
import { qualityColor, safetyTrendPoints } from "./analyticsQualityData";

interface AnalyticsSafetyTrendProps {
  data: Record<string, unknown>;
}

export default function AnalyticsSafetyTrend({
  data,
}: AnalyticsSafetyTrendProps) {
  const t = useTranslations("analytics.quality");
  const common = useTranslations("analytics");
  const reporting = useAnalyticsPeriod();
  const [period, setPeriod] = useState<JourneyPeriod>("last7Days");
  const [customRange, setCustomRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const wireHistory = useMemo(() => safetyTrendPoints(data), [data]);
  const filters = customRange
    ? customPeriodFilters(customRange.start, customRange.end)
    : period === "allTime" && reporting?.filters.date
      ? reporting.filters
      : periodFilters(period);
  const daily = useDailyAnalyticsHistory("nlp", filters, wireHistory, data);
  const history = daily.points;
  const points = customRange
    ? filterCustomPoints(history, customRange.start, customRange.end)
    : filterPeriodPoints(history, period);
  const series = ["total", "critical", "high", "medium", "low"]
    .filter((level) => history.some((point) => point[level] !== null))
    .map((key, index) => ({
      key,
      token:
        key === "total"
          ? "blue-light-500"
          : qualityColor("guardrail_violations_by_risk", key, index),
      label: key === "total" ? common("columns.total") : t(`risk.${key}`),
    }));
  // Days are reported but every count is zero: say so rather than draw a flat line.
  const noneRecorded = points.every((point) =>
    series.every(({ key }) => !point[key]),
  );
  return (
    <ComponentCard
      compact
      title={t("trendTitle")}
      description={t("trendDescription")}
      icon={<PieChartIcon />}
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
      className="flex h-full flex-col"
    >
      <div className="flex-1">
        {points.length && !noneRecorded ? (
          <AnalyticsTrendChart
            key={period}
            title={t("trendTitle")}
            points={points}
            series={series}
            curve="straight"
            axisSteps={5}
          />
        ) : noneRecorded && points.length ? (
          <AnalyticsEmptyState />
        ) : (
          <AnalyticsHistoryState
            loading={daily.loading}
            failed={daily.failed}
            message={t("trendUnavailable")}
          />
        )}
      </div>
    </ComponentCard>
  );
}
