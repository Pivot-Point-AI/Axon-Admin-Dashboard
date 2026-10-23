"use client";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import { useTranslations } from "next-intl";
import { ChartBarsIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsGroupedColumns from "./AnalyticsGroupedColumns";
import { telemetryDistribution } from "./analyticsTelemetryData";

interface AnalyticsActivityColumnsProps {
  field: "stt_events" | "token_usage";
  value: unknown;
}
const colors = [
  "brand-500",
  "theme-purple-500",
  "blue-light-400",
  "success-500",
];
export default function AnalyticsActivityColumns({
  field,
  value,
}: AnalyticsActivityColumnsProps) {
  const t = useTranslations("analytics.telemetry");
  const rows = telemetryDistribution(value);
  const stt = field === "stt_events";
  const label = (key: string) =>
    t.has(`${stt ? "events" : "tokens"}.${key}`)
      ? t(`${stt ? "events" : "tokens"}.${key}`)
      : key.replaceAll("_", " ");
  const color = (key: string, index: number) =>
    stt
      ? ({
          transcribed: "brand-500",
          empty: "theme-purple-500",
          failed: "orange-400",
          garbage_dropped: "success-500",
        }[key] ?? colors[index % colors.length])
      : colors[index % colors.length];
  return (
    <AnalyticsChartCard
      title={t(stt ? "speechTitle" : "tokensTitle")}
      description={t(stt ? "speechDescription" : "tokensDescription")}
      icon={<ChartBarsIcon />}
      actions={<AnalyticsJourneyPeriod />}
    >
      {stt && (
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-theme-xs text-gray-500 dark:text-gray-400">
          {rows.map((row, index) => (
            <span key={row.key} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{
                  backgroundColor: `var(--color-${color(row.key, index)})`,
                }}
              />
              {label(row.key)}
            </span>
          ))}
        </div>
      )}
      <AnalyticsGroupedColumns
        axisSteps={stt ? 5 : 4}
        rows={rows.map((row) => ({
          key: row.key,
          label: label(row.key),
          values: { count: row.count },
        }))}
        series={[{ key: "count", label: t("total"), token: "brand-500" }]}
        color={color}
        legend={false}
      />
    </AnalyticsChartCard>
  );
}
