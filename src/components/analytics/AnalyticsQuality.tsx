"use client";

import { useFormatter, useTranslations } from "next-intl";
import AnalyticsQualityColumns from "./AnalyticsQualityColumns";
import AnalyticsQualityDistribution from "./AnalyticsQualityDistribution";
import AnalyticsSafetyTrend from "./AnalyticsSafetyTrend";

interface AnalyticsQualityProps {
  data: Record<string, unknown>;
  date?: string;
}

export default function AnalyticsQuality({
  data,
  date,
}: AnalyticsQualityProps) {
  const t = useTranslations("analytics.design");
  const format = useFormatter();
  const timestamp = date ? Date.parse(date) : NaN;
  const reportDate =
    !date || date === "today"
      ? t("today")
      : Number.isFinite(timestamp)
        ? format.dateTime(timestamp, {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          })
        : date;
  return (
    <div className="space-y-4">
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <AnalyticsQualityColumns
          field="intent_confidence_buckets"
          value={data.intent_confidence_buckets}
          reportDate={reportDate}
        />
        <AnalyticsQualityDistribution
          field="fallback_reasons"
          value={data.fallback_reasons}
        />
        <AnalyticsQualityColumns
          field="guardrail_violations_by_risk"
          value={data.guardrail_violations_by_risk}
        />
        <AnalyticsSafetyTrend data={data} />
      </div>
      <AnalyticsQualityDistribution
        field="intent_distribution"
        value={data.intent_distribution}
      />
    </div>
  );
}
