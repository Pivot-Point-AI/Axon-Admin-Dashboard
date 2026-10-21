"use client";

import { useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import {
  ArrowDownIcon,
  BoltIcon,
  CloseLineIcon,
  GroupIcon,
  TimeIcon,
  UserIcon,
} from "@/icons";
import { analyticsNumber } from "./analyticsData";
import AnalyticsValue from "./AnalyticsValue";
import MetricTrend from "./MetricTrend";
import { lowerMetricIsBetter, metricTrend } from "./analyticsTrends";

interface AnalyticsJourneyMetricsProps {
  data: Record<string, unknown>;
}
const metrics = [
  {
    field: "total_cancelled_flows",
    icon: UserIcon,
    tone: "bg-brand-25 dark:bg-brand-500/10",
    iconTone:
      "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-300",
  },
  {
    field: "total_failed_flows",
    icon: CloseLineIcon,
    tone: "bg-error-25 dark:bg-error-500/5",
    iconTone:
      "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400",
  },
  {
    field: "total_abandoned_flows",
    icon: TimeIcon,
    tone: "bg-orange-25 dark:bg-orange-500/5",
    iconTone:
      "bg-orange-50 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400",
  },
  {
    field: "abandoned_flows_count",
    icon: ArrowDownIcon,
    tone: "bg-error-25 dark:bg-error-500/5",
    iconTone:
      "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400",
  },
  {
    field: "flow_drop_off_rate_pct",
    icon: BoltIcon,
    tone: "bg-theme-purple-500/5 dark:bg-theme-purple-500/10",
    iconTone:
      "bg-theme-purple-500/10 text-theme-purple-500 dark:bg-theme-purple-500/15 dark:text-theme-purple-500",
  },
  {
    field: "average_steps_per_completed_flow",
    icon: GroupIcon,
    tone: "bg-blue-light-25 dark:bg-blue-light-500/5",
    iconTone:
      "bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300",
  },
];
export default function AnalyticsJourneyMetrics({
  data,
}: AnalyticsJourneyMetricsProps) {
  const t = useTranslations("analytics");
  return (
    <ComponentCard title={t("design.journeyDetails")} icon={<GroupIcon />}>
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        {metrics.map(({ field, icon: Icon, tone, iconTone }) => (
          <div key={field} className={`min-w-0 rounded-xl p-3 ${tone}`}>
            <dt className="flex items-start gap-2 text-theme-xs leading-5 text-gray-600 dark:text-gray-400">
              <span
                aria-hidden="true"
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconTone}`}
              >
                <Icon className="size-4" />
              </span>
              <span>{t(`fields.${field}`)}</span>
            </dt>
            <dd className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 tabular-nums dark:text-white/90">
              <AnalyticsValue
                value={analyticsNumber(data[field])}
                field={field}
              />
            </dd>
            <div className="mt-1">
              <MetricTrend
                compact
                trend={metricTrend(data, field, ["outcomes_at_a_glance"])}
                lowerIsBetter={lowerMetricIsBetter(field)}
              />
            </div>
          </div>
        ))}
      </dl>
    </ComponentCard>
  );
}
