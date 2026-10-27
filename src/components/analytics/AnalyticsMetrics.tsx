"use client";

import { useTranslations } from "next-intl";
import useOverviewFallback from "./useOverviewFallback";
import AudienceKpiCards from "@/components/common/AudienceKpiCards";
import MetricHeader from "@/components/common/MetricHeader";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import { useAnalyticsPeriod } from "./AnalyticsPeriodContext";
import ComponentCard from "@/components/common/ComponentCard";
import {
  BoltIcon,
  BoxCubeIcon,
  ChartBarsIcon,
  ChatIcon,
  CheckCircleIcon,
  GroupIcon,
  PieChartIcon,
  RefreshIcon,
  TaskIcon,
  TimeIcon,
  UserIcon,
} from "@/icons";
import type { AnalyticsSection } from "@/lib/api/analytics";
import { analyticsNumber, asAnalyticsRecord } from "./analyticsData";
import { sectionMetrics } from "./analyticsPresentation";
import AnalyticsValue from "./AnalyticsValue";
import MetricTrend, { MetricTrendBadge } from "./MetricTrend";
import MetricSparkline from "./MetricSparkline";
import {
  lowerMetricIsBetter,
  metricInfo,
  metricTrend,
  metricValue,
} from "./analyticsTrends";

interface AnalyticsMetricsProps {
  section: AnalyticsSection;
  data: Record<string, unknown>;
}
const icons = [GroupIcon, ChatIcon, BoltIcon, PieChartIcon];
const journeyIcons = [GroupIcon, CheckCircleIcon, BoltIcon, TimeIcon];
export default function AnalyticsMetrics({
  section,
  data,
}: AnalyticsMetricsProps) {
  const t = useTranslations("analytics");
  const overview = useOverviewFallback(section === "users");
  const latency = asAnalyticsRecord(data.end_to_end_latency_ms);
  const tokens = asAnalyticsRecord(data.token_usage);
  const tokenCategories = asAnalyticsRecord(tokens.categories);
  const values: Record<string, unknown> = {
    ...data,
    average_response_time: latency.avg ?? latency.average,
    p95_response_time: latency.p95,
    // The KPI block carries the full figure; the error list is capped by the
    // server, so its length is only a fallback.
    total_tokens:
      metricValue(data, "total_tokens") ??
      tokens.total ??
      tokens.total_tokens ??
      tokenCategories.total_tokens,
    recorded_errors:
      metricValue(data, "recorded_errors") ??
      (Array.isArray(data.errors) ? data.errors.length : null),
  };
  if (section === "users")
    return <AudienceKpiCards data={data} fallback={overview} />;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {sectionMetrics[section].map((field, index) => {
        const Icon = section === "flows" ? journeyIcons[index] : icons[index];
        // A figure the server leaves out for the period means nothing was counted.
        const value = analyticsNumber(values[field]) ?? 0;
        const trend = metricTrend(data, field);
        const sparkline =
          (section === "performance" || section === "logs") &&
          trend &&
          trend.points.filter((point) => point.value !== null).length > 1;
        return (
          <article
            key={field}
            className="axon-metric flex min-w-0 flex-col rounded-xl border border-gray-200/80 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900"
          >
            <MetricHeader
              label={t(`fields.${field}`)}
              icon={<Icon />}
              info={
                metricInfo(data, field) ??
                (t.has(`design.metricHints.${field}`)
                  ? t(`design.metricHints.${field}`)
                  : null)
              }
            />
            <div className="mt-2.5 flex min-w-0 flex-nowrap items-center gap-x-1.5">
              <p className="flex shrink-0 items-baseline gap-1.5 text-lg font-bold tracking-tight text-gray-950 tabular-nums sm:text-xl dark:text-white/90">
                <AnalyticsValue value={value} field={field} />
                {field.endsWith("response_time") && value !== null && (
                  <span className="ms-1 text-xs font-normal text-gray-400 dark:text-gray-500">
                    {t("design.milliseconds")}
                  </span>
                )}
              </p>
              {trend && (
                <div className="@container min-w-0 flex-1">
                  <MetricTrendBadge
                    trend={trend}
                    lowerIsBetter={lowerMetricIsBetter(field)}
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
            <p className="mt-2 text-theme-xs leading-5 break-words text-gray-500 dark:text-gray-400">
              {t(`design.metricHints.${field}`)}
            </p>
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

const rowBlocks = [
  "audience_and_retention",
  "conversation_details",
  "fallbacks_and_safety",
  "top_kpis",
];

const audienceHealthIcons: Record<
  string,
  {
    icon: (props: { className?: string }) => React.JSX.Element;
  }
> = {
  active_sessions: {
    icon: () => (
      <span className="size-2 rounded-full bg-blue-light-500 dark:bg-blue-light-300" />
    ),
  },
  returning_users: {
    icon: (props) => <UserIcon {...props} />,
  },
  one_time_users: {
    icon: (props) => <UserIcon {...props} />,
  },
  average_sessions_per_user: {
    icon: (props) => <BoxCubeIcon {...props} />,
  },
  today_returning_user_rate_pct: {
    icon: (props) => <RefreshIcon {...props} />,
  },
  stickiness_ratio_pct: {
    icon: (props) => <ChartBarsIcon {...props} />,
  },
  dormant_users_30d: {
    icon: (props) => <TimeIcon {...props} />,
  },
};

export function AnalyticsMetricList({
  title,
  fields,
  data,
}: AnalyticsMetricListProps) {
  const t = useTranslations("analytics");
  const tInfo = useTranslations("analytics.design.info");
  const reporting = useAnalyticsPeriod();
  const isAudienceHealth = title === "audienceHealth";

  const actions =
    isAudienceHealth && reporting ? (
      <AnalyticsJourneyPeriod
        value={reporting.period ?? "customRange"}
        onChange={reporting.onChange}
      />
    ) : undefined;

  // One explanation for the whole card: each row's own text, one per line.
  const info =
    fields
      .flatMap((field) => {
        const text = metricInfo(data, field, rowBlocks);
        return text ? [`${t(`fields.${field}`)}: ${text}`] : [];
      })
      .join("\n") || (tInfo.has(title) ? tInfo(title) : null);

  return (
    <ComponentCard
      title={t(`design.${title}`)}
      description={
        isAudienceHealth
          ? t("design.audienceHealthDescription")
          : t.has(`design.${title}Description`)
            ? t(`design.${title}Description`)
            : undefined
      }
      icon={isAudienceHealth ? <TaskIcon /> : <GroupIcon />}
      actions={actions}
      info={info}
      className="h-full"
    >
      <dl className="divide-y divide-gray-100 border-t border-gray-200 pt-4 dark:divide-gray-800 dark:border-gray-700">
        {fields.map((field, index) => {
          const custom = audienceHealthIcons[field];
          const RowIcon = custom ? custom.icon : icons[index % icons.length];
          return (
            <div
              key={field}
              className="grid grid-cols-[minmax(0,1.2fr)_5rem_minmax(0,1fr)] items-center gap-x-3 py-3 first:pt-0 last:pb-0"
            >
              <dt className="flex min-w-0 items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300"
                >
                  <RowIcon className="size-4" />
                </span>
                <span className="min-w-0 font-medium break-words text-gray-700 dark:text-gray-300">
                  {t(`fields.${field}`)}
                </span>
              </dt>
              <dd className="contents">
                <span className="text-center text-sm font-bold text-gray-950 tabular-nums dark:text-white">
                  <AnalyticsValue
                    value={analyticsNumber(data[field]) ?? 0}
                    field={field}
                  />
                </span>
                <span className="flex min-w-0 justify-end [&>span]:justify-end">
                  <MetricTrend
                    compact
                    trend={metricTrend(data, field, [
                      "audience_and_retention",
                      "conversation_details",
                      "fallbacks_and_safety",
                      "top_kpis",
                    ])}
                    lowerIsBetter={lowerMetricIsBetter(field)}
                  />
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
    </ComponentCard>
  );
}
