"use client";

import { useFormatter, useTranslations } from "next-intl";
import { TimeIcon } from "@/icons";
import AnalyticsDuration from "./AnalyticsDuration";
import { latencyData } from "./analyticsLatencyData";

interface AnalyticsLatencyChartProps {
  value: unknown;
}

export default function AnalyticsLatencyChart({
  value,
}: AnalyticsLatencyChartProps) {
  const t = useTranslations("analytics.latency");
  const format = useFormatter();
  const data = latencyData(value);
  if (!data.hasData) return null;
  if (data.allZero)
    return (
      <div className="flex min-h-36 items-center justify-center gap-3 py-6">
        <TimeIcon
          aria-hidden="true"
          className="size-6 shrink-0 text-gray-400 dark:text-gray-500"
        />
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("zeroTitle")}
          </p>
          <p className="mt-1 text-theme-xs leading-5 text-gray-500 dark:text-gray-400">
            {t("zeroDescription")}
          </p>
        </div>
      </div>
    );
  if (!data.percentiles.length)
    return (
      <p className="flex min-h-36 items-center text-theme-xs text-gray-500 dark:text-gray-400">
        {t("noPercentiles")}
      </p>
    );
  return (
    <dl className="space-y-5 py-2">
      {data.percentiles.map((row) => {
        const percent = format.number(row.percentile / 100, {
          style: "percent",
        });
        return (
          <div
            key={row.percentile}
            className="flex items-center gap-3 sm:gap-5"
          >
            <dt
              className="w-24 shrink-0 text-theme-xs font-medium text-gray-600 dark:text-gray-400"
              title={t("percentileHint", { percent })}
            >
              {t(row.percentile === 50 ? "median" : "percentile", { percent })}
            </dt>
            <dd className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
              <span
                aria-hidden="true"
                className="block h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <span
                  className="block h-full rounded-full bg-chart-primary dark:bg-chart-primary"
                  style={{ width: `${(row.value / data.scale) * 100}%` }}
                />
              </span>
              <span className="w-20 shrink-0 text-end text-sm font-semibold text-gray-950 dark:text-gray-100">
                <AnalyticsDuration milliseconds={row.value} />
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
