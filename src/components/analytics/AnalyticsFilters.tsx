"use client";

import { useTranslations } from "next-intl";
import { CalenderIcon } from "@/icons";
import type { AnalyticsFilters as Filters } from "@/lib/api/analytics";
import AnalyticsPeriodSelect from "./AnalyticsPeriodSelect";
import {
  type AnalyticsPeriod,
  customPeriodFilters,
  periodFilters,
  selectedPeriod,
} from "./analyticsPeriods";

interface AnalyticsFiltersProps {
  dated: boolean;
  defaultPeriod?: AnalyticsPeriod;
  compact?: boolean;
  filters: Filters;
  onApply: (filters: Filters) => void;
}

export default function AnalyticsFilters({
  dated,
  defaultPeriod = "last7Days",
  compact = false,
  filters,
  onApply,
}: AnalyticsFiltersProps) {
  const t = useTranslations("analytics");
  const day = filters.date;
  const value = dated
    ? day === "yesterday"
      ? "yesterday"
      : day === "today" || !day
        ? "today"
        : undefined
    : selectedPeriod(filters);
  const start = dated ? (value ? "" : day) : filters.start_date;
  return (
    <div
      className={
        compact
          ? "flex max-w-full min-w-0 items-center"
          : "flex flex-col gap-5 rounded-2xl border border-brand-100/70 bg-white p-5 shadow-theme-xs sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-gray-800 dark:bg-gray-900"
      }
    >
      {!compact && (
        <div className="flex min-w-0 items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300"
          >
            <CalenderIcon className="size-6" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {t("design.reportingPeriod")}
            </h2>
            <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
              {t(
                dated
                  ? "design.reportingDateDescription"
                  : "design.reportingPeriodDescription",
              )}
            </p>
          </div>
        </div>
      )}
      <div className="flex min-w-0 items-center gap-2 sm:shrink-0">
        <AnalyticsPeriodSelect
          size={compact ? "sm" : "md"}
          value={value}
          options={dated ? ["today", "yesterday"] : undefined}
          start={start}
          end={dated ? start : filters.end_date}
          customMode={dated ? "day" : "range"}
          onChange={(period) =>
            onApply(dated ? { date: period } : periodFilters(period))
          }
          onCustomChange={(from, to) =>
            onApply(dated ? { date: from } : customPeriodFilters(from, to))
          }
        />
        {value !== (dated ? "today" : defaultPeriod) && (
          <button
            type="button"
            onClick={() =>
              onApply(dated ? { date: "today" } : periodFilters(defaultPeriod))
            }
            className="rounded-lg px-3 py-2 text-theme-xs font-medium text-gray-500 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-gray-400 dark:hover:text-brand-300"
          >
            {t("reset")}
          </button>
        )}
      </div>
    </div>
  );
}
