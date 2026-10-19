"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ChatIcon, GroupIcon, PieChartIcon } from "@/icons";
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
      icon: ChatIcon,
      tone: "brand",
    },
    {
      key: "returningUserRate",
      description: "returningDescription",
      value: overview?.returning_user_rate_pct,
      icon: GroupIcon,
      tone: "purple",
    },
    {
      key: "stickinessRatio",
      description: "stickinessDescription",
      value: overview?.stickiness_ratio_pct,
      icon: PieChartIcon,
      tone: "brand",
    },
  ] as const;
  return (
    <section aria-label={t("engagementTitle")}>
      <div className="mb-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">
          {t("engagementTitle")}
        </h2>
        <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">
          {t("engagementSubtitle")}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
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
