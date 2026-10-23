"use client";

import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { TrendLineIcon } from "@/icons";
import AnalyticsCardActions from "./AnalyticsCardActions";
import AnalyticsViewAll from "./AnalyticsViewAll";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import AnalyticsJourneyPlot from "./AnalyticsJourneyPlot";
import { journeyCategories, journeyLabelKey } from "./analyticsJourneyInsights";

interface AnalyticsCompletionAbandonmentProps {
  data: Record<string, unknown>;
}

const series = [
  {
    field: "completionRate",
    bar: "bg-brand-600 dark:bg-brand-500",
    text: "text-brand-700 dark:text-brand-300",
  },
  {
    field: "abandonmentRate",
    bar: "bg-blue-light-300 dark:bg-blue-light-400",
    text: "text-blue-light-600 dark:text-blue-light-300",
  },
] as const;

export default function AnalyticsCompletionAbandonment({
  data,
}: AnalyticsCompletionAbandonmentProps) {
  const t = useTranslations("analytics.design");
  const format = useFormatter();
  const allCategories = journeyCategories(data)
    .filter(
      (row) =>
        journeyLabelKey(row.key) !== "others" &&
        (row.completionRate !== null || row.abandonmentRate !== null),
    )
    .sort((a, b) => (b.completionRate ?? -1) - (a.completionRate ?? -1));
  // Ten categories fit with sideways scrolling; View all shows the rest.
  const categories = allCategories.slice(0, 10);
  const percent = (value: number) =>
    format.number(value / 100, { style: "percent", maximumFractionDigits: 0 });
  const label = (key: string) => {
    const translated = journeyLabelKey(key);
    return translated ? t(translated) : key.replaceAll("_", " ");
  };
  const names = {
    completionRate: t("completionRate"),
    abandonmentRate: t("abandonmentRate"),
  };

  const chart = (list: typeof categories) => (
    <div className="space-y-5">
      <div className="custom-scrollbar overflow-x-auto pb-1">
        <div
          className="space-y-3"
          style={{ minWidth: `${list.length * 5.5}rem` }}
        >
          <div className="flex flex-wrap gap-5 text-theme-xs text-gray-500 dark:text-gray-400">
            {series.map((item) => (
              <span
                key={item.field}
                className="inline-flex items-center gap-1.5"
              >
                <span
                  aria-hidden="true"
                  className={`size-2.5 rounded-full ${item.bar}`}
                />
                {names[item.field]}
              </span>
            ))}
          </div>
          <AnalyticsJourneyPlot
            tall
            ticks={[100, 75, 50, 25, 0]}
            label={percent}
          >
            <div
              key={list
                .map((row) => `${row.completionRate}:${row.abandonmentRate}`)
                .join()}
              className="axon-reveal-up relative grid h-full"
              style={{
                gridTemplateColumns: `repeat(${list.length}, minmax(0, 1fr))`,
              }}
            >
              {list.map((row) => (
                <div
                  key={row.key}
                  role="img"
                  aria-label={`${label(row.key)}: ${names.completionRate} ${row.completionRate === null ? "—" : percent(row.completionRate)}, ${names.abandonmentRate} ${row.abandonmentRate === null ? "—" : percent(row.abandonmentRate)}`}
                  className="flex h-full min-w-0 items-end justify-center gap-2"
                >
                  {series.map((item) => {
                    const value = row[item.field];
                    return (
                      <div
                        key={item.field}
                        className={`relative w-6 shrink-0 rounded-t-md transition-opacity hover:opacity-80 ${item.bar}`}
                        style={{ height: `${Math.min(100, value ?? 0)}%` }}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute start-1/2 bottom-full mb-1 -translate-x-1/2 text-theme-xs font-semibold whitespace-nowrap tabular-nums rtl:translate-x-1/2 ${item.text}`}
                        >
                          {value === null ? "—" : percent(value)}
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
            className="grid ps-11 text-center text-theme-xs leading-4 text-gray-600 dark:text-gray-400"
            style={{
              gridTemplateColumns: `repeat(${list.length}, minmax(0, 1fr))`,
            }}
          >
            {list.map((row) => (
              <div key={row.key} className="px-2 break-words">
                {label(row.key)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  const entries = allCategories.map((row) => ({
    key: row.key,
    label: label(row.key),
    color: "brand-600",
    values: [
      row.completionRate === null ? "—" : percent(row.completionRate),
      row.abandonmentRate === null ? "—" : percent(row.abandonmentRate),
    ],
    bar: row.completionRate === null ? null : row.completionRate / 100,
  }));
  return (
    <ComponentCard
      compact
      title={t("completionVsAbandonment")}
      description={t("completionVsAbandonmentDescription")}
      icon={<TrendLineIcon />}
      actions={
        <AnalyticsCardActions>
          <AnalyticsViewAll
            title={t("completionVsAbandonment")}
            description={t("completionVsAbandonmentDescription")}
            icon={<TrendLineIcon />}
            columns={[
              t("categoryColumn"),
              names.completionRate,
              names.abandonmentRate,
            ]}
            entries={entries}
          >
            {allCategories.length ? (
              chart(allCategories)
            ) : (
              <AnalyticsEmptyState />
            )}
          </AnalyticsViewAll>
          <AnalyticsJourneyPeriod />
        </AnalyticsCardActions>
      }
      className="h-full"
    >
      {!categories.length ? <AnalyticsEmptyState /> : chart(categories)}
    </ComponentCard>
  );
}
