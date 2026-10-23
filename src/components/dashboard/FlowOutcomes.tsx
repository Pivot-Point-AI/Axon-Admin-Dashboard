"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  ArrowRightIcon,
  PlayIcon,
  CheckCircleIcon,
  CloseLineIcon,
} from "@/icons";
import { Link } from "@/i18n/navigation";
import type { DashboardOverviewResponse } from "@/lib/api/types";
import AnalyticsMetricCard from "./AnalyticsMetricCard";
import { metricTrend } from "@/components/analytics/analyticsTrends";

interface FlowOutcomesProps {
  overview: DashboardOverviewResponse | null;
  periodLabel: string;
}

export default function FlowOutcomes({
  overview,
  periodLabel,
}: FlowOutcomesProps) {
  const t = useTranslations("dashboardAnalytics");
  const format = useFormatter();
  const percent = (value: number | undefined) =>
    value == null
      ? null
      : format.number(value / 100, {
          style: "percent",
          maximumFractionDigits: 1,
        });
  return (
    <section aria-label={t("flowTitle")}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">
              {t("flowTitle")}
            </h2>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-theme-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {periodLabel}
            </span>
          </div>
        </div>
        <Link
          href="/analytics?section=flows"
          className="inline-flex items-center gap-1 text-theme-xs font-semibold text-brand-600 hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 dark:text-brand-300 dark:hover:text-brand-200"
        >
          {t("viewAll")}
          <ArrowRightIcon
            aria-hidden="true"
            className="size-3.5 rtl:rotate-180"
          />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <AnalyticsMetricCard
          label={t("totalFlowsInitiated")}
          value={
            overview ? format.number(overview.total_flows_initiated) : null
          }
          description={t("flowsInitiatedDescription")}
          icon={<PlayIcon />}
          iconStart
          trend={metricTrend(overview, "total_flows_initiated", [
            "banking_journeys",
          ])}
          trendVariant="bar"
        />
        <AnalyticsMetricCard
          label={t("flowCompletionRate")}
          value={percent(overview?.flow_completion_rate_pct)}
          description={t("flowCompletionDescription")}
          icon={<CheckCircleIcon />}
          iconStart
          progress={overview?.flow_completion_rate_pct}
          trend={metricTrend(overview, "flow_completion_rate_pct", [
            "banking_journeys",
          ])}
          trendVariant="bar"
        />
        <AnalyticsMetricCard
          label={t("flowAbandonmentRate")}
          value={percent(overview?.flow_abandonment_rate_pct)}
          description={t("flowAbandonmentDescription")}
          icon={<CloseLineIcon />}
          iconStart
          progress={overview?.flow_abandonment_rate_pct}
          trend={metricTrend(overview, "flow_abandonment_rate_pct", [
            "banking_journeys",
          ])}
          trendVariant="bar"
          lowerIsBetter
        />
      </div>
      {overview?.total_flows_initiated === 0 && (
        <p className="mt-2 text-theme-xs text-gray-500 dark:text-gray-400">
          {t("noFlows")}
        </p>
      )}
    </section>
  );
}
