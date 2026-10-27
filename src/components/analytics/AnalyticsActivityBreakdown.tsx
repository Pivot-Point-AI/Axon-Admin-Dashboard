"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { ChartBarsIcon } from "@/icons";
import AnalyticsColumnChart from "./AnalyticsColumnChart";
import AnalyticsPeriodChart from "./AnalyticsPeriodChart";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import { valueInfo } from "./analyticsTrends";
import { chartColor, chartRows } from "./analyticsChartData";

type ActivityView = "peak_activity_hours" | "activity_by_day_of_week";

const views: ActivityView[] = [
  "peak_activity_hours",
  "activity_by_day_of_week",
];

interface AnalyticsActivityBreakdownProps {
  hours: unknown;
  weekdays: unknown;
}

export default function AnalyticsActivityBreakdown({
  hours,
  weekdays,
}: AnalyticsActivityBreakdownProps) {
  const t = useTranslations("analytics");
  const tInfo = useTranslations("analytics.design.info");
  const [view, setView] = useState<ActivityView>("peak_activity_hours");
  const rows = chartRows(
    view,
    view === "peak_activity_hours" ? hours : weekdays,
  );
  const label = (key: string) => {
    if (view === "peak_activity_hours" && /^\d+$/.test(key))
      return `${key.padStart(2, "0")}:00`;
    return t.has(`columns.${key}`)
      ? t(`columns.${key}`)
      : key.replaceAll("_", " ");
  };

  return (
    <ComponentCard
      title={t("design.activityTitle")}
      description={t(`design.chartDescriptions.${view}`)}
      className="h-full"
      icon={<ChartBarsIcon />}
      info={
        valueInfo(view === "peak_activity_hours" ? hours : weekdays) ??
        tInfo("activity")
      }
      actions={
        <div
          role="group"
          aria-label={t("design.activityTitle")}
          className="flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800"
        >
          {views.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={`rounded-md px-3 py-1.5 text-theme-xs font-medium focus-visible:outline-2 focus-visible:outline-brand-400 ${
                view === option
                  ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {t(`fields.${option}`)}
            </button>
          ))}
        </div>
      }
    >
      {!rows.length ? (
        <AnalyticsEmptyState />
      ) : view === "peak_activity_hours" ? (
        <AnalyticsColumnChart
          rows={rows}
          label={label}
          color={(key, index) => chartColor(view, key, index)}
          tall
        />
      ) : (
        <AnalyticsPeriodChart
          points={rows.map((row) => ({
            label: label(row.key).slice(0, 3),
            value: row.count,
          }))}
          color="purple"
          tall
        />
      )}
    </ComponentCard>
  );
}
