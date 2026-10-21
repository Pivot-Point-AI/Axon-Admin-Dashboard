"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import { journeyChartRows, journeySeries } from "./analyticsJourneyData";

interface AnalyticsJourneyChartProps {
  value: unknown;
}
export default function AnalyticsJourneyChart({
  value,
}: AnalyticsJourneyChartProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const [expanded, setExpanded] = useState(false);
  const rows = journeyChartRows(value);
  const series = journeySeries.filter(({ key }) =>
    rows.some((row) => row.values[key] !== null),
  );
  if (!series.length) return <AnalyticsEmptyState />;
  const outcomes = series.filter(({ key }) => key !== "total");
  const max = Math.max(
    1,
    ...rows.flatMap((row) => [
      row.values.total ?? 0,
      outcomes.reduce((sum, { key }) => sum + (row.values[key] ?? 0), 0),
    ]),
  );
  const label = (key: string) => t(`columns.${key}`);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-theme-xs text-gray-600 dark:text-gray-400">
        {series.map(({ key, color }) => (
          <span key={key} className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ background: color }}
            />
            {label(key)}
          </span>
        ))}
      </div>
      {(expanded ? rows : rows.slice(0, 5)).map((row, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
        >
          <p className="min-w-0 text-theme-xs font-medium text-gray-800 capitalize sm:w-40 sm:shrink-0 dark:text-gray-200">
            {row.label}
          </p>
          <div
            role="img"
            aria-label={`${row.label}: ${series.map(({ key }) => `${label(key)} ${row.values[key] === null ? "—" : format.number(row.values[key]!)}`).join(", ")}`}
            className="min-w-0 flex-1 space-y-1.5"
          >
            {series.some(({ key }) => key === "total") && (
              <div
                aria-hidden="true"
                className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <div
                  className="h-full rounded-full bg-brand-500 dark:bg-brand-400"
                  style={{ width: `${((row.values.total ?? 0) / max) * 100}%` }}
                />
              </div>
            )}
            {outcomes.length > 0 && (
              <div
                aria-hidden="true"
                className="flex h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
              >
                {outcomes.map(({ key, color }) => (
                  <span
                    key={key}
                    className="h-full shrink-0 border-e border-white/70 last:border-0 dark:border-gray-900"
                    style={{
                      width: `${((row.values[key] ?? 0) / max) * 100}%`,
                      background: color,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <dl className="flex shrink-0 items-center gap-3 sm:gap-4">
            {series.map(({ key, color }) => (
              <div key={key}>
                <dt className="sr-only">{label(key)}</dt>
                <dd
                  className="min-w-6 text-end text-theme-xs font-semibold tabular-nums"
                  style={{ color }}
                >
                  {row.values[key] === null
                    ? "—"
                    : format.number(row.values[key]!)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      {rows.length > 5 && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="inline-flex min-h-9 items-center rounded-lg px-3 text-theme-xs font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
        >
          {t(expanded ? "design.showLess" : "design.showAll")}
        </button>
      )}
    </div>
  );
}
