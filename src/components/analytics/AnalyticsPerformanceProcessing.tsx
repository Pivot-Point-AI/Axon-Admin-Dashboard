"use client";
import { useTranslations } from "next-intl";
import { ChartBarsIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsDataTable from "./AnalyticsDataTable";
import AnalyticsGroupedColumns from "./AnalyticsGroupedColumns";
import { performanceStages } from "./analyticsTelemetryData";

interface AnalyticsPerformanceProcessingProps {
  data: Record<string, unknown>;
  reportDate: string;
}
export default function AnalyticsPerformanceProcessing({
  data,
  reportDate,
}: AnalyticsPerformanceProcessingProps) {
  const t = useTranslations("analytics.telemetry");
  const stages = performanceStages(data);
  return (
    <AnalyticsChartCard
      title={t("processingTitle")}
      description={t("processingDescription")}
      icon={<ChartBarsIcon />}
      actions={
        <span className="inline-flex h-8 items-center rounded-lg border border-brand-100 px-3 text-theme-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
          {reportDate}
        </span>
      }
      detailsLabel={t("timingDetails")}
      details={
        <div className="space-y-4">
          {[
            "end_to_end_latency_ms",
            "stt_transcription_latency_ms",
            "llm_generation_latency_ms",
          ].map((field) => (
            <AnalyticsDataTable
              key={field}
              field={field}
              value={data[field]}
              embedded
            />
          ))}
        </div>
      }
    >
      <AnalyticsGroupedColumns
        axisSteps={4}
        fractional
        rows={stages.map((stage) => ({
          key: stage.key,
          label: t(`stages.${stage.key}`),
          values: { average: stage.average, p95: stage.p95 },
        }))}
        series={[
          { key: "average", label: t("averageMs"), token: "brand-500" },
          { key: "p95", label: t("p95Ms"), token: "theme-purple-500" },
        ]}
      />
    </AnalyticsChartCard>
  );
}
