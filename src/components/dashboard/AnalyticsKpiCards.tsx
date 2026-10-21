"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChatIcon,
  GroupIcon,
  UserIcon,
  DatabaseIcon,
} from "@/icons";
import type { DashboardOverviewResponse } from "@/lib/api/types";
import AnalyticsMetricCard from "./AnalyticsMetricCard";
import { metricTrend } from "@/components/analytics/analyticsTrends";

interface AnalyticsKpiCardsProps {
  overview: DashboardOverviewResponse | null;
}

export default function AnalyticsKpiCards({
  overview,
}: AnalyticsKpiCardsProps) {
  const t = useTranslations("dashboardAnalytics");
  const format = useFormatter();
  const growth = overview?.daily_active_users.growth_pct;
  const cards = [
    {
      key: "totalUsers",
      field: "total_users",
      value: overview?.total_users,
      icon: GroupIcon,
      tone: "brand",
    },
    {
      key: "totalSessions",
      field: "total_sessions",
      value: overview?.total_sessions,
      icon: DatabaseIcon,
      tone: "purple",
    },
    {
      key: "dailyActiveUsers",
      field: "daily_active_users",
      value: overview?.daily_active_users.count,
      icon: UserIcon,
      tone: "success",
    },
    {
      key: "activeSessions",
      field: "active_sessions",
      value: overview?.active_sessions,
      icon: ChatIcon,
      tone: "warning",
    },
  ] as const;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <AnalyticsMetricCard
          key={card.key}
          label={t(card.key)}
          badge={
            card.key === "totalUsers" || card.key === "totalSessions" ? (
              <span className="shrink-0 rounded-md bg-gray-50 px-1.5 py-0.5 text-theme-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {t("allTime")}
              </span>
            ) : undefined
          }
          value={card.value == null ? null : format.number(card.value)}
          icon={<card.icon />}
          tone={card.tone}
          trend={overview?.top_kpis ? metricTrend(overview, card.field) : null}
        >
          {card.key === "dailyActiveUsers" &&
            growth != null &&
            (!overview?.top_kpis || !metricTrend(overview, card.field)) && (
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-theme-xs">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium ${growth === 0 ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" : growth < 0 ? "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400" : "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"}`}
                >
                  {growth === 0 ? (
                    <span aria-hidden="true">—</span>
                  ) : growth < 0 ? (
                    <ArrowDownIcon aria-hidden="true" className="size-3" />
                  ) : (
                    <ArrowUpIcon aria-hidden="true" className="size-3" />
                  )}
                  {format.number(growth / 100, {
                    style: "percent",
                    maximumFractionDigits: 1,
                    signDisplay: "exceptZero",
                  })}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {t("vsYesterdayCount", {
                    count: format.number(
                      overview!.daily_active_users.yesterday_count,
                    ),
                  })}
                </span>
              </span>
            )}
        </AnalyticsMetricCard>
      ))}
    </div>
  );
}
