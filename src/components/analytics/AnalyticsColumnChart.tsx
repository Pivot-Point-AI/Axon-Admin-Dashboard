"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import type { DistributionRow } from "./analyticsData";
import { chartColors } from "./analyticsChartData";

interface AnalyticsColumnChartProps {
  rows: DistributionRow[];
  label: (key: string) => string;
  color?: (key: string, index: number) => string;
  tall?: boolean;
}

export default function AnalyticsColumnChart({
  rows,
  label,
  color,
  tall = false,
}: AnalyticsColumnChartProps) {
  const format = useFormatter();
  const t = useTranslations("analytics");
  const [active, setActive] = useState<string | null>(null);
  const selected = rows.find((row) => row.key === active);
  const max = Math.max(1, ...rows.map((row) => row.count));
  const dense = rows.length > 10;
  const labelEvery = dense ? Math.ceil(rows.length / 8) : 1;
  return (
    <div onPointerLeave={() => setActive(null)}>
      <div
        role="status"
        className="mb-2 flex min-h-9 items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-theme-xs dark:bg-gray-800/60"
      >
        <span className="min-w-0 break-words text-gray-500 dark:text-gray-400">
          {selected ? label(selected.key) : t("design.inspectChart")}
        </span>
        {selected && (
          <span className="shrink-0 font-semibold text-gray-950 tabular-nums dark:text-white/90">
            {format.number(selected.count)}
          </span>
        )}
      </div>
      <div className="custom-scrollbar overflow-x-auto pb-2">
        <div
          className="relative pt-2"
          style={{ minWidth: `${rows.length * (dense ? 1.25 : 2.5)}rem` }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-2 flex h-48 flex-col justify-between"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="border-t border-gray-100 dark:border-gray-800"
              />
            ))}
          </div>
          <div
            key={rows.map((row) => row.count).join()}
            className={`axon-reveal-up relative flex ${tall ? "h-72" : "h-48"} items-end px-2 ${dense ? "gap-1.5" : "gap-3"}`}
          >
            {rows.map((row, index) => (
              <div
                key={row.key}
                tabIndex={0}
                role="img"
                aria-label={`${label(row.key)}: ${format.number(row.count)}`}
                onFocus={() => setActive(row.key)}
                onBlur={() => setActive(null)}
                onPointerEnter={() => setActive(row.key)}
                onPointerDown={() => setActive(row.key)}
                className="group relative flex h-full min-w-0 flex-1 items-end justify-center rounded outline-offset-4 focus-visible:outline-2 focus-visible:outline-brand-400"
              >
                <div
                  className="w-full max-w-10 rounded-t-md opacity-90 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                  style={{
                    height: `${(row.count / max) * 100}%`,
                    background:
                      color?.(row.key, index) ??
                      chartColors[index % chartColors.length],
                  }}
                />
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="relative mx-2 mt-3 h-5">
            {rows
              .map((row, index) => ({ row, index }))
              .filter(
                ({ index }) =>
                  index % labelEvery === 0 || index === rows.length - 1,
              )
              .map(({ row, index }) => (
                <span
                  key={row.key}
                  title={label(row.key)}
                  className={`absolute text-theme-xs whitespace-nowrap text-gray-500 dark:text-gray-400 ${index === 0 || index === rows.length - 1 ? "" : "-translate-x-1/2 rtl:translate-x-1/2"}`}
                  style={
                    index === 0
                      ? { insetInlineStart: 0 }
                      : index === rows.length - 1
                        ? { insetInlineEnd: 0 }
                        : {
                            insetInlineStart: `${((index + 0.5) / rows.length) * 100}%`,
                          }
                  }
                >
                  {label(row.key)}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
