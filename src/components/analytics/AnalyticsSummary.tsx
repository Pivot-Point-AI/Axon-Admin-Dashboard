"use client";

import AnalyticsCardScope from "./AnalyticsCardScope";
import { useEffect, useState, type ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import Button from "@/components/ui/button/Button";
import { CalenderIcon, RefreshIcon } from "@/icons";
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
  const dashboard = useTranslations("dashboardAnalytics");
  const format = useFormatter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const { date, start_time, end_time, period, start_date, end_date } = filters;
  useEffect(() => {
    const controller = new AbortController();
    getAnalyticsSummary(
      section,
      accessToken,
      { date, start_time, end_time, period, start_date, end_date },
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
  }, [
    section,
    accessToken,
    date,
    start_time,
    end_time,
    period,
    start_date,
    end_date,
    revision,
    t,
  ]);
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
    // Shown by the quality charts; the "Fallbacks & Safety" block was removed.
    ...(section === "nlp"
      ? ["llm_fallback_count", "guardrail_violations_count"]
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
      <div className="flex flex-wrap items-center justify-between gap-4">
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
        <div className="flex max-w-full flex-wrap items-center justify-end gap-2 rounded-xl border border-brand-100 bg-white p-1.5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex min-w-0 items-center gap-2 ps-2 pe-1">
            <CalenderIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-gray-500 dark:text-gray-400"
            />
            <div className="min-w-0">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                {dashboard("lastUpdatedLabel")}
              </p>
              <p
                role="status"
                className="text-theme-xs font-medium text-gray-800 dark:text-gray-200"
              >
                {loading ? (
                  t("loading")
                ) : updatedAt ? (
                  <time dateTime={updatedAt.toISOString()}>
                    {format.dateTime(updatedAt, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                ) : (
                  t("design.unavailable")
                )}
              </p>
            </div>
          </div>
          {filterControls}
          <Button
            title={t(error ? "retry" : "refresh")}
            variant="primary"
            size="sm"
            className="w-10 shrink-0 !px-0 !text-white"
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
            <span className="sr-only">{t(error ? "retry" : "refresh")}</span>
          </Button>
        </div>
      </div>
      {navigation}
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
            {section === "nlp" && <AnalyticsQuality data={data} />}
            {section === "performance" && <AnalyticsPerformance data={data} />}
            {section === "logs" && (
              <AnalyticsActivity data={data} date={date} />
            )}
            {section === "users" && (
              <div className="grid items-stretch gap-5 lg:grid-cols-2">
                <div className="min-w-0">
                  <AnalyticsCardScope section="users" data={data}>
                    {(d) => <AnalyticsAudienceActivity data={d} />}
                  </AnalyticsCardScope>
                </div>
                <div className="min-w-0">
                  <AnalyticsCardScope section="users" data={data}>
                    {(d) => (
                      <AnalyticsLanguageBreakdown
                        value={d.language_breakdown}
                      />
                    )}
                  </AnalyticsCardScope>
                </div>
              </div>
            )}
            {!dedicatedLayout && latency.length > 0 && (
              <AnalyticsLatencyOverview fields={latency} data={data} />
            )}
            {!dedicatedLayout &&
              section !== "nlp" &&
              section !== "chats" &&
              charts.length > 0 && (
                <div className="grid items-stretch gap-5 xl:grid-cols-2">
                  {hasComposition && (
                    <AnalyticsCardScope section={section} data={data}>
                      {(d) => (
                        <AnalyticsComposition section={section} data={d} />
                      )}
                    </AnalyticsCardScope>
                  )}
                  {charts.map((field, index) => (
                    <AnalyticsCardScope
                      key={field}
                      section={section}
                      data={data}
                    >
                      {(d) => (
                        <AnalyticsBreakdown
                          field={field}
                          value={d[field]}
                          className={
                            index === charts.length - 1 &&
                            (charts.length + Number(hasComposition)) % 2 === 1
                              ? "xl:col-span-2"
                              : undefined
                          }
                        />
                      )}
                    </AnalyticsCardScope>
                  ))}
                </div>
              )}
            {section === "chats" && (
              <>
                <AnalyticsCardScope section="chats" data={data}>
                  {(d) => (
                    <AnalyticsBreakdown
                      field="peak_activity_hours"
                      value={d.peak_activity_hours}
                    />
                  )}
                </AnalyticsCardScope>
                <AnalyticsCardScope section="chats" data={data}>
                  {(d) => (
                    <AnalyticsBreakdown
                      field="activity_by_day_of_week"
                      value={d.activity_by_day_of_week}
                    />
                  )}
                </AnalyticsCardScope>
                <div className="grid items-stretch gap-5 xl:grid-cols-2">
                  {hasComposition && (
                    <AnalyticsCardScope section="chats" data={data}>
                      {(d) => (
                        <AnalyticsComposition section={section} data={d} />
                      )}
                    </AnalyticsCardScope>
                  )}
                  <AnalyticsMetricList
                    title="conversationDetails"
                    fields={metricGroups.chats?.[0].fields ?? []}
                    data={data}
                  />
                </div>
              </>
            )}
            {section !== "chats" && groups.length > 0 && (
              <div
                className={`grid items-stretch gap-5 ${groups.length > 1 ? "xl:grid-cols-2" : ""}`}
              >
                {groups.map((group) =>
                  group.title === "newUsers" ? (
                    <AnalyticsCardScope
                      key={group.title}
                      section={section}
                      data={data}
                    >
                      {(d) => <AnalyticsAcquisition data={d} />}
                    </AnalyticsCardScope>
                  ) : (
                    <AnalyticsCardScope
                      key={group.title}
                      section={section}
                      data={data}
                    >
                      {(d) => (
                        <AnalyticsMetricList
                          title={group.title}
                          fields={group.fields}
                          data={d}
                        />
                      )}
                    </AnalyticsCardScope>
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
