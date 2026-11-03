"use client";

import { useFormatter, useTranslations } from "next-intl";
import MetricHeader from "@/components/common/MetricHeader";
import { BoltIcon, ChatIcon, GroupIcon, PieChartIcon, TimeIcon } from "@/icons";
import { analyticsNumber } from "./analyticsData";
import { titleCase, unitOf } from "./analyticsLabels";
import { MetricTrendBadge } from "./MetricTrend";
import MetricSparkline from "./MetricSparkline";
import {
  formattedValue,
  kpiEntries,
  metricDetails,
  readMetricTrend,
} from "./analyticsTrends";

interface AnalyticsTopKpisProps {
  data: Record<string, unknown>;
}

const icons = [GroupIcon, ChatIcon, BoltIcon, PieChartIcon, TimeIcon];
const lowerIsBetter = /slow|latency|time|fail|error|abandon|drop/i;

/** The KPI cards exactly as the API's `top_kpis` block describes them. */
export default function AnalyticsTopKpis({ data }: AnalyticsTopKpisProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const entries = kpiEntries(data);
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${entries.length === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}
    >
      {entries.map(({ key, record }, index) => {
        const Icon = icons[index % icons.length];
        const rawLabel =
          [record.label, record.metric, record.title, record.name].find(
            (value): value is string =>
              typeof value === "string" && value.length > 0,
          ) ?? (t.has(`fields.${key}`) ? t(`fields.${key}`) : key);
        const label = titleCase(rawLabel);
        const value = analyticsNumber(
          record.value ?? record.current_value ?? record.count,
        );
        const unit = unitOf(
          record,
          [
            rawLabel,
            record.description,
            record.stat_info,
            record.formatted_value,
          ].join(" "),
          key,
        );
        const details = metricDetails(record);
        // The API's wording first; the standard hint keeps every card aligned.
        const description =
          details.description ??
          (t.has(`design.metricHints.${key}`)
            ? t(`design.metricHints.${key}`)
            : null);
        const info = details.info;
        const trend = readMetricTrend(record);
        const sparkline =
          trend &&
          trend.points.filter((point) => point.value !== null).length > 1;
        return (
          <article
            key={key}
            className="axon-metric flex min-w-0 flex-col rounded-xl border border-gray-200/80 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900"
          >
            <MetricHeader
              label={label}
              detail={formattedValue(record)}
              icon={<Icon />}
              info={info}
            />
            <div className="mt-2.5 flex min-w-0 flex-nowrap items-center gap-x-1.5">
              <p className="flex shrink-0 items-baseline gap-1.5 text-lg font-bold tracking-tight text-gray-950 tabular-nums sm:text-xl dark:text-white/90">
                {value !== null
                  ? format.number(value, { maximumFractionDigits: 2 })
                  : typeof record.formatted_value === "string"
                    ? record.formatted_value
                    : "—"}
                {unit && (
                  <span className="ms-1 text-xs font-normal text-gray-400 dark:text-gray-500">
                    {unit}
                  </span>
                )}
              </p>
              {trend && (
                <div className="@container min-w-0 flex-1">
                  <MetricTrendBadge
                    trend={trend}
                    lowerIsBetter={lowerIsBetter.test(`${key} ${label}`)}
                  />
                </div>
              )}
            </div>
            {sparkline && (
              <MetricSparkline
                size="card"
                points={trend.points}
                tone="blueLight"
              />
            )}
            <p className="mt-2 min-h-5 text-theme-xs leading-5 break-words text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
