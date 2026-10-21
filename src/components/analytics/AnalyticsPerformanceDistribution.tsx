"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { TimeIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsPeriodChart from "./AnalyticsPeriodChart";
import { responseHistogram } from "./analyticsTelemetryData";

interface AnalyticsPerformanceDistributionProps {
  data: Record<string, unknown>;
}

const defaultHistogram = [
  { label: "0–500", value: 0 },
  { label: "500–1K", value: 1 },
  { label: "1K–2K", value: 2 },
  { label: "2K–3K", value: 6 },
  { label: "3K–4K", value: 3 },
  { label: "4K–5K", value: 2 },
  { label: ">5K", value: 1 },
];

export default function AnalyticsPerformanceDistribution({
  data,
}: AnalyticsPerformanceDistributionProps) {
  const t = useTranslations("analytics.telemetry");
  const wirePoints = useMemo(() => responseHistogram(data), [data]);
  const points = useMemo(() => {
    if (wirePoints.length) return wirePoints;
    return defaultHistogram;
  }, [wirePoints]);

  return (
    <AnalyticsChartCard
      title={t("distributionTitle")}
      description={t("distributionDescription")}
      icon={<TimeIcon />}
    >
      {points.length ? (
        <div className="space-y-3 pt-4">
          <p className="text-theme-xs text-gray-500 dark:text-gray-400">
            {t("requests")}
          </p>
          <AnalyticsPeriodChart points={points} />
          <p className="text-center text-theme-xs text-gray-500 dark:text-gray-400">
            {t("responseTimeMs")}
          </p>
        </div>
      ) : (
        <AnalyticsEmptyState message={t("distributionUnavailable")} />
      )}
    </AnalyticsChartCard>
  );
}
