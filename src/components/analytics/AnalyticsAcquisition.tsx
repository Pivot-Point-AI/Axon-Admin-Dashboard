"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { ChevronDownIcon, UserIcon } from "@/icons";
import { analyticsNumber } from "./analyticsData";
import AnalyticsPeriodChart from "./AnalyticsPeriodChart";
import AnalyticsPeriodMetrics from "./AnalyticsPeriodMetrics";
import { metricHistory, metricTrend } from "./analyticsTrends";

interface AnalyticsAcquisitionProps {
  data: Record<string, unknown>;
}

export default function AnalyticsAcquisition({
  data,
}: AnalyticsAcquisitionProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const [period, setPeriod] = useState("last30Days");
  const points = [
    "new_users_today",
    "new_users_this_week",
    "new_users_this_month",
  ].map((field) => ({
    label: t(`fields.${field}`),
    value: analyticsNumber(data[field]),
    trend: metricTrend(data, field, ["new_user_acquisition"]),
  }));
  const history = metricHistory(data, "new_user_acquisition");
  const hasHistory = history.some((point) => point.value !== null);
  const fullChartPoints = hasHistory
    ? history.map((point, index) => {
        const date =
          point.label && /^\d{4}-\d{2}-\d{2}/.test(point.label)
            ? new Date(point.label)
            : null;
        return {
          value: point.value,
          label:
            date && Number.isFinite(date.getTime())
              ? format.dateTime(date, { month: "short", day: "numeric" })
              : (point.label ?? format.number(index + 1)),
        };
      })
    : points;

  const chartPoints = (() => {
    if (!fullChartPoints || fullChartPoints.length <= 1) return fullChartPoints;
    switch (period) {
      case "today":
        return fullChartPoints.slice(-1);
      case "last7Days":
        return fullChartPoints.slice(-7);
      case "last14Days":
        return fullChartPoints.slice(-14);
      case "last30Days":
        return fullChartPoints.slice(-30);
      case "allTime":
      default:
        return fullChartPoints;
    }
  })();

  const actions = (
    <div className="relative inline-flex items-center">
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        aria-label={t("design.reportingPeriod")}
        className="h-8 appearance-none rounded-lg border border-gray-200 bg-white pe-7 ps-3 text-theme-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        <option value="last30Days">{t("design.last30Days")}</option>
        <option value="last14Days">{t("design.last14Days")}</option>
        <option value="last7Days">{t("design.last7Days")}</option>
        <option value="today">{t("design.today")}</option>
        <option value="allTime">{t("design.allTime")}</option>
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute end-2 size-3.5 text-gray-400"
      />
    </div>
  );

  return (
    <ComponentCard
      title={t("design.newUsers")}
      description={t(
        hasHistory
          ? "design.newUsersHistoryDescription"
          : "design.newUsersDescription",
      )}
      icon={<UserIcon />}
      actions={actions}
      className="h-full"
    >
      <AnalyticsPeriodChart points={chartPoints} variant="bar" />
      <AnalyticsPeriodMetrics points={points} isAcquisition />
    </ComponentCard>
  );
}
