"use client";

import AnalyticsCardScope from "./AnalyticsCardScope";
import AnalyticsQualityPie from "./AnalyticsQualityPie";
import AnalyticsSafetyTrend from "./AnalyticsSafetyTrend";

interface AnalyticsQualityProps {
  data: Record<string, unknown>;
}

export default function AnalyticsQuality({ data }: AnalyticsQualityProps) {
  return (
    <div className="space-y-4">
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <AnalyticsCardScope section="nlp" data={data}>
          {(d) => (
            <AnalyticsQualityPie
              field="intent_confidence_buckets"
              value={d.intent_confidence_buckets}
            />
          )}
        </AnalyticsCardScope>
        <AnalyticsCardScope section="nlp" data={data}>
          {(d) => <AnalyticsSafetyTrend data={d} />}
        </AnalyticsCardScope>
      </div>
      <AnalyticsCardScope section="nlp" data={data}>
        {(d) => (
          <AnalyticsQualityPie
            field="intent_distribution"
            value={d.intent_distribution}
          />
        )}
      </AnalyticsCardScope>
    </div>
  );
}
