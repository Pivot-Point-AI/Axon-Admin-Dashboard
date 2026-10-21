"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ArrowRightIcon, ChartBarsIcon, RefreshIcon, GroupIcon } from "@/icons";
import { Link } from "@/i18n/navigation";
import type { DashboardOverviewResponse } from "@/lib/api/types";
import AnalyticsMetricCard from "./AnalyticsMetricCard";
import { metricTrend } from "@/components/analytics/analyticsTrends";

interface EngagementOverviewProps {
  overview: DashboardOverviewResponse | null;
}

export default function EngagementOverview({
  overview,
}: EngagementOverviewProps) {
  const t = useTranslations("dashboardAnalytics");
  const format = useFormatter();
  const metrics = [
    {
      key: "engagedSessionsRate",
      field: "engaged_sessions_rate_pct",
      description: "engagedDescription",
      value: overview?.engaged_sessions_rate_pct,
      icon: ChartBarsIcon,
      tone: "brand",
    },
    {
      key: "returningUserRate",
      field: "returning_user_rate_pct",
      description: "returningDescription",
      value: overview?.returning_user_rate_pct,
      icon: RefreshIcon,
      tone: "purple",
    },
    {
      key: "stickinessRatio",
      field: "stickiness_ratio_pct",
      description: "stickinessDescription",
      value: overview?.stickiness_ratio_pct,
      icon: GroupIcon,
      tone: "pink",
    },
  ] as const;
  return (
    <section aria-label={t("engagementTitle")}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">
            {t("engagementTitle")}
          </h2>
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-theme-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {t("allTime")}
          </span>
        </div>
        <Link
          href="/analytics"
          className="inline-flex items-center gap-1 text-theme-xs font-semibold text-brand-600 hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 dark:text-brand-300 dark:hover:text-brand-200"
        >
          {t("viewAll")}
          <ArrowRightIcon
            aria-hidden="true"
            className="size-3.5 rtl:rotate-180"
          />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <AnalyticsMetricCard
            key={metric.key}
            label={t(metric.key)}
            value={
              metric.value == null
                ? null
                : format.number(metric.value / 100, {
                    style: "percent",
                    maximumFractionDigits: 1,
                  })
            }
            description={t(metric.description)}
            icon={<metric.icon />}
            tone={metric.tone}
            progress={metric.value}
            trend={metricTrend(overview, metric.field, ["audience_engagement"])}
          />
        ))}
      </div>
    </section>
  );
}
