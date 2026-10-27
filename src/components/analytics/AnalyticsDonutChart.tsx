"use client";

import CountUpText from "@/components/common/CountUpText";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsSliceHover from "./AnalyticsSliceHover";
import AnalyticsSliceLabels from "./AnalyticsSliceLabels";
import { useFormatter, useTranslations } from "next-intl";
import type { DistributionRow } from "./analyticsData";
import { chartColors } from "./analyticsChartData";

interface AnalyticsDonutChartProps {
  rows: DistributionRow[];
  variant?: "donut" | "pie";
  total?: number;
  label: (key: string) => string;
  expanded?: boolean;
  /** Hide the built-in legend, for windows that list the entries beside it. */
  legend?: boolean;
  large?: boolean;
  color?: (key: string, index: number) => string;
}

export default function AnalyticsDonutChart({
  rows,
  variant = "donut",
  total: reportedTotal,
  label,
  expanded = false,
  legend = true,
  large = false,
  color,
}: AnalyticsDonutChartProps) {
  const format = useFormatter();
  const t = useTranslations("analytics");
  const sum = rows.reduce((value, row) => value + row.count, 0);
  const total = Math.max(sum, reportedTotal ?? 0);
  if (total <= 0) return <AnalyticsEmptyState />;
  const segments = rows.reduce(
    (result, row, index) => {
      const end = result.angle + (total > 0 ? (row.count / total) * 360 : 0);
      const gap =
        rows.filter((entry) => entry.count > 0).length > 1 &&
        end - result.angle > 4
          ? 1
          : 0;
      return {
        angle: end,
        stops: [
          ...result.stops,
          ...(gap
            ? [`transparent ${result.angle}deg ${result.angle + gap}deg`]
            : []),
          `${color?.(row.key, index) ?? chartColors[index % chartColors.length]} ${result.angle + gap}deg ${end}deg`,
        ],
      };
    },
    { angle: 0, stops: [] as string[] },
  );
  const stops = [
    ...segments.stops,
    `var(--color-gray-100) ${segments.angle}deg 360deg`,
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-3">
      <div
        key={rows.map((row) => row.count).join(",")}
        aria-hidden="true"
        className={`axon-pie-sweep relative flex ${large ? "size-72 sm:size-80" : "size-52"} shrink-0 items-center justify-center rounded-full shadow-theme-md ring-4 ring-gray-100 dark:ring-gray-800`}
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
      >
        <AnalyticsSliceLabels
          rows={rows}
          total={total}
          radius={variant === "donut" ? 0.72 : 0.62}
          label={variant === "pie" ? label : undefined}
        />
        <AnalyticsSliceHover
          rows={rows}
          total={total}
          label={label}
          hole={variant === "donut" ? 0.46 : 0}
        />
        {variant === "donut" && (
          <div className="absolute inset-[27%] flex flex-col items-center justify-center rounded-full bg-white dark:bg-gray-900">
            <span className="text-lg font-semibold text-gray-950 tabular-nums dark:text-white">
              <CountUpText text={format.number(total)} />
            </span>
            <span className="text-theme-xs text-gray-500 dark:text-gray-400">
              {t("columns.total")}
            </span>
          </div>
        )}
      </div>
      {legend && (
        <dl className="min-w-40 flex-1 divide-y divide-gray-100 dark:divide-gray-800">
          {(expanded ? rows : rows.slice(0, 6)).map((row, index) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-3 py-3"
            >
              <dt className="flex min-w-0 items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    background:
                      color?.(row.key, index) ??
                      chartColors[index % chartColors.length],
                  }}
                />
                <span className="break-words">{label(row.key)}</span>
              </dt>
              <dd className="flex shrink-0 items-baseline gap-3 text-sm font-semibold text-gray-950 tabular-nums dark:text-gray-100">
                {format.number(row.count)}
                {row.percentage !== null && (
                  <span className="text-theme-xs font-normal text-gray-500 dark:text-gray-400">
                    {format.number(row.percentage / 100, {
                      style: "percent",
                      maximumFractionDigits: 1,
                    })}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
