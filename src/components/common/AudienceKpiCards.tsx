"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ChatIcon, DatabaseIcon, GroupIcon, UserIcon } from "@/icons";
import AnalyticsMetricCard from "@/components/dashboard/AnalyticsMetricCard";
import {
  analyticsNumber,
  asAnalyticsRecord,
} from "@/components/analytics/analyticsData";
import {
  blockInfo,
  metricInfo,
  metricTrend,
} from "@/components/analytics/analyticsTrends";

interface AudienceKpiCardsProps {
  data: unknown;
}

const cards = [
  { field: "total_users", label: "totalUsers", icon: GroupIcon },
  { field: "total_sessions", label: "totalSessions", icon: DatabaseIcon },
  { field: "daily_active_users", label: "dailyActiveUsers", icon: UserIcon },
  { field: "active_sessions", label: "activeSessions", icon: ChatIcon },
] as const;

export default function AudienceKpiCards({ data }: AudienceKpiCardsProps) {
  const t = useTranslations("dashboardAnalytics");
  const tInfo = useTranslations("analytics.design.info");
  const format = useFormatter();
  const root = asAnalyticsRecord(data);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ field, label, icon: Icon }) => {
        const raw = root[field];
        const value =
          analyticsNumber(raw) ?? analyticsNumber(asAnalyticsRecord(raw).count);
        return (
          <AnalyticsMetricCard
            key={field}
            label={t(label)}
            icon={<Icon />}
            value={
              value === null
                ? data == null
                  ? null
                  : "0"
                : format.number(value)
            }
            info={
              metricInfo(data, field, [
                "top_kpis",
                "current_active_sessions",
              ]) ??
              (field === "active_sessions"
                ? blockInfo(data, "current_active_sessions")
                : null) ??
              tInfo(
                field === "total_users"
                  ? "totalUsers"
                  : field === "total_sessions"
                    ? "totalSessions"
                    : field === "daily_active_users"
                      ? "dailyActiveUsers"
                      : "activeSessions",
              )
            }
            trend={metricTrend(data, field)}
          />
        );
      })}
    </div>
  );
}
