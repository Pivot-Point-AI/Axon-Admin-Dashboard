"use client";
import { blocksInfo } from "./analyticsTrends";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import { useFormatter, useTranslations } from "next-intl";
import { ChartBarsIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsDonutChart from "./AnalyticsDonutChart";
import AnalyticsViewAll from "./AnalyticsViewAll";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
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
const palette = [
  "brand-600",
  "blue-light-500",
  "success-500",
  "theme-purple-500",
  "orange-400",
  "brand-400",
  "blue-light-400",
  "success-600",
];
export default function AnalyticsActivityActions({
  data,
}: AnalyticsActivityActionsProps) {
  const t = useTranslations("analytics.telemetry");
  const tInfo = useTranslations("analytics.design.info");
  const rows = telemetryDistribution(data.dispatched_actions);
  const label = (key: string) =>
    t.has(`actions.${key}`) ? t(`actions.${key}`) : key.replaceAll("_", " ");
  const series = rows.map((row, index) => ({
    key: row.key,
    label: label(row.key),
    token: colors[index % colors.length],
  }));
  const common = useTranslations("analytics.design");
  const format = useFormatter();
  const ranked = [...rows].sort((a, b) => b.count - a.count);
  const total = ranked.reduce((sum, row) => sum + row.count, 0);
  const rest = ranked.slice(6).reduce((sum, row) => sum + row.count, 0);
  const share = (count: number) => (total > 0 ? (count / total) * 100 : 0);
  // Six actions keep the donut readable; the remainder is one "Others" slice
  // and View all lists every action.
  const preview = [
    ...ranked.slice(0, 6),
    ...(rest > 0 ? [{ key: "others", count: rest, percentage: null }] : []),
  ].map((row) => ({ ...row, percentage: share(row.count) }));
  const history = telemetryHistory(
    data.actions_delivered_trend ?? data.dispatched_actions_trend,
    rows.map((row) => row.key),
  );
  return (
    <AnalyticsChartCard
      title={t("actionsTitle")}
      info={
        blocksInfo(data, ["actions_delivered", "dispatched_actions"]) ??
        tInfo("actions")
      }
      description={t(
        history.length ? "actionsHistoryDescription" : "actionsDescription",
      )}
      icon={<ChartBarsIcon />}
      actions={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AnalyticsViewAll
            title={t("actionsTitle")}
            description={t("actionsDescription")}
            icon={<ChartBarsIcon />}
            columns={[common("categoryColumn"), common("countColumn"), "%"]}
            entries={ranked.map((row, index) => ({
              key: row.key,
              label: label(row.key),
              color: palette[index % palette.length],
              values: [
                format.number(row.count),
                format.number(share(row.count) / 100, {
                  style: "percent",
                  maximumFractionDigits: 1,
                }),
              ],
              bar: share(row.count) / 100,
            }))}
          >
            {ranked.length ? (
              <AnalyticsDonutChart
                rows={ranked.map((row) => ({
                  ...row,
                  percentage: share(row.count),
                }))}
                total={total}
                label={label}
                color={(_, index) =>
                  `var(--color-${palette[index % palette.length]})`
                }
                legend={false}
                large
              />
            ) : (
              <AnalyticsEmptyState />
            )}
          </AnalyticsViewAll>
          <AnalyticsJourneyPeriod />
        </div>
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
        {rows.length > 0 && (
          <AnalyticsDonutChart
            rows={preview}
            total={total}
            label={(key) => (key === "others" ? common("others") : label(key))}
            color={(key, index) =>
              key === "others"
                ? "var(--color-gray-400)"
                : `var(--color-${palette[index % palette.length]})`
            }
            expanded
          />
        )}
      </div>
    </AnalyticsChartCard>
  );
}
