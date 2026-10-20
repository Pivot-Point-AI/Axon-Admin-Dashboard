"use client";

import { useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { UserIcon } from "@/icons";
import { analyticsNumber } from "./analyticsData";
import AnalyticsPeriodChart from "./AnalyticsPeriodChart";
import AnalyticsPeriodMetrics from "./AnalyticsPeriodMetrics";

interface AnalyticsAcquisitionProps {
  data: Record<string, unknown>;
}

export default function AnalyticsAcquisition({
  data,
}: AnalyticsAcquisitionProps) {
  const t = useTranslations("analytics");
  const points = [
    "new_users_today",
    "new_users_this_week",
    "new_users_this_month",
  ].map((field) => ({
    label: t(`fields.${field}`),
    value: analyticsNumber(data[field]),
  }));
  return (
    <ComponentCard
      title={t("design.newUsers")}
      description={t("design.newUsersDescription")}
      icon={<UserIcon />}
      className="h-full"
    >
      <AnalyticsPeriodChart points={points} variant="bar" />
      <AnalyticsPeriodMetrics points={points} />
    </ComponentCard>
  );
}
