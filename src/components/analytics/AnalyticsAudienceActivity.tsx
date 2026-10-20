"use client";

import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { analyticsNumber, asAnalyticsRecord } from "./analyticsData";

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
  const max = Math.max(
    1,
    ...periods.map((field) => analyticsNumber(data[field]) ?? 0),
  );
  const growth = asAnalyticsRecord(data.daily_active_users_growth);
  const change = analyticsNumber(growth.growth_pct);
  const yesterday = analyticsNumber(growth.yesterday_count);
  const bars = [
    "bg-brand-500 dark:bg-brand-400",
    "bg-brand-300 dark:bg-brand-500",
    "bg-brand-100 dark:bg-brand-700",
  ];
  return (
    <ComponentCard
      title={t("design.activeAudience")}
      description={t("design.activeAudienceDescription")}
      className="h-full"
    >
      <div className="space-y-6 py-2">
        {periods.map((field, index) => (
          <div key={field}>
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t(`design.periods.${index}`)}
              </span>
              <span className="text-base font-semibold text-gray-900 tabular-nums dark:text-white/90">
                {data[field] == null ? "—" : format.number(Number(data[field]))}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-50 dark:bg-gray-800">
              <div
                className={`h-full rounded-full motion-safe:transition-all motion-safe:duration-500 ${bars[index]}`}
                style={{
                  width: `${Math.max(0, ((analyticsNumber(data[field]) ?? 0) / max) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
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
