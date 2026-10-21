"use client";
import { useTranslations } from "next-intl";
import { ChartBarsIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsDataTable from "./AnalyticsDataTable";
import AnalyticsPerformanceProcessing from "./AnalyticsPerformanceProcessing";
import AnalyticsPerformanceDistribution from "./AnalyticsPerformanceDistribution";
import AnalyticsRankingChart from "./AnalyticsRankingChart";
import AnalyticsReportedTrend from "./AnalyticsReportedTrend";
import AnalyticsSlowInteractions from "./AnalyticsSlowInteractions";
import { telemetryDistribution } from "./analyticsTelemetryData";

interface AnalyticsPerformanceProps {
  data: Record<string, unknown>;
  date?: string;
}
const colors = [
  "brand-500",
  "theme-purple-500",
  "blue-light-400",
  "success-500",
];
export default function AnalyticsPerformance({
  data,
  date,
}: AnalyticsPerformanceProps) {
  const t = useTranslations("analytics.telemetry");
  const common = useTranslations("analytics.design");
  const stages = telemetryDistribution(data.stage_averages_ms);
  const label = (key: string) =>
    t.has(`stageLabels.${key}`)
      ? t(`stageLabels.${key}`)
      : key.replaceAll("_", " ");
  return (
    <div className="space-y-4">
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <AnalyticsPerformanceProcessing
          data={data}
          reportDate={!date || date === "today" ? common("today") : date}
        />
        <AnalyticsPerformanceDistribution data={data} />
        <AnalyticsChartCard
          title={t("stageTitle")}
          description={t("stageDescription")}
          icon={<ChartBarsIcon />}
          details={
            stages.length ? (
              <AnalyticsDataTable
                field="stage_averages_ms"
                value={data.stage_averages_ms}
                embedded
              />
            ) : undefined
          }
        >
          <AnalyticsRankingChart
            rows={stages}
            label={label}
            color={(_, index) => colors[index % colors.length]}
            unit={common("milliseconds")}
          />
        </AnalyticsChartCard>
        <AnalyticsReportedTrend
          title={t("responseTrendTitle")}
          description={t("responseTrendDescription")}
          source={data.response_time_trend}
          field="end_to_end_latency_ms"
          compactAxis
          series={[
            { key: "average", label: t("averageResponse"), token: "brand-500" },
            { key: "p95", label: t("p95"), token: "theme-purple-500" },
          ]}
        />
      </div>
      <AnalyticsSlowInteractions value={data.top_slowest_turns} />
    </div>
  );
}
