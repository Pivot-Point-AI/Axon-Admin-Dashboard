"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import DateField from "@/components/form/DateField";
import Button from "@/components/ui/button/Button";
import { CalenderIcon, ChevronDownIcon } from "@/icons";
import type { AnalyticsFilters as Filters } from "@/lib/api/analytics";
import { localDateTimeValue } from "@/utils/dateTime";

interface AnalyticsFiltersProps {
  dated: boolean;
  filters: Filters;
  onApply: (filters: Filters) => void;
}

export default function AnalyticsFilters({
  dated,
  filters,
  onApply,
}: AnalyticsFiltersProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const today = localDateTimeValue().split("T")[0];
  const [date, setDate] = useState(
    filters.date === "today" ? "" : (filters.date ?? ""),
  );
  const [start, setStart] = useState(
    filters.start_time
      ? localDateTimeValue(new Date(filters.start_time)).split("T")[0]
      : "",
  );
  const [end, setEnd] = useState(
    filters.end_time
      ? localDateTimeValue(new Date(filters.end_time)).split("T")[0]
      : "",
  );
  const preset = (days: number): Filters => {
    const from = new Date();
    from.setDate(from.getDate() - (dated ? days : days - 1));
    const first = localDateTimeValue(from).split("T")[0];
    return dated
      ? { date: days === 0 ? "today" : first }
      : days === 0
        ? {}
        : {
            start_time: new Date(`${first}T00:00:00`).toISOString(),
            end_time: new Date(`${today}T23:59:59.999`).toISOString(),
          };
  };
  const choices = dated ? [0, 1] : [0, 7, 30];
  const selectedPreset = choices.find((days) => {
    const next = preset(days);
    return dated
      ? (filters.date === today ? "today" : filters.date || "today") ===
          next.date
      : filters.start_time === next.start_time &&
          filters.end_time === next.end_time;
  });
  const [customOpen, setCustomOpen] = useState(selectedPreset === undefined);
  const formatDay = (value: string) =>
    format.dateTime(
      new Date(value.includes("T") ? value : `${value}T00:00:00`),
      { day: "numeric", month: "short", year: "numeric" },
    );
  const customLabel =
    selectedPreset !== undefined
      ? t(dated ? "design.chooseDate" : "design.customRange")
      : dated && filters.date
        ? formatDay(filters.date)
        : t("design.dateRange", {
            from: filters.start_time
              ? formatDay(filters.start_time)
              : t("design.anyStart"),
            to: filters.end_time
              ? formatDay(filters.end_time)
              : t("design.anyEnd"),
          });
  return (
    <form
      aria-label={t("design.reportingPeriod")}
      onSubmit={(event) => {
        event.preventDefault();
        if (dated) onApply({ date: !date || date === today ? "today" : date });
        else if (!(start && end && start > end))
          onApply({
            start_time: start
              ? new Date(`${start}T00:00:00`).toISOString()
              : undefined,
            end_time: end
              ? new Date(`${end}T23:59:59.999`).toISOString()
              : undefined,
          });
      }}
      className="rounded-xl border border-brand-100/70 bg-white px-3 py-3 sm:px-4 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label={t("design.quickRanges")}
            className="inline-flex max-w-full gap-1 rounded-xl bg-gray-50 p-1 dark:bg-gray-800"
          >
            {choices.map((days) => (
              <button
                key={days}
                type="button"
                aria-pressed={selectedPreset === days}
                onClick={() => {
                  setCustomOpen(false);
                  onApply(preset(days));
                }}
                className={`h-9 rounded-lg px-3 text-theme-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-brand-400 sm:px-4 ${selectedPreset === days ? "bg-white text-brand-600 shadow-theme-xs dark:bg-gray-700 dark:text-brand-300" : "text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-300"}`}
              >
                {t(
                  dated
                    ? days === 0
                      ? "design.today"
                      : "design.yesterday"
                    : days === 0
                      ? "design.allTime"
                      : days === 7
                        ? "design.last7Days"
                        : "design.last30Days",
                )}
              </button>
            ))}
          </div>

          {customOpen && (
            <div
              id="analytics-custom-dates"
              className="flex flex-wrap items-center gap-2"
            >
              {dated ? (
                <div className="w-40 sm:w-44">
                  <DateField
                    id="analytics-date"
                    placeholder={t("date")}
                    hideLabel
                    value={date}
                    max={today}
                    onChange={setDate}
                  />
                </div>
              ) : (
                <>
                  <div className="w-36 sm:w-40">
                    <DateField
                      id="analytics-from"
                      placeholder={t("from")}
                      hideLabel
                      value={start}
                      max={end || today}
                      onChange={setStart}
                    />
                  </div>
                  <div className="w-36 sm:w-40">
                    <DateField
                      id="analytics-to"
                      placeholder={t("to")}
                      hideLabel
                      value={end}
                      min={start || undefined}
                      max={today}
                      onChange={setEnd}
                    />
                  </div>
                </>
              )}
              <Button type="submit" size="sm" className="h-11 !text-white">
                {t("apply")}
              </Button>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button
            type="button"
            aria-expanded={customOpen}
            aria-controls="analytics-custom-dates"
            onClick={() => setCustomOpen(!customOpen)}
            className={`inline-flex h-11 max-w-full items-center gap-2 rounded-lg border px-3 text-sm focus-visible:outline-2 focus-visible:outline-brand-400 ${customOpen || selectedPreset === undefined ? "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-500/10 dark:text-brand-300" : "border-gray-200 bg-white text-gray-600 hover:border-brand-200 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-600 dark:hover:text-brand-300"}`}
          >
            <CalenderIcon aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">{customLabel}</span>
            <ChevronDownIcon
              aria-hidden="true"
              className={`size-4 shrink-0 transition-transform ${customOpen ? "rotate-180" : ""}`}
            />
          </button>
          {(selectedPreset !== 0 || customOpen) && (
            <button
              type="button"
              onClick={() => {
                setDate("");
                setStart("");
                setEnd("");
                setCustomOpen(false);
                onApply(dated ? { date: "today" } : {});
              }}
              className="h-11 rounded-lg px-3 text-theme-xs font-medium text-gray-500 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-gray-400 dark:hover:text-brand-300"
            >
              {t("reset")}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
