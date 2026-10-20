"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ChartBarsIcon, RefreshIcon, GroupIcon } from "@/icons";
import type { DashboardOverviewResponse } from "@/lib/api/types";
import AnalyticsMetricCard from "./AnalyticsMetricCard";

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
      description: "engagedDescription",
      value: overview?.engaged_sessions_rate_pct,
      icon: ChartBarsIcon,
      tone: "brand",
    },
    {
      key: "returningUserRate",
      description: "returningDescription",
      value: overview?.returning_user_rate_pct,
      icon: RefreshIcon,
      tone: "purple",
    },
    {
      key: "stickinessRatio",
      description: "stickinessDescription",
      value: overview?.stickiness_ratio_pct,
      icon: GroupIcon,
      tone: "pink",
    },
  ] as const;
  return (
    <section aria-label={t("engagementTitle")}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">
          {t("engagementTitle")}
        </h2>
        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-theme-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {t("allTime")}
        </span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
          />
        ))}
      </div>
    </section>
  );
}
