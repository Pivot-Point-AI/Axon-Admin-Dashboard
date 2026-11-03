"use client";

import { blocksInfo, blockDescription } from "./analyticsTrends";
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
    count: "completed",
    bar: "bg-brand-600 dark:bg-brand-500",
    inside: "text-white",
    text: "text-brand-700 dark:text-brand-300",
  },
  {
    field: "abandonmentRate",
    count: "abandoned",
    bar: "bg-blue-light-300 dark:bg-blue-light-400",
    inside: "text-gray-900",
    text: "text-blue-light-600 dark:text-blue-light-300",
  },
  {
    field: "failedRate",
    count: "failed",
    bar: "bg-error-500 dark:bg-error-400",
    inside: "text-white",
    text: "text-error-600 dark:text-error-400",
  },
] as const;

export default function AnalyticsCompletionAbandonment({
  data,
}: AnalyticsCompletionAbandonmentProps) {
  const t = useTranslations("analytics.design");
  const tInfo = useTranslations("analytics.design.info");
  const format = useFormatter();
  const allCategories = journeyCategories(data)
    .filter(
      (row) =>
        journeyLabelKey(row.key) !== "others" &&
        (row.completionRate !== null ||
          row.abandonmentRate !== null ||
          row.failedRate !== null),
    )
    .sort((a, b) => (b.completionRate ?? -1) - (a.completionRate ?? -1));
  // Ten categories fit with sideways scrolling; View all shows the rest.
  const categories = allCategories.slice(0, 10);
  const percent = (value: number) =>
    format.number(value / 100, { style: "percent", maximumFractionDigits: 0 });
  // "12/19": the outcome's count out of everything started in the category.
  const ratio = (count: number | null, total: number | null) =>
    count === null || total === null
      ? null
      : `${format.number(count)}/${format.number(total)}`;
  const label = (key: string) => {
    const translated = journeyLabelKey(key);
    return translated ? t(translated) : key.replaceAll("_", " ");
  };
  const description =
    blockDescription(data, "completion_vs_abandonment_rate") ??
    t("completionVsAbandonmentDescription");
  const names = {
    completionRate: t("completionRate"),
    abandonmentRate: t("abandonmentRate"),
    failedRate: t("failedRate"),
  };

  const chart = (list: typeof categories) => (
    <div className="space-y-5">
      <div className="custom-scrollbar overflow-x-auto pb-1">
        <div
          className="space-y-3"
          style={{ minWidth: `${list.length * 8.5}rem` }}
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
                .map(
                  (row) =>
                    `${row.completionRate}:${row.abandonmentRate}:${row.failedRate}`,
                )
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
                  title={[
                    label(row.key),
                    ...series.map(
                      (item) =>
                        `${names[item.field]}: ${row[item.field] === null ? "—" : percent(row[item.field]!)}${ratio(row[item.count], row.count) ? ` (${ratio(row[item.count], row.count)})` : ""}`,
                    ),
                  ].join("\n")}
                  aria-label={`${label(row.key)}: ${names.completionRate} ${row.completionRate === null ? "—" : percent(row.completionRate)}, ${names.abandonmentRate} ${row.abandonmentRate === null ? "—" : percent(row.abandonmentRate)}, ${names.failedRate} ${row.failedRate === null ? "—" : percent(row.failedRate)}`}
                  className="flex h-full min-w-0 items-end justify-center gap-1.5 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-white/3"
                >
                  {series.map((item) => {
                    const value = row[item.field];
                    const counts = ratio(row[item.count], row.count);
                    // Tall bars carry their count inside; short ones above.
                    const roomInside = (value ?? 0) >= 12;
                    return (
                      <div
                        key={item.field}
                        className={`relative w-10 shrink-0 rounded-t-lg transition-opacity hover:opacity-80 ${item.bar}`}
                        style={{ height: `${Math.min(100, value ?? 0)}%` }}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute start-1/2 bottom-full mb-1 flex -translate-x-1/2 flex-col items-center leading-3 whitespace-nowrap tabular-nums rtl:translate-x-1/2 ${item.text}`}
                        >
                          <span className="text-[0.625rem] font-semibold">
                            {value === null ? "—" : percent(value)}
                          </span>
                          {counts && !roomInside && (
                            <span className="text-[0.625rem] font-normal text-gray-500 dark:text-gray-400">
                              {counts}
                            </span>
                          )}
                        </span>
                        {counts && roomInside && (
                          <span
                            aria-hidden="true"
                            className={`absolute inset-x-0 top-1.5 text-center text-[0.625rem] leading-4 font-medium tabular-nums ${item.inside}`}
                          >
                            {counts}
                          </span>
                        )}
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
              <div key={row.key} className="px-1">
                <p className="font-medium break-words text-gray-700 capitalize dark:text-gray-300">
                  {label(row.key)}
                </p>
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
    values: series.map((item) => {
      const value = row[item.field];
      const counts = ratio(row[item.count], row.count);
      return value === null
        ? "—"
        : `${percent(value)}${counts ? ` (${counts})` : ""}`;
    }),
    bar: row.completionRate === null ? null : row.completionRate / 100,
  }));
  return (
    <ComponentCard
      compact
      title={t("completionVsAbandonment")}
      description={description}
      icon={<TrendLineIcon />}
      info={
        blocksInfo(data, [
          "completion_vs_abandonment_rate",
          "flow_breakdown_by_type",
          "journey_outcomes_detail",
          "journey_outcomes",
          "most_popular_journeys",
          "top_popular_flows",
        ]) ?? tInfo("completionVsAbandonment")
      }
      actions={
        <AnalyticsCardActions>
          <AnalyticsViewAll
            title={t("completionVsAbandonment")}
            description={description}
            icon={<TrendLineIcon />}
            columns={[
              t("categoryColumn"),
              names.completionRate,
              names.abandonmentRate,
              names.failedRate,
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
