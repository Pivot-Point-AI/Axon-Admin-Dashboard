"use client";

import { useFormatter } from "next-intl";
import AnalyticsJourneyPlot from "./AnalyticsJourneyPlot";
import AnalyticsEmptyState from "./AnalyticsEmptyState";

export interface AnalyticsColumnSeries {
  key: string;
  label: string;
  token: string;
}
export interface AnalyticsColumnGroup {
  key: string;
  label: string;
  values: Record<string, number | null>;
}
interface AnalyticsGroupedColumnsProps {
  rows: AnalyticsColumnGroup[];
  series: AnalyticsColumnSeries[];
  color?: (key: string, index: number) => string;
  legend?: boolean;
  fractional?: boolean;
  axisSteps?: number;
}

export default function AnalyticsGroupedColumns({
  rows,
  series,
  color,
  legend = true,
  fractional = false,
  axisSteps = 5,
}: AnalyticsGroupedColumnsProps) {
  const format = useFormatter();
  const reported = rows.flatMap((row) =>
    series.flatMap(({ key }) =>
      row.values[key] == null ? [] : [row.values[key]],
    ),
  );
  if (!reported.length) return <AnalyticsEmptyState />;
  const maximum = Math.max(1, ...reported.map((value) => value ?? 0));
  const magnitude = 10 ** Math.floor(Math.log10(maximum / axisSteps));
  const step =
    [1, 2, 5, 10]
      .map((value) => value * magnitude)
      .find((value) => value >= maximum / axisSteps) ?? magnitude * 10;
  const limit = step * axisSteps;
  const number = (value: number) =>
    format.number(value, { maximumFractionDigits: fractional ? 2 : 0 });
  return (
    <div className="space-y-3">
      {legend && series.length > 1 && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-theme-xs text-gray-500 dark:text-gray-400">
          {series.map((item) => (
            <span key={item.key} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: `var(--color-${item.token})` }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
      <div className="custom-scrollbar overflow-x-auto pt-2 pb-1">
        <div
          style={{
            minWidth: `${Math.max(16, rows.length * (series.length > 1 ? (fractional ? 7 : 5) : 3))}rem`,
          }}
        >
          <AnalyticsJourneyPlot
            ticks={Array.from(
              { length: axisSteps + 1 },
              (_, index) => step * (axisSteps - index),
            )}
            label={(value) =>
              format.number(value, {
                notation: "compact",
                maximumFractionDigits: 1,
              })
            }
          >
            <div
              className="relative grid h-full"
              style={{
                gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`,
              }}
            >
              {rows.map((row, index) => (
                <div
                  key={row.key}
                  className="flex h-full min-w-0 items-end justify-center gap-1 px-1"
                >
                  {series.map((item, seriesIndex) => {
                    const value = row.values[item.key];
                    return (
                      <div
                        key={item.key}
                        role="img"
                        tabIndex={0}
                        aria-label={`${row.label}, ${item.label}: ${value == null ? "—" : number(value)}`}
                        className={`bg-linear-to-e relative w-full rounded-ss-sm rounded-se-sm from-white/15 to-transparent outline-offset-2 focus-visible:outline-2 focus-visible:outline-brand-400 dark:from-white/10 ${series.length === 1 ? "max-w-12" : "max-w-9"}`}
                        style={{
                          height: `${((value ?? 0) / limit) * 100}%`,
                          backgroundColor: `var(--color-${color?.(row.key, index) ?? item.token})`,
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute bottom-full mb-1 text-theme-xs font-semibold whitespace-nowrap text-gray-950 tabular-nums dark:text-gray-100 ${series.length === 2 ? (seriesIndex === 0 ? "end-0" : "start-0") : "start-1/2 -translate-x-1/2 rtl:translate-x-1/2"}`}
                        >
                          {value == null ? "—" : number(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </AnalyticsJourneyPlot>
          <div
            aria-hidden="true"
            className="mt-3 grid ps-8 text-center text-theme-xs leading-4 text-gray-500 dark:text-gray-400"
            style={{
              gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`,
            }}
          >
            {rows.map((row) => (
              <span key={row.key} className="px-1 break-words">
                {row.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
