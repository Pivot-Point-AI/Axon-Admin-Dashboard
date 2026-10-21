"use client";

import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { TrendLineIcon } from "@/icons";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsJourneyPlot from "./AnalyticsJourneyPlot";
import { journeyCategories, journeyLabelKey } from "./analyticsJourneyInsights";

interface AnalyticsCompletionAbandonmentProps {
  data: Record<string, unknown>;
}

export default function AnalyticsCompletionAbandonment({
  data,
}: AnalyticsCompletionAbandonmentProps) {
  const t = useTranslations("analytics.design");
  const format = useFormatter();
  const categories = journeyCategories(data)
    .filter(
      (row) =>
        journeyLabelKey(row.key) !== "others" &&
        (row.completionRate !== null || row.abandonmentRate !== null),
    )
    .slice(0, 5);
  const percent = (value: number) =>
    format.number(value / 100, { style: "percent", maximumFractionDigits: 0 });
  const label = (key: string) => {
    const translated = journeyLabelKey(key);
    return translated ? t(translated) : key.replaceAll("_", " ");
  };
  return (
    <ComponentCard
      compact
      title={t("completionVsAbandonment")}
      description={t("completionVsAbandonmentDescription")}
      icon={<TrendLineIcon />}
      className="h-full"
    >
      {!categories.length ? (
        <AnalyticsEmptyState />
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-5 text-theme-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-success-500 dark:bg-success-500"
              />
              {t("completionRate")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-orange-400 dark:bg-orange-400"
              />
              {t("abandonmentRate")}
            </span>
          </div>
          <AnalyticsJourneyPlot ticks={[100, 75, 50, 25, 0]} label={percent}>
            <div
              className="relative grid h-full"
              style={{
                gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))`,
              }}
            >
              {categories.map((row) => (
                <div
                  key={row.key}
                  role="img"
                  aria-label={`${label(row.key)}: ${t("completionRate")} ${row.completionRate === null ? "—" : percent(row.completionRate)}, ${t("abandonmentRate")} ${row.abandonmentRate === null ? "—" : percent(row.abandonmentRate)}`}
                  className="flex h-full min-w-0 items-end justify-center gap-1"
                >
                  {(["completionRate", "abandonmentRate"] as const).map(
                    (field) => {
                      const value = row[field];
                      return (
                        <div
                          key={field}
                          className={`relative w-4 shrink-0 sm:w-5 ${field === "completionRate" ? "bg-success-500 dark:bg-success-500" : "bg-orange-400 dark:bg-orange-400"}`}
                          style={{ height: `${value ?? 0}%` }}
                        >
                          <span
                            aria-hidden="true"
                            className={`absolute start-1/2 bottom-full mb-1 -translate-x-1/2 text-theme-xs font-semibold whitespace-nowrap tabular-nums rtl:translate-x-1/2 ${field === "completionRate" ? "text-success-600 dark:text-success-400" : "text-orange-500 dark:text-orange-400"}`}
                          >
                            {value === null ? "—" : percent(value)}
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              ))}
            </div>
          </AnalyticsJourneyPlot>
          <div
            aria-hidden="true"
            className="grid ps-8 text-center text-theme-xs leading-4 text-gray-500 dark:text-gray-400"
            style={{
              gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))`,
            }}
          >
            {categories.map((row) => (
              <div key={row.key} className="px-1 break-words">
                {label(row.key)}
              </div>
            ))}
          </div>
        </div>
      )}
    </ComponentCard>
  );
}
