"use client";

import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { ArrowDownIcon, ArrowUpIcon, GroupIcon } from "@/icons";
import { analyticsNumber, asAnalyticsRecord } from "./analyticsData";
import AnalyticsPeriodChart from "./AnalyticsPeriodChart";
import AnalyticsPeriodMetrics from "./AnalyticsPeriodMetrics";

interface AnalyticsAudienceActivityProps {
  data: Record<string, unknown>;
}

export default function AnalyticsAudienceActivity({
  data,
}: AnalyticsAudienceActivityProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const periods = [
    "daily_active_users",
    "weekly_active_users",
    "monthly_active_users",
  ] as const;
  const points = periods.map((field, index) => ({
    label: t(`design.periods.${index}`),
    value: analyticsNumber(data[field]),
  }));
  const growth = asAnalyticsRecord(data.daily_active_users_growth);
  const change = analyticsNumber(growth.growth_pct);
  const yesterday = analyticsNumber(growth.yesterday_count);
  return (
    <ComponentCard
      title={t("design.activeAudience")}
      description={t("design.activeAudienceDescription")}
      className="h-full"
      icon={<GroupIcon />}
    >
      <AnalyticsPeriodChart points={points} />
      <AnalyticsPeriodMetrics points={points} />
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 text-theme-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
        {change !== null && (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium ${change < 0 ? "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400" : "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"}`}
          >
            {change < 0 ? (
              <ArrowDownIcon className="size-3.5" />
            ) : (
              <ArrowUpIcon className="size-3.5" />
            )}
            {format.number(change / 100, {
              style: "percent",
              maximumFractionDigits: 1,
              signDisplay: "exceptZero",
            })}
          </span>
        )}
        <span>
          {change === null
            ? t("design.activityFootnote")
            : t("design.vsYesterday")}
          {yesterday !== null && change !== null
            ? ` (${format.number(yesterday)})`
            : ""}
        </span>
      </div>
    </ComponentCard>
  );
}
