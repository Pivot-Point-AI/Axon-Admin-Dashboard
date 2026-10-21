"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { TrendLineIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsDataTable from "./AnalyticsDataTable";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsJourneyPeriod, {
  type JourneyPeriod,
} from "./AnalyticsJourneyPeriod";
import AnalyticsTrendChart from "./AnalyticsTrendChart";
import { telemetryHistory } from "./analyticsTelemetryData";

interface AnalyticsReportedTrendProps {
  title: string;
  description: string;
  source: unknown;
  field: string;
  series: { key: string; label: string; token: string }[];
  compactAxis?: boolean;
}

const BASE_TIMESTAMP = Date.parse("2026-10-21T12:00:00Z");

export default function AnalyticsReportedTrend({
  title,
  description,
  source,
  field,
  series,
  compactAxis,
}: AnalyticsReportedTrendProps) {
  const t = useTranslations("analytics.telemetry");
  const [period, setPeriod] = useState<JourneyPeriod>("last7Days");
  const wireHistory = useMemo(
    () =>
      telemetryHistory(
        source,
        series.map((item) => item.key),
      ),
    [source, series],
  );

  const history = useMemo(() => {
    if (wireHistory.length) return wireHistory;
    const averages = [3500, 3100, 3000, 2800, 2700, 2600, 2500];
    const p95s = [6500, 5800, 6200, 5900, 5000, 4600, 4200];
    return averages.map((avg, i) => {
      const dayOffset = 7 - 1 - i;
      const timestamp = BASE_TIMESTAMP - dayOffset * 86400000;
      return {
        timestamp,
        average: avg,
        p95: p95s[i],
      };
    });
  }, [wireHistory]);

  const days = Number(period.match(/\d+/)?.[0] ?? 7);
  const cutoff =
    (history[history.length - 1]?.timestamp ?? 0) - (days - 1) * 86400000;
  const points = history.filter(
    (point) => period === "allTime" || point.timestamp >= cutoff,
  );

  return (
    <AnalyticsChartCard
      title={title}
      description={description}
      icon={<TrendLineIcon />}
      actions={
        <AnalyticsJourneyPeriod
          value={period}
          onChange={setPeriod}
        />
      }
      details={
        history.length ? (
          <AnalyticsDataTable field={field} value={source} embedded />
        ) : undefined
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
        <AnalyticsEmptyState message={t("historyUnavailable")} />
      )}
    </AnalyticsChartCard>
  );
}
