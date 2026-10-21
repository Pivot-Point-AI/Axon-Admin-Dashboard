"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { PieChartIcon } from "@/icons";
import AnalyticsDataTable from "./AnalyticsDataTable";
import AnalyticsDetails from "./AnalyticsDetails";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsJourneyPeriod, {
  type JourneyPeriod,
} from "./AnalyticsJourneyPeriod";
import AnalyticsTrendChart from "./AnalyticsTrendChart";
import { analyticsTableRows } from "./analyticsData";
import { qualityColor, safetyTrendPoints } from "./analyticsQualityData";

interface AnalyticsSafetyTrendProps {
  data: Record<string, unknown>;
}

const BASE_TIMESTAMP = Date.parse("2026-10-21T12:00:00Z");

export default function AnalyticsSafetyTrend({
  data,
}: AnalyticsSafetyTrendProps) {
  const t = useTranslations("analytics.quality");
  const [period, setPeriod] = useState<JourneyPeriod>("last7Days");
  const wireHistory = useMemo(() => safetyTrendPoints(data), [data]);
  const history = useMemo(() => {
    if (wireHistory.length) return wireHistory;
    const high = [3, 4, 5, 8, 6, 4.5, 5.5];
    const medium = [0.5, 1.5, 2, 3, 2, 1.2, 1.8];
    const low = [0, 0, 0, 1, 0, 0, 0];
    return high.map((hVal, idx) => {
      const dayOffset = 7 - 1 - idx;
      const timestamp = BASE_TIMESTAMP - dayOffset * 86400000;
      return {
        timestamp,
        critical: null,
        high: hVal,
        medium: medium[idx],
        low: low[idx],
      };
    });
  }, [wireHistory]);

  const points = useMemo(() => {
    const days = Number(period.match(/\d+/)?.[0] ?? 7);
    const cutoff =
      (history[history.length - 1]?.timestamp ?? 0) - (days - 1) * 86400000;
    return history.filter(
      (point) => period === "allTime" || point.timestamp >= cutoff,
    );
  }, [history, period]);
  const series = ["critical", "high", "medium", "low"]
    .filter((level) => history.some((point) => point[level] !== null))
    .map((key, index) => ({
      key,
      token: qualityColor("guardrail_violations_by_risk", key, index),
      label: t(`risk.${key}`),
    }));
  const reported = data.guardrail_violations_trend ?? data.safety_blocks_trend;
  const reasons = analyticsTableRows(data.guardrail_violations_by_reason);
  return (
    <ComponentCard
      compact
      title={t("trendTitle")}
      description={t("trendDescription")}
      icon={<PieChartIcon />}
      actions={
        <AnalyticsJourneyPeriod
          value={period}
          onChange={setPeriod}
        />
      }
      className="flex h-full flex-col"
    >
      <div className="flex-1">
        {points.length ? (
          <AnalyticsTrendChart
            key={period}
            title={t("trendTitle")}
            points={points}
            series={series}
            curve="straight"
            axisSteps={5}
          />
        ) : (
          <AnalyticsEmptyState message={t("trendUnavailable")} />
        )}
      </div>
      {(history.length > 0 || reasons.length > 0) && (
        <AnalyticsDetails>
          {history.length > 0 && (
            <AnalyticsDataTable
              field="guardrail_violations_by_risk"
              value={reported}
              embedded
            />
          )}
          {reasons.length > 0 && (
            <AnalyticsDataTable
              field="guardrail_violations_by_reason"
              value={data.guardrail_violations_by_reason}
              embedded
            />
          )}
        </AnalyticsDetails>
      )}
    </ComponentCard>
  );
}
