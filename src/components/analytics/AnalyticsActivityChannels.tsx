"use client";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import { useFormatter, useTranslations } from "next-intl";
import { PieChartIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsRing from "./AnalyticsRing";
import { telemetryDistribution } from "./analyticsTelemetryData";

interface AnalyticsActivityChannelsProps {
  value: unknown;
}
export default function AnalyticsActivityChannels({
  value,
}: AnalyticsActivityChannelsProps) {
  const t = useTranslations("analytics.telemetry");
  const format = useFormatter();
  const rows = telemetryDistribution(value).filter(
    (row) => !["total", "total_count"].includes(row.key),
  );
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const color = (key: string, index: number) =>
    ["voice", "audio"].includes(key)
      ? "brand-600"
      : key === "text"
        ? "blue-light-400"
        : ["brand-600", "blue-light-400", "success-500"][index % 3];
  const label = (key: string) =>
    t.has(`labels.${key}`) ? t(`labels.${key}`) : key.replaceAll("_", " ");
  return (
    <AnalyticsChartCard
      title={t("channelsTitle")}
      description={t("channelsDescription")}
      icon={<PieChartIcon />}
      actions={<AnalyticsJourneyPeriod />}
    >
      {!rows.length ? (
        <AnalyticsEmptyState />
      ) : (
        <div className="flex min-h-56 flex-col items-center justify-center gap-5 sm:flex-row">
          <AnalyticsRing
            rows={rows}
            total={total}
            label={t("total")}
            color={color}
            nameOf={label}
            size="lg"
          />
          <dl className="w-full min-w-0 flex-1 divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row, index) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-3 py-3 text-theme-xs"
              >
                <dt className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: `var(--color-${color(row.key, index)})`,
                    }}
                  />
                  {label(row.key)}
                </dt>
                <dd className="flex items-center gap-4 tabular-nums">
                  <span className="font-semibold text-gray-950 dark:text-gray-100">
                    {format.number(row.count)}
                  </span>
                  <span className="w-11 text-end text-gray-500 dark:text-gray-400">
                    {format.number(total > 0 ? row.count / total : 0, {
                      style: "percent",
                      maximumFractionDigits: 1,
                    })}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </AnalyticsChartCard>
  );
}
