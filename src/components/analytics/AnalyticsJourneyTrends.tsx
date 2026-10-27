"use client";

import { blocksInfo } from "./analyticsTrends";
import { useMemo } from "react";
import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { TrendWaveIcon } from "@/icons";
import AnalyticsHistoryState from "./AnalyticsHistoryState";
import useDailyAnalyticsHistory from "./useDailyAnalyticsHistory";
import AnalyticsCardActions from "./AnalyticsCardActions";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import AnalyticsViewAll from "./AnalyticsViewAll";
import AnalyticsTrendChart from "./AnalyticsTrendChart";
import { useAnalyticsPeriod } from "./AnalyticsPeriodContext";
import {
  filterPeriodPoints,
  filterCustomPoints,
  periodFilters,
} from "./analyticsPeriods";
import { journeyTrendPoints } from "./analyticsJourneyInsights";

interface AnalyticsJourneyTrendsProps {
  data: Record<string, unknown>;
}

export default function AnalyticsJourneyTrends({
  data,
}: AnalyticsJourneyTrendsProps) {
  const t = useTranslations("analytics.design");
  const tInfo = useTranslations("analytics.design.info");
  const format = useFormatter();
  const reporting = useAnalyticsPeriod();
  const period = reporting?.period ?? "last7Days";
  const reported = useMemo(
    () => journeyTrendPoints(data).map((point) => ({ ...point })),
    [data],
  );
  const daily = useDailyAnalyticsHistory(
    "flows",
    reporting?.filters ?? periodFilters("last7Days"),
    reported,
    data,
  );
  const history = daily.points;
  const visibleHistory =
    reporting?.filters.start_date && reporting.filters.end_date
      ? filterCustomPoints(
          history,
          reporting.filters.start_date,
          reporting.filters.end_date,
        )
      : filterPeriodPoints(history, period);
  const points = visibleHistory.map((point) => ({
    ...point,
  }));

  const series = [
    { key: "started", token: "brand-500", label: t("started") },
    { key: "completed", token: "success-500", label: t("completed") },
    { key: "abandoned", token: "orange-400", label: t("abandoned") },
  ];
  const count = (value: number | null) =>
    value === null ? "—" : format.number(value);
  const entries = [...points].reverse().map((point) => ({
    key: String(point.timestamp),
    label: format.dateTime(point.timestamp, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    values: [
      count(point.started),
      count(point.completed),
      count(point.abandoned),
    ],
  }));
  const chart = (tall = false) => (
    <AnalyticsTrendChart
      key={period}
      title={t("journeyTrends")}
      points={points}
      series={series}
      tall={tall}
    />
  );

  return (
    <ComponentCard
      compact
      title={t("journeyTrends")}
      description={t("journeyTrendsDescription")}
      icon={<TrendWaveIcon />}
      info={
        blocksInfo(data, [
          "journey_trends",
          "daily_flow_trends",
          "flow_trends",
        ]) ?? tInfo("journeyTrends")
      }
      actions={
        <AnalyticsCardActions>
          <AnalyticsViewAll
            title={t("journeyTrends")}
            description={t("journeyTrendsDescription")}
            icon={<TrendWaveIcon />}
            columns={[
              t("dateColumn"),
              t("started"),
              t("completed"),
              t("abandoned"),
            ]}
            entries={entries}
          >
            {points.length ? (
              chart(true)
            ) : (
              <AnalyticsHistoryState
                loading={daily.loading}
                failed={daily.failed}
              />
            )}
          </AnalyticsViewAll>
          <AnalyticsJourneyPeriod
            value={reporting ? (reporting.period ?? "customRange") : period}
            onChange={reporting?.onChange}
          />
        </AnalyticsCardActions>
      }
      className="h-full"
    >
      {points.length ? (
        chart()
      ) : (
        <AnalyticsHistoryState
          loading={daily.loading}
          failed={daily.failed}
          message={t("journeyHistoryUnavailable")}
        />
      )}
    </ComponentCard>
  );
}
