"use client";

import { useFormatter, useTranslations } from "next-intl";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import { useAnalyticsPeriod } from "./AnalyticsPeriodContext";
import ComponentCard from "@/components/common/ComponentCard";
import {
  BoltIcon,
  CalenderIcon,
  ChartBarsIcon,
  GroupIcon,
  PieChartIcon,
  RefreshIcon,
  UserIcon,
} from "@/icons";
import { analyticsNumber, asAnalyticsRecord } from "./analyticsData";
import MetricTrend from "./MetricTrend";
import {
  blockInfo,
  metricTrend,
  readMetricTrend,
  type MetricTrendData,
} from "./analyticsTrends";

interface AnalyticsAcquisitionProps {
  data: Record<string, unknown>;
}

interface AcquisitionRow {
  key: string;
  label: string;
  value: number | string | null;
  trend: MetricTrendData | null;
}

const icons = [
  UserIcon,
  CalenderIcon,
  GroupIcon,
  PieChartIcon,
  ChartBarsIcon,
  RefreshIcon,
  BoltIcon,
];

const legacyFields = [
  "new_users_today",
  "new_users_this_week",
  "new_users_this_month",
];

export default function AnalyticsAcquisition({
  data,
}: AnalyticsAcquisitionProps) {
  const t = useTranslations("analytics");
  const tInfo = useTranslations("analytics.design.info");
  const format = useFormatter();
  const reporting = useAnalyticsPeriod();

  // The response lists every acquisition metric with its own label, value and
  // comparison; older responses only carry the three headline counts.
  const block = asAnalyticsRecord(data.new_user_acquisition);
  const listed = Array.isArray(block.metrics) ? block.metrics : [];
  const rows: AcquisitionRow[] = listed.length
    ? listed.map((entry, index) => {
        const record = asAnalyticsRecord(entry);
        const label =
          typeof record.metric === "string" ? record.metric : `#${index + 1}`;
        return {
          key: label,
          label,
          value:
            typeof record.value === "string"
              ? record.value
              : analyticsNumber(record.value),
          trend: readMetricTrend(record),
        };
      })
    : legacyFields.map((field) => ({
        key: field,
        label: t(`fields.${field}`),
        value: analyticsNumber(data[field]),
        trend: metricTrend(data, field, ["new_user_acquisition"]),
      }));

  const actions = reporting ? (
    <AnalyticsJourneyPeriod
      value={reporting.period ?? "customRange"}
      onChange={reporting.onChange}
    />
  ) : undefined;

  return (
    <ComponentCard
      title={t("design.newUsers")}
      description={t("design.newUsersDescription")}
      icon={<UserIcon />}
      actions={actions}
      info={blockInfo(data, "new_user_acquisition") ?? tInfo("newUsers")}
      className="h-full"
    >
      <dl className="divide-y divide-gray-100 border-t border-gray-200 pt-4 dark:divide-gray-800 dark:border-gray-700">
        {rows.map((row, index) => {
          const RowIcon = icons[index % icons.length];
          return (
            <div
              key={row.key}
              className="grid grid-cols-[minmax(0,1.2fr)_5rem_minmax(0,1fr)] items-center gap-x-3 py-3 first:pt-0 last:pb-0"
            >
              <dt className="flex min-w-0 items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300"
                >
                  <RowIcon className="size-4" />
                </span>
                <span className="min-w-0 font-medium break-words text-gray-700 dark:text-gray-300">
                  {row.label}
                </span>
              </dt>
              <dd className="contents">
                <span className="text-center text-sm font-bold text-gray-950 tabular-nums dark:text-white">
                  {typeof row.value === "number"
                    ? format.number(row.value, { maximumFractionDigits: 2 })
                    : (row.value ?? "—")}
                </span>
                <span className="flex min-w-0 justify-end [&>span]:justify-end">
                  <MetricTrend compact trend={row.trend} />
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
    </ComponentCard>
  );
}
