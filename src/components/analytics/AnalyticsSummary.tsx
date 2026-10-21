"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import Button from "@/components/ui/button/Button";
import { RefreshIcon, TimeIcon } from "@/icons";
import { ApiError } from "@/lib/api/client";
import {
  getAnalyticsSummary,
  type AnalyticsSection,
  type AnalyticsFilters,
} from "@/lib/api/analytics";
import { analyticsFields } from "./analyticsFields";
import AnalyticsMetrics, { AnalyticsMetricList } from "./AnalyticsMetrics";
import AnalyticsAudienceActivity from "./AnalyticsAudienceActivity";
import AnalyticsLanguageBreakdown from "./AnalyticsLanguageBreakdown";
import AnalyticsBreakdown from "./AnalyticsBreakdown";
import AnalyticsDataTable from "./AnalyticsDataTable";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsAcquisition from "./AnalyticsAcquisition";
import AnalyticsLatencyOverview from "./AnalyticsLatencyOverview";
import AnalyticsJourneys from "./AnalyticsJourneys";
import AnalyticsQuality from "./AnalyticsQuality";
import AnalyticsPerformance from "./AnalyticsPerformance";
import AnalyticsActivity from "./AnalyticsActivity";
import AnalyticsComposition from "./AnalyticsComposition";
import {
  chartFields,
  latencyFields,
  metricGroups,
  sectionMetrics,
} from "./analyticsPresentation";
import { analyticsNumber, asAnalyticsRecord } from "./analyticsData";
import { analyticsSummaryData } from "./analyticsSummaryData";

interface AnalyticsSummaryProps {
  section: AnalyticsSection;
  filters: AnalyticsFilters;
  accessToken: string;
  filterControls?: ReactNode;
  navigation?: ReactNode;
  heading?: ReactNode;
}

