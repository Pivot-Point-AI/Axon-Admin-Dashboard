"use client";
import { useTranslations } from "next-intl";
import { TableIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsDataTable from "./AnalyticsDataTable";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsRankingChart from "./AnalyticsRankingChart";
import AnalyticsTrendChart from "./AnalyticsTrendChart";
import { analyticsTableRows } from "./analyticsData";
import { telemetryHistory } from "./analyticsTelemetryData";

interface AnalyticsActivityErrorsProps {
  data: Record<string, unknown>;
}
const colors = {
  api: "orange-400",
  validation: "theme-purple-500",
  timeout: "brand-500",
  others: "gray-400",
};
export default function AnalyticsActivityErrors({
  data,
}: AnalyticsActivityErrorsProps) {
  const t = useTranslations("analytics.telemetry");
  const errors = analyticsTableRows(data.errors);
  const counts: Record<string, number> = {
    api: 0,
    validation: 0,
    timeout: 0,
    others: 0,
  };
  for (const row of errors) {
    const type = String(
      row.error_type ?? row.type ?? row.category ?? "",
    ).toLowerCase();
    const key = type.includes("timeout")
      ? "timeout"
      : type.includes("validation")
        ? "validation"
        : type.includes("api")
          ? "api"
          : "others";
    counts[key]++;
  }
  const rows = Array.isArray(data.errors)
    ? Object.entries(counts).map(([key, count]) => ({ key, count }))
    : [];
  const history = telemetryHistory(data.error_trend ?? data.errors_trend, [
    "total",
    "api",
    "validation",
    "timeout",
  ]);
  return (
    <AnalyticsChartCard
      title={t("errorsTitle")}
      description={t("errorsDescription")}
      icon={<TableIcon />}
      details={
        errors.length ? (
          <AnalyticsDataTable field="errors" value={data.errors} embedded />
        ) : undefined
      }
    >
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          {history.length ? (
            <AnalyticsTrendChart
              title={t("errorsTitle")}
              points={history}
              curve="straight"
              series={[
                {
                  key: "total",
                  label: t("errorLabels.total"),
                  token: "error-500",
                },
                {
                  key: "api",
                  label: t("errorLabels.api"),
                  token: "orange-400",
                },
                {
                  key: "validation",
                  label: t("errorLabels.validation"),
                  token: "theme-purple-500",
                },
                {
                  key: "timeout",
                  label: t("errorLabels.timeout"),
                  token: "brand-500",
                },
              ]}
            />
          ) : (
            <AnalyticsEmptyState
              message={
                Array.isArray(data.errors) && !errors.length
                  ? t("noErrors")
                  : t("historyUnavailable")
              }
            />
          )}
        </div>
        <div className="min-w-0 rounded-xl border border-gray-100 px-3 py-2 dark:border-gray-800">
          <h3 className="mb-2 text-theme-xs font-semibold text-gray-800 dark:text-gray-200">
            {t("errorDistribution")}
          </h3>
          <AnalyticsRankingChart
            rows={rows}
            label={(key) => t(`errorLabels.${key}`)}
            color={(key) => colors[key as keyof typeof colors]}
            shares
          />
        </div>
      </div>
    </AnalyticsChartCard>
  );
}
