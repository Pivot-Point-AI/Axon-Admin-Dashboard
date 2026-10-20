"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChatIcon,
  GroupIcon,
  UserCircleIcon,
} from "@/icons";
import type { DashboardOverviewResponse } from "@/lib/api/types";
import AnalyticsMetricCard from "./AnalyticsMetricCard";

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
      value: overview?.total_users,
      icon: GroupIcon,
      tone: "brand",
    },
    {
      key: "totalSessions",
      value: overview?.total_sessions,
      icon: ChatIcon,
      tone: "brand",
    },
    {
      key: "dailyActiveUsers",
      value: overview?.daily_active_users.count,
      icon: UserCircleIcon,
      tone: "brand",
    },
    {
      key: "activeSessions",
      value: overview?.active_sessions,
      icon: ChatIcon,
      tone: "success",
    },
  ] as const;
  return (
    <div className="grid grid-cols-1 gap-3 2xsm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <AnalyticsMetricCard
          key={card.key}
          label={t(card.key)}
          badge={
            card.key === "totalUsers" || card.key === "totalSessions" ? (
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-theme-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {t("allTime")}
              </span>
            ) : undefined
          }
          value={card.value == null ? null : format.number(card.value)}
          icon={<card.icon />}
          tone={card.tone}
        >
          {card.key === "dailyActiveUsers" && growth != null && (
            <>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium ${growth < 0 ? "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400" : "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"}`}
              >
                {growth < 0 ? (
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
              <span>
                {t("vsYesterdayCount", {
                  count: format.number(
                    overview!.daily_active_users.yesterday_count,
                  ),
                })}
              </span>
            </>
          )}
        </AnalyticsMetricCard>
      ))}
    </div>
  );
}
