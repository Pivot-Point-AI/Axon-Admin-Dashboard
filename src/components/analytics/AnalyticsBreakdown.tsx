"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import { distributionRows } from "./analyticsData";
import { analyticsTableRows } from "./analyticsData";
import AnalyticsDataTable from "./AnalyticsDataTable";

interface AnalyticsBreakdownProps {
  field: string;
  value: unknown;
}

export default function AnalyticsBreakdown({
  field,
  value,
}: AnalyticsBreakdownProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const [expanded, setExpanded] = useState(false);
  const ordered =
    field === "peak_activity_hours" || field === "activity_by_day_of_week";
  const rows = distributionRows(value);
  if (!ordered) rows.sort((a, b) => b.count - a.count);
  const visible = expanded || ordered ? rows : rows.slice(0, 6);
  const max = Math.max(1, ...rows.map((row) => row.count));
  const unit = field === "stage_averages_ms" ? t("design.milliseconds") : "";
  const label = (key: string) => {
    if (field === "peak_activity_hours" && /^\d+$/.test(key))
      return `${key.padStart(2, "0")}:00`;
    return t.has(`columns.${key}`)
      ? t(`columns.${key}`)
      : key.replaceAll("_", " ");
  };
  if (!rows.length && analyticsTableRows(value).length > 0)
    return <AnalyticsDataTable field={field} value={value} />;
  return (
    <ComponentCard
      title={t(`fields.${field}`)}
      description={
        t.has(`design.chartDescriptions.${field}`)
          ? t(`design.chartDescriptions.${field}`)
          : undefined
      }
      className="h-full"
    >
      {!rows.length ? (
        <AnalyticsEmptyState />
      ) : ordered ? (
        <div>
          <div className="flex h-48 items-end gap-1.5 border-b border-gray-100 pt-6 sm:gap-2.5 dark:border-gray-800">
            {visible.map((row) => (
              <div
                key={row.key}
                className="group flex h-full min-w-0 flex-1 flex-col justify-end"
                title={`${label(row.key)}: ${format.number(row.count)}`}
              >
                <div
                  aria-label={`${label(row.key)}: ${format.number(row.count)}`}
                  tabIndex={0}
                  className="relative min-h-0 rounded-t-sm bg-brand-200 outline-offset-4 transition-colors hover:bg-brand-500 focus:bg-brand-500 focus:outline-brand-400 dark:bg-brand-700 dark:hover:bg-brand-400 dark:focus:bg-brand-400"
                  style={{
                    height: `${(row.count / max) * 100}%`,
                    minHeight: row.count > 0 ? "0.25rem" : undefined,
                  }}
                >
                  <span className="pointer-events-none absolute start-1/2 bottom-full mb-2 -translate-x-1/2 rounded bg-gray-900 px-1.5 py-1 text-theme-xs text-white opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 rtl:translate-x-1/2 dark:bg-gray-100 dark:text-gray-900">
                    {format.number(row.count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="mt-3 flex justify-between gap-1 text-theme-xs text-gray-400 dark:text-gray-500"
          >
            {visible
              .filter(
                (_, index) =>
                  visible.length <= 7 ||
                  index % 4 === 0 ||
                  index === visible.length - 1,
              )
              .map((row) => (
                <span key={row.key}>
                  {label(row.key).slice(
                    0,
                    field === "activity_by_day_of_week" ? 3 : undefined,
                  )}
                </span>
              ))}
          </div>
          <p className="mt-4 text-theme-xs text-gray-400 dark:text-gray-500">
            {t("design.chartHint")}
          </p>
        </div>
      ) : (
        <div className="space-y-5 py-1">
          {visible.map((row) => (
            <div key={row.key}>
              <div className="mb-2 flex items-start justify-between gap-4 text-sm">
                <span className="min-w-0 break-words text-gray-600 capitalize dark:text-gray-300">
                  {label(row.key)}
                </span>
                <span className="shrink-0 font-semibold text-gray-900 tabular-nums dark:text-white/90">
                  {format.number(row.count, { maximumFractionDigits: 2 })}
                  {unit && (
                    <span className="ms-1 text-theme-xs font-normal text-gray-400 dark:text-gray-500">
                      {unit}
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-brand-400 dark:bg-brand-500"
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {!ordered && rows.length > 6 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-5 text-theme-xs font-semibold text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-brand-300"
        >
          {t(expanded ? "design.showLess" : "design.showAll")}
        </button>
      )}
    </ComponentCard>
  );
}
