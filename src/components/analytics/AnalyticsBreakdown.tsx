"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import { analyticsTableRows } from "./analyticsData";
import AnalyticsDataTable from "./AnalyticsDataTable";
import AnalyticsDetails from "./AnalyticsDetails";
import AnalyticsColumnChart from "./AnalyticsColumnChart";
import AnalyticsDonutChart from "./AnalyticsDonutChart";
import AnalyticsPeriodChart from "./AnalyticsPeriodChart";
import { chartColor, chartKinds, chartRows } from "./analyticsChartData";
import { analyticsNumber, asAnalyticsRecord } from "./analyticsData";
import { ChartBarsIcon, PieChartIcon } from "@/icons";

interface AnalyticsBreakdownProps {
  field: string;
  value: unknown;
  className?: string;
}

export default function AnalyticsBreakdown({
  field,
  value,
  className,
}: AnalyticsBreakdownProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const [expanded, setExpanded] = useState(false);
  const kind = chartKinds[field] ?? "ranking";
  const ordered = kind === "columns" || kind === "area";
  const rows = chartRows(field, value);
  const journeys = field === "top_popular_flows";
  const limit = journeys ? 5 : 6;
  const visible = expanded || ordered ? rows : rows.slice(0, limit);
  const max = Math.max(1, ...rows.map((row) => row.count));
  const unit = field === "stage_averages_ms" ? t("design.milliseconds") : "";
  const label = (key: string) => {
    if (
      field === "guardrail_violations_by_risk" &&
      t.has(`design.riskLevels.${key.toLowerCase()}`)
    )
      return t(`design.riskLevels.${key.toLowerCase()}`);
    if (field === "peak_activity_hours" && /^\d+$/.test(key))
      return `${key.padStart(2, "0")}:00`;
    return t.has(`columns.${key}`)
      ? t(`columns.${key}`)
      : key.replaceAll("_", " ");
  };
  if (!rows.length && analyticsTableRows(value).length > 0)
    return <AnalyticsDataTable field={field} value={value} />;
  return (
    <ComponentCard
      title={t(`fields.${field}`)}
      description={
        t.has(`design.chartDescriptions.${field}`)
          ? t(`design.chartDescriptions.${field}`)
          : undefined
      }
      className={`h-full ${className ?? ""}`}
      icon={kind === "donut" ? <PieChartIcon /> : <ChartBarsIcon />}
      actions={
        journeys ? (
          <span className="rounded-lg border border-gray-200 px-3 py-2 text-theme-xs text-gray-600 dark:border-gray-700 dark:text-gray-400">
            {t("design.allTime")}
          </span>
        ) : undefined
      }
    >
      {!rows.length ? (
        <AnalyticsEmptyState />
      ) : kind === "columns" ? (
        <AnalyticsColumnChart
          rows={rows}
          label={label}
          color={(key, index) => chartColor(field, key, index)}
        />
      ) : kind === "area" ? (
        <div>
          <AnalyticsPeriodChart
            points={rows.map((row) => ({
              label: label(row.key).slice(0, 3),
              value: row.count,
            }))}
            color="purple"
          />
          <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {rows.map((row) => (
              <div
                key={row.key}
                className="flex items-center gap-2 text-theme-xs"
              >
                <dt className="text-gray-500 dark:text-gray-400">
                  {label(row.key)}
                </dt>
                <dd className="font-semibold text-gray-900 tabular-nums dark:text-gray-100">
                  {format.number(row.count)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : kind === "donut" ? (
        <AnalyticsDonutChart
          rows={rows}
          total={analyticsNumber(asAnalyticsRecord(value).total) ?? undefined}
          label={label}
          expanded={expanded}
        />
      ) : journeys ? (
        <div className="space-y-5 py-1">
          {visible.map((row, index) => (
            <div
              key={row.key}
              className="grid grid-cols-12 items-center gap-x-4 gap-y-2"
            >
              <span className="col-span-10 min-w-0 text-theme-xs break-words text-gray-700 capitalize sm:col-span-3 dark:text-gray-300">
                {label(row.key)}
              </span>
              <span className="col-span-2 text-end text-theme-xs font-semibold text-gray-950 tabular-nums sm:col-span-1 sm:col-start-12 sm:row-start-1 dark:text-gray-100">
                {format.number(row.count)}
              </span>
              <div
                aria-hidden="true"
                className="col-span-12 h-3 overflow-hidden rounded-full bg-gray-100 sm:col-span-8 sm:col-start-4 sm:row-start-1 dark:bg-gray-800"
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(row.count / max) * 100}%`,
                    background: chartColor(field, row.key, index),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5 py-1">
          {visible.map((row, index) => (
            <div key={row.key}>
              <div className="mb-2 flex items-start justify-between gap-4 text-sm">
                <span className="min-w-0 break-words text-gray-600 capitalize dark:text-gray-300">
                  {label(row.key)}
                </span>
                <span className="shrink-0 font-semibold text-gray-900 tabular-nums dark:text-white/90">
                  {format.number(row.count, { maximumFractionDigits: 2 })}
                  {unit && (
                    <span className="ms-1 text-theme-xs font-normal text-gray-400 dark:text-gray-500">
                      {unit}
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(row.count / max) * 100}%`,
                    background: chartColor(field, row.key, index),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {rows.length > 0 && (
        <AnalyticsDetails>
          <AnalyticsDataTable field={field} value={value} embedded />
        </AnalyticsDetails>
      )}
      {!ordered && rows.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-5 text-theme-xs font-semibold text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-brand-300"
        >
          {t(expanded ? "design.showLess" : "design.showAll")}
        </button>
      )}
    </ComponentCard>
  );
}
