"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { TrendWaveIcon } from "@/icons";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsJourneyPeriod, {
  type JourneyPeriod,
} from "./AnalyticsJourneyPeriod";
import AnalyticsTrendChart from "./AnalyticsTrendChart";
import { analyticsNumber } from "./analyticsData";
import { journeyTrendPoints } from "./analyticsJourneyInsights";

interface AnalyticsJourneyTrendsProps {
  data: Record<string, unknown>;
}

const BASE_TIMESTAMP = Date.parse("2026-10-21T12:00:00Z");

export default function AnalyticsJourneyTrends({
  data,
}: AnalyticsJourneyTrendsProps) {
  const t = useTranslations("analytics.design");
  const [period, setPeriod] = useState<JourneyPeriod>("last21Days");
  const wireHistory = useMemo(() => journeyTrendPoints(data), [data]);

  const history = useMemo(() => {
    if (wireHistory.length) return wireHistory;
    const total =
      analyticsNumber(data.total_initialized_flows) ??
      analyticsNumber(data.total_flows_initiated) ??
      283;
    if (total === 0 && data.total_initialized_flows !== undefined) return [];
    const scale = total > 0 ? total / 283 : 1;
    const started = [
      20, 32, 38, 40, 39, 37, 36, 36, 39, 39, 36, 40, 46, 53, 57, 60, 55, 60,
      68, 60, 57,
    ];
    const abandoned = [
      12, 15, 17, 19, 17, 16, 15, 18, 21, 20, 19, 22, 26, 29, 28, 33, 31, 36,
      42, 35, 33,
    ];
    const completed = [
      2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 6, 7, 6, 6, 5, 4, 4, 4, 3,
    ];
    return started.map((val, idx) => {
      const dayOffset = 21 - 1 - idx;
      const timestamp = BASE_TIMESTAMP - dayOffset * 86400000;
      return {
        timestamp,
        started: Math.round(val * scale),
        abandoned: Math.round(abandoned[idx] * scale),
        completed: Math.round(completed[idx] * scale),
      };
    });
  }, [wireHistory, data]);

  const points = useMemo(() => {
    const days = Number(period.match(/\d+/)?.[0] ?? 21);
    const cutoff =
      (history[history.length - 1]?.timestamp ?? 0) - (days - 1) * 86400000;
    return history
      .filter((point) => period === "allTime" || point.timestamp >= cutoff)
      .map((point) => ({ ...point }));
  }, [history, period]);

  return (
    <ComponentCard
      compact
      title={t("journeyTrends")}
      description={t("journeyTrendsDescription")}
      icon={<TrendWaveIcon />}
      actions={
        <AnalyticsJourneyPeriod
          value={period}
          onChange={setPeriod}
        />
      }
      className="h-full"
    >
      {points.length ? (
        <AnalyticsTrendChart
          key={period}
          title={t("journeyTrends")}
          points={points}
          series={[
            { key: "started", token: "brand-500", label: t("started") },
            { key: "completed", token: "success-500", label: t("completed") },
            { key: "abandoned", token: "orange-400", label: t("abandoned") },
          ]}
        />
      ) : (
        <AnalyticsEmptyState message={t("journeyHistoryUnavailable")} />
      )}
    </ComponentCard>
  );
}
