"use client";

import { useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { BoltIcon, ChatIcon, GroupIcon, PieChartIcon } from "@/icons";
import type { AnalyticsSection } from "@/lib/api/analytics";
import { analyticsNumber, asAnalyticsRecord } from "./analyticsData";
import { sectionMetrics } from "./analyticsPresentation";
import AnalyticsValue from "./AnalyticsValue";

interface AnalyticsMetricsProps {
  section: AnalyticsSection;
  data: Record<string, unknown>;
}
const icons = [GroupIcon, ChatIcon, BoltIcon, PieChartIcon];
const tones = [
  "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300",
  "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400",
  "bg-theme-purple-500/10 text-theme-purple-500 dark:bg-theme-purple-500/15 dark:text-theme-purple-500",
  "bg-orange-50 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400",
];

export default function AnalyticsMetrics({
  section,
  data,
}: AnalyticsMetricsProps) {
  const t = useTranslations("analytics");
  const latency = asAnalyticsRecord(data.end_to_end_latency_ms);
  const tokens = asAnalyticsRecord(data.token_usage);
  const values: Record<string, unknown> = {
    ...data,
    average_response_time: latency.avg ?? latency.average,
    p95_response_time: latency.p95,
    total_tokens: tokens.total ?? tokens.total_tokens,
    recorded_errors: Array.isArray(data.errors) ? data.errors.length : null,
  };
  return (
    <div className="grid gap-4 2xsm:grid-cols-2 xl:grid-cols-4">
      {sectionMetrics[section].map((field, index) => {
        const Icon = icons[index];
        const value = analyticsNumber(values[field]);
        const percent =
          field.endsWith("_pct") || field === "average_intent_confidence";
        const progress =
          value === null
            ? null
            : field === "average_intent_confidence"
              ? value * 100
              : percent
                ? value
                : null;
        return (
          <article
            key={field}
            className="axon-metric relative min-w-0 overflow-hidden rounded-xl border border-brand-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-2 flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tones[index]}`}
              >
                <Icon className="size-5" />
              </span>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t(`fields.${field}`)}
              </h3>
            </div>
            <p className="flex items-baseline gap-1.5 text-2xl font-semibold tracking-tight text-gray-950 tabular-nums dark:text-white/90">
              <AnalyticsValue value={value} field={field} />
              {field.endsWith("response_time") && value !== null && (
                <span className="text-sm font-normal text-gray-400 dark:text-gray-500">
                  {t("design.milliseconds")}
                </span>
              )}
            </p>
            <p
              className={`mt-2 text-theme-xs leading-5 text-gray-500 dark:text-gray-400 ${field === "retention_rate_pct" ? "truncate" : ""}`}
              title={
                field === "retention_rate_pct"
                  ? t(`design.metricHints.${field}`)
                  : undefined
              }
            >
              {t(`design.metricHints.${field}`)}
            </p>
            {progress !== null && (
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1 bg-gray-100 dark:bg-gray-800"
              >
                <div
                  className="h-full bg-brand-400 dark:bg-brand-500"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

interface AnalyticsMetricListProps {
  title: string;
  fields: readonly string[];
  data: Record<string, unknown>;
}

export function AnalyticsMetricList({
  title,
  fields,
  data,
}: AnalyticsMetricListProps) {
  const t = useTranslations("analytics");
  return (
    <ComponentCard
      title={t(`design.${title}`)}
      icon={<GroupIcon />}
      className="h-full"
    >
      <dl className="divide-y divide-gray-100 dark:divide-gray-800">
        {fields.map((field, index) => (
          <div
            key={field}
            className="flex items-center justify-between gap-5 py-3 first:pt-0 last:pb-0"
          >
            <dt className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span
                aria-hidden="true"
                className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${tones[index % tones.length]}`}
              >
                {(() => {
                  const Icon = icons[index % icons.length];
                  return <Icon className="size-4" />;
                })()}
              </span>
              {t(`fields.${field}`)}
            </dt>
            <dd className="shrink-0 text-sm font-semibold text-gray-900 tabular-nums dark:text-white/90">
              <AnalyticsValue
                value={analyticsNumber(data[field])}
                field={field}
              />
            </dd>
          </div>
        ))}
      </dl>
    </ComponentCard>
  );
}
