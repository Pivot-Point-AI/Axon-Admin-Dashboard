"use client";
import { useTranslations } from "next-intl";
import { ChartBarsIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsDataTable from "./AnalyticsDataTable";
import AnalyticsRankingChart from "./AnalyticsRankingChart";
import AnalyticsTrendChart from "./AnalyticsTrendChart";
import {
  telemetryDistribution,
  telemetryHistory,
} from "./analyticsTelemetryData";

interface AnalyticsActivityActionsProps {
  data: Record<string, unknown>;
}
const colors = [
  "brand-500",
  "theme-purple-500",
  "blue-light-400",
  "success-500",
];
export default function AnalyticsActivityActions({
  data,
}: AnalyticsActivityActionsProps) {
  const t = useTranslations("analytics.telemetry");
  const rows = telemetryDistribution(data.dispatched_actions);
  const label = (key: string) =>
    t.has(`actions.${key}`) ? t(`actions.${key}`) : key.replaceAll("_", " ");
  const series = rows.map((row, index) => ({
    key: row.key,
    label: label(row.key),
    token: colors[index % colors.length],
  }));
  const history = telemetryHistory(
    data.actions_delivered_trend ?? data.dispatched_actions_trend,
    rows.map((row) => row.key),
  );
  return (
    <AnalyticsChartCard
      title={t("actionsTitle")}
      description={t(
        history.length ? "actionsHistoryDescription" : "actionsDescription",
      )}
      icon={<ChartBarsIcon />}
      details={
        rows.length ? (
          <AnalyticsDataTable
            field="dispatched_actions"
            value={data.dispatched_actions}
            embedded
          />
        ) : undefined
      }
    >
      <div
        className={`grid items-center gap-6 ${history.length ? "lg:grid-cols-2" : ""}`}
      >
        {history.length > 0 && (
          <AnalyticsTrendChart
            title={t("actionsTitle")}
            points={history}
            series={series}
            curve="straight"
          />
        )}
        <AnalyticsRankingChart
          rows={rows}
          label={label}
          color={(_, index) => colors[index % colors.length]}
          shares
        />
      </div>
    </AnalyticsChartCard>
  );
}
