"use client";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
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

export default function AnalyticsPerformanceDistribution({
  data,
}: AnalyticsPerformanceDistributionProps) {
  const t = useTranslations("analytics.telemetry");
  const tInfo = useTranslations("analytics.design.info");
  const points = useMemo(() => responseHistogram(data), [data]);

  return (
    <AnalyticsChartCard
      title={t("distributionTitle")}
      info={tInfo("distribution")}
      description={t("distributionDescription")}
      icon={<TimeIcon />}
      actions={<AnalyticsJourneyPeriod />}
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
        <AnalyticsEmptyState />
      )}
    </AnalyticsChartCard>
  );
}
