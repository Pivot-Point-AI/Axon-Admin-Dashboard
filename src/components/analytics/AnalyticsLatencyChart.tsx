"use client";

import { useFormatter, useTranslations } from "next-intl";
import { analyticsNumber, asAnalyticsRecord } from "./analyticsData";
import { chartColors } from "./analyticsChartData";

interface AnalyticsLatencyChartProps {
  value: unknown;
}

export default function AnalyticsLatencyChart({
  value,
}: AnalyticsLatencyChartProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const data = asAnalyticsRecord(value);
  const rows = ["avg", "average", "p50", "p90", "p95", "p99"].flatMap((key) => {
    const count = analyticsNumber(data[key]);
    return count !== null && count >= 0 ? [{ key, count }] : [];
  });
  if (!rows.length) return null;
  const minimum = Math.min(
    analyticsNumber(data.min) ?? 0,
    ...rows.map((row) => row.count),
  );
  const maximum = Math.max(
    analyticsNumber(data.max) ?? 0,
    ...rows.map((row) => row.count),
  );
  return (
    <div className="mb-5 rounded-xl bg-brand-25 p-4 dark:bg-brand-500/5">
      <div
        aria-hidden="true"
        className="mb-4 flex justify-between text-theme-xs text-gray-500 dark:text-gray-400"
      >
        <span>
          {format.number(minimum)} {t("design.milliseconds")}
        </span>
        <span>
          {format.number(maximum)} {t("design.milliseconds")}
        </span>
      </div>
      <dl className="space-y-4">
        {rows.map((row, index) => (
          <div key={row.key} className="flex items-center gap-3">
            <dt className="w-12 shrink-0 text-theme-xs font-medium text-gray-600 dark:text-gray-400">
              {t(`columns.${row.key}`)}
            </dt>
            <dd className="flex min-w-0 flex-1 items-center gap-3">
              <span
                aria-hidden="true"
                className="relative h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"
              >
                <span
                  className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full ring-2 ring-white dark:ring-gray-900"
                  style={{
                    insetInlineStart: `calc(${maximum > minimum ? ((row.count - minimum) / (maximum - minimum)) * 100 : 0}% - 0.375rem)`,
                    background: chartColors[index % chartColors.length],
                  }}
                />
              </span>
              <span className="w-16 shrink-0 text-end text-theme-xs font-semibold text-gray-900 tabular-nums dark:text-gray-100">
                {format.number(row.count, { maximumFractionDigits: 2 })}{" "}
                {t("design.milliseconds")}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