export default function AnalyticsSummary({
  section,
  filters,
  accessToken,
  filterControls,
  navigation,
  heading,
}: AnalyticsSummaryProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const { date, start_time, end_time } = filters;
  useEffect(() => {
    const controller = new AbortController();
    getAnalyticsSummary(
      section,
      accessToken,
      { date, start_time, end_time },
      controller.signal,
    )
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(analyticsSummaryData(section, result));
          setUpdatedAt(new Date());
          setError("");
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setError(err instanceof ApiError ? err.message : t("loadFailed"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [section, accessToken, date, start_time, end_time, revision, t]);
  const groups = section === "flows" ? [] : (metricGroups[section] ?? []);
  const dedicatedLayout = section === "performance" || section === "logs";
  const hasComposition = (
    section === "chats"
      ? ["total_user_messages", "total_assistant_messages"]
      : section === "logs"
        ? ["turn_success_count", "turn_failed_count"]
        : []
  ).some((field) => analyticsNumber(data?.[field]) !== null);
  const usedFields = new Set([
    ...sectionMetrics[section],
    ...(section === "flows" ? analyticsFields.flows : []),
    ...groups.flatMap((group) => group.fields),
    "found",
    "language_breakdown",
    "daily_active_users_growth",
    ...(section === "users"
      ? ["weekly_active_users", "monthly_active_users"]
      : []),
  ]);
  const details = analyticsFields[section].filter(
    (field) => !usedFields.has(field),
  );
  const latency = details.filter((field) => latencyFields.has(field));
  const charts = details.filter((field) => chartFields.has(field));
  const tables = details.filter(
    (field) => !latencyFields.has(field) && !chartFields.has(field),
  );
  return (
    <section aria-label={t(`sections.${section}`)} className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        {heading ?? (
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-theme-xl font-semibold text-gray-900 dark:text-white/90">
                {t(`design.headings.${section}`)}
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t(`design.descriptions.${section}`)}
            </p>
          </div>
        )}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-100 bg-white px-3 py-2.5 text-theme-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
            <TimeIcon aria-hidden="true" className="size-4" />
            {section === "users" || section === "flows"
              ? t("design.allTime")
              : section === "chats"
                ? start_time || end_time
                  ? t("design.selectedPeriod")
                  : t("design.allTime")
                : date && date !== "today"
                  ? date
                  : t("design.today")}
          </span>
          <p role="status" className="sr-only">
            {loading
              ? t("loading")
              : updatedAt
                ? t("design.updatedAt", {
                    time: format.dateTime(updatedAt, {
                      hour: "numeric",
                      minute: "2-digit",
                    }),
                  })
                : t("design.unavailable")}
          </p>
          <Button
            variant="primary"
            size="sm"
            disabled={loading}
            startIcon={
              <RefreshIcon
                aria-hidden="true"
                className={`size-4 ${loading ? "motion-safe:animate-spin" : ""}`}
              />
            }
            onClick={() => {
              setLoading(true);
              setRevision((value) => value + 1);
            }}
          >
            {t(error ? "retry" : "refresh")}
          </Button>
        </div>
      </div>
      {navigation}
      {filterControls}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
        >
          {error}
        </p>
      )}
      {loading && !data && (
        <div aria-hidden="true" className="space-y-5">
          <div className="grid gap-4 2xsm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-xl border border-brand-100 bg-white p-4 motion-reduce:animate-none dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-6 size-10 rounded-xl bg-gray-100 dark:bg-gray-800" />
                <div className="mb-3 h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-7 w-16 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-2xl bg-gray-100 motion-reduce:animate-none dark:bg-gray-800" />
            <div className="h-80 animate-pulse rounded-2xl bg-gray-100 motion-reduce:animate-none dark:bg-gray-800" />
          </div>
        </div>
      )}
      {data?.found === false ? (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <AnalyticsEmptyState message={t("noTelemetry")} />
        </div>
      ) : (
        data && (
          <div aria-busy={loading} className="space-y-5">
            <AnalyticsMetrics section={section} data={data} />
            {section === "flows" && <AnalyticsJourneys data={data} />}
            {section === "nlp" && <AnalyticsQuality data={data} date={date} />}
            {section === "performance" && (
              <AnalyticsPerformance data={data} date={date} />
            )}
            {section === "logs" && (
              <AnalyticsActivity data={data} date={date} />
            )}
            {section === "users" && (
              <div className="grid items-stretch gap-5 lg:grid-cols-2">
                <div className="min-w-0">
                  <AnalyticsAudienceActivity data={data} />
                </div>
                <div className="min-w-0">
                  <AnalyticsLanguageBreakdown value={data.language_breakdown} />
                </div>
              </div>
            )}
            {!dedicatedLayout && latency.length > 0 && (
              <AnalyticsLatencyOverview fields={latency} data={data} />
            )}
            {!dedicatedLayout && section !== "nlp" && charts.length > 0 && (
              <div className="grid items-stretch gap-5 xl:grid-cols-2">
                {hasComposition && (
                  <AnalyticsComposition section={section} data={data} />
                )}
                {charts.map((field, index) => (
                  <AnalyticsBreakdown
                    key={field}
                    field={field}
                    value={data[field]}
                    className={
                      index === charts.length - 1 &&
                      (charts.length + Number(hasComposition)) % 2 === 1
                        ? "xl:col-span-2"
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
            {groups.length > 0 && (
              <div
                className={`grid items-start gap-5 ${groups.length > 1 ? "xl:grid-cols-2" : ""}`}
              >
                {groups.map((group) =>
                  group.title === "newUsers" ? (
                    <AnalyticsAcquisition key={group.title} data={data} />
                  ) : (
                    <AnalyticsMetricList
                      key={group.title}
                      title={group.title}
                      fields={group.fields}
                      data={data}
                    />
                  ),
                )}
              </div>
            )}
            {!dedicatedLayout &&
              tables.map((field) => (
                <AnalyticsDataTable
                  key={field}
                  field={field}
                  value={
                    typeof data[field] === "object"
                      ? data[field]
                      : data[field] == null
                        ? []
                        : [{ value: data[field] }]
                  }
                />
              ))}
            {section === "users" &&
              Object.keys(
                asAnalyticsRecord(data.daily_active_users_growth),
              ).some(
                (key) =>
                  ![
                    "count",
                    "yesterday_count",
                    "growth_pct",
                    "display",
                  ].includes(key),
              ) && (
                <AnalyticsDataTable
                  field="daily_active_users_growth"
                  value={data.daily_active_users_growth}
                />
              )}
          </div>
        )
      )}
    </section>
  );
}
