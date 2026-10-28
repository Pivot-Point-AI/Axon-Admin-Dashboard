"use client";
import { valueInfo } from "./analyticsTrends";
import AnalyticsCardScope from "./AnalyticsCardScope";
import { useTranslations } from "next-intl";
import { ChartBarsIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import AnalyticsPerformanceDistribution from "./AnalyticsPerformanceDistribution";
import AnalyticsRankingChart from "./AnalyticsRankingChart";
import AnalyticsReportedTrend from "./AnalyticsReportedTrend";
import AnalyticsSlowInteractions from "./AnalyticsSlowInteractions";
import { telemetryDistribution } from "./analyticsTelemetryData";

interface AnalyticsPerformanceProps {
  data: Record<string, unknown>;
}
const colors = [
  "brand-500",
  "theme-purple-500",
  "blue-light-400",
  "success-500",
];
export default function AnalyticsPerformance({
  data,
}: AnalyticsPerformanceProps) {
  const t = useTranslations("analytics.telemetry");
  const tInfo = useTranslations("analytics.design.info");
  const common = useTranslations("analytics.design");
  const label = (key: string) =>
    t.has(`stageLabels.${key}`)
      ? t(`stageLabels.${key}`)
      : key.replaceAll("_", " ");
  return (
    <div className="space-y-4">
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <AnalyticsCardScope section="performance" data={data}>
          {(d) => (
            <AnalyticsChartCard
              title={t("stageTitle")}
              info={valueInfo(d.stage_averages_ms) ?? tInfo("stage")}
              description={t("stageDescription")}
              icon={<ChartBarsIcon />}
              actions={<AnalyticsJourneyPeriod />}
            >
              <AnalyticsRankingChart
                rows={telemetryDistribution(d.stage_averages_ms)}
                label={label}
                color={(_, index) => colors[index % colors.length]}
                unit={common("milliseconds")}
              />
            </AnalyticsChartCard>
          )}
        </AnalyticsCardScope>
        <AnalyticsCardScope section="performance" data={data}>
          {(d) => (
            <AnalyticsReportedTrend
              title={t("responseTrendTitle")}
              description={t("responseTrendDescription")}
              info={valueInfo(d.response_time_trend) ?? tInfo("responseTrend")}
              source={d.response_time_trend}
              snapshot={d}
              compactAxis
              series={[
                {
                  key: "average",
                  label: t("averageResponse"),
                  token: "brand-500",
                },
                { key: "p95", label: t("p95"), token: "theme-purple-500" },
              ]}
            />
          )}
        </AnalyticsCardScope>
      </div>
      <AnalyticsCardScope section="performance" data={data}>
        {(d) => <AnalyticsPerformanceDistribution data={d} />}
      </AnalyticsCardScope>
      <AnalyticsCardScope section="performance" data={data}>
        {(d) => <AnalyticsSlowInteractions value={d.top_slowest_turns} />}
      </AnalyticsCardScope>
    </div>
  );
}
