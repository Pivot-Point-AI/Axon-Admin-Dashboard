"use client";

import { useTranslations } from "next-intl";
import AnalyticsDataTable from "./AnalyticsDataTable";
import AnalyticsDetails from "./AnalyticsDetails";
import AnalyticsDuration from "./AnalyticsDuration";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsLatencyChart from "./AnalyticsLatencyChart";
import { latencyData } from "./analyticsLatencyData";

interface AnalyticsLatencyCardProps {
  field: string;
  value: unknown;
}

export default function AnalyticsLatencyCard({
  field,
  value,
}: AnalyticsLatencyCardProps) {
  const t = useTranslations("analytics.latency");
  const timing = latencyData(value);
  if (!timing.hasData)
    return <AnalyticsEmptyState message={t("timingUnavailable")} />;
  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="min-w-0 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("distributionTitle", { stage: t(`titles.${field}`) })}
          </h3>
          <p className="mt-1 mb-5 text-theme-xs leading-5 text-gray-500 dark:text-gray-400">
            {t("distributionDescription")}
          </p>
          <AnalyticsLatencyChart value={value} />
        </div>
        <aside className="rounded-lg border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/30">
          <h4 className="mb-3 text-theme-xs font-semibold text-gray-700 dark:text-gray-300">
            {t("atAGlance")}
          </h4>
          <dl className="divide-y divide-gray-200/70 dark:divide-gray-700">
            {[
              { key: "fastest", value: timing.minimum },
              { key: "slowest", value: timing.maximum },
            ].map(
              ({ key, value }) =>
                value !== null && (
                  <div
                    key={key}
                    className="flex items-baseline justify-between gap-3 py-2.5"
                  >
                    <dt className="text-theme-xs text-gray-500 dark:text-gray-400">
                      {t(key)}
                    </dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <AnalyticsDuration milliseconds={value} />
                    </dd>
                  </div>
                ),
            )}
          </dl>
          {timing.count !== null && (
            <p className="mt-3 text-theme-xs text-gray-500 dark:text-gray-400">
              {t("measurements", { count: timing.count })}
            </p>
          )}
          <p className="mt-3 text-theme-xs leading-5 text-gray-500 dark:text-gray-400">
            {t(`descriptions.${field}`)}
          </p>
        </aside>
      </div>
      <AnalyticsDetails label={t("viewDetails")}>
        <p className="mb-3 text-theme-xs text-gray-500 dark:text-gray-400">
          {t("rawUnits")}
        </p>
        <AnalyticsDataTable field={field} value={value} embedded />
      </AnalyticsDetails>
    </div>
  );
}
