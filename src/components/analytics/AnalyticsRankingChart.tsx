"use client";

import { useFormatter } from "next-intl";
import AnalyticsEmptyState from "./AnalyticsEmptyState";

interface AnalyticsRankingChartProps {
  rows: { key: string; count: number }[];
  label: (key: string) => string;
  color: (key: string, index: number) => string;
  unit?: string;
  shares?: boolean;
}

export default function AnalyticsRankingChart({
  rows,
  label,
  color,
  unit,
  shares = false,
}: AnalyticsRankingChartProps) {
  const format = useFormatter();
  if (!rows.length) return <AnalyticsEmptyState />;
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const scale = shares
    ? total
    : Math.max(0, ...rows.map((row) => row.count)) * 1.1;
  return (
    <dl className="space-y-6 py-3">
      {rows.map((row, index) => (
        <div
          key={row.key}
          className="grid grid-cols-12 items-center gap-x-3 gap-y-2"
        >
          <dt className="col-span-7 min-w-0 text-theme-xs break-words text-gray-600 sm:col-span-3 dark:text-gray-300">
            {label(row.key)}
          </dt>
          <dd className="col-span-5 flex items-center justify-end gap-2 text-theme-xs tabular-nums sm:col-span-3 sm:col-start-10 sm:row-start-1">
            <span className="font-semibold text-gray-950 dark:text-gray-100">
              {format.number(row.count, { maximumFractionDigits: 2 })}
              {unit && (
                <span className="ms-1 font-normal text-gray-500 dark:text-gray-400">
                  {unit}
                </span>
              )}
            </span>
            {shares && (
              <span className="w-11 text-end text-gray-500 dark:text-gray-400">
                {format.number(total > 0 ? row.count / total : 0, {
                  style: "percent",
                  maximumFractionDigits: 1,
                })}
              </span>
            )}
          </dd>
          <div
            aria-hidden="true"
            className="col-span-12 h-3 overflow-hidden rounded-full bg-gray-100 sm:col-span-6 sm:col-start-4 sm:row-start-1 dark:bg-gray-800"
          >
            <div
              className="bg-linear-to-e h-full rounded-full from-white/15 to-transparent dark:from-white/10"
              style={{
                width: `${scale > 0 ? (row.count / scale) * 100 : 0}%`,
                backgroundColor: `var(--color-${color(row.key, index)})`,
              }}
            />
          </div>
        </div>
      ))}
    </dl>
  );
}
