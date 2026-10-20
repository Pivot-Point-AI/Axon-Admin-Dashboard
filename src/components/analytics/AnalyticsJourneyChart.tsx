"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { analyticsNumber, analyticsTableRows } from "./analyticsData";
import { chartColors } from "./analyticsChartData";

interface AnalyticsJourneyChartProps {
  value: unknown;
}

const countKeys = new Set([
  "value",
  "count",
  "total",
  "initialized",
  "started",
  "completed",
  "cancelled",
  "failed",
  "abandoned",
  "total_initialized_flows",
  "total_completed_flows",
  "total_cancelled_flows",
  "total_failed_flows",
  "total_abandoned_flows",
]);

export default function AnalyticsJourneyChart({
  value,
}: AnalyticsJourneyChartProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const [expanded, setExpanded] = useState(false);
  const rows = analyticsTableRows(value);
  const fields = [
    ...new Set(
      rows.flatMap((row) =>
        Object.keys(row).filter(
          (key) => countKeys.has(key) && analyticsNumber(row[key]) !== null,
        ),
      ),
    ),
  ];
  if (!fields.length) return null;
  const max = Math.max(
    1,
    ...rows.flatMap((row) =>
      fields.map((field) => analyticsNumber(row[field]) ?? 0),
    ),
  );
  const label = (key: string) =>
    t.has(`columns.${key}`)
      ? t(`columns.${key}`)
      : t.has(`fields.${key}`)
        ? t(`fields.${key}`)
        : key.replaceAll("_", " ");
  return (
    <div className="mb-6 space-y-5 border-b border-gray-100 pb-5 dark:border-gray-800">
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-theme-xs text-gray-600 dark:text-gray-400">
        {fields.map((field, index) => (
          <span key={field} className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ background: chartColors[index % chartColors.length] }}
            />
            {label(field)}
          </span>
        ))}
      </div>
      {(expanded ? rows : rows.slice(0, 6)).map((row, index) => (
        <div key={index}>
          <p className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
            {String(
              row.flow_type ?? row.name ?? row.type ?? index + 1,
            ).replaceAll("_", " ")}
          </p>
          <dl className="space-y-2">
            {fields.map((field, series) => {
              const count = analyticsNumber(row[field]);
              if (count === null || count < 0) return null;
              return (
                <div key={field} className="flex items-center gap-3">
                  <dt className="sr-only">{label(field)}</dt>
                  <dd
                    className="flex flex-1 items-center gap-3"
                    aria-label={`${label(field)}: ${format.number(count)}`}
                  >
                    <span
                      aria-hidden="true"
                      className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-800"
                    >
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${(count / max) * 100}%`,
                          background: chartColors[series % chartColors.length],
                        }}
                      />
                    </span>
                    <span className="w-12 shrink-0 text-end text-theme-xs font-semibold text-gray-900 tabular-nums dark:text-gray-100">
                      {format.number(count)}
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}
      {rows.length > 6 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-theme-xs font-semibold text-brand-600 dark:text-brand-300"
        >
          {t(expanded ? "design.showLess" : "design.showAll")}
        </button>
      )}
    </div>
  );
}
