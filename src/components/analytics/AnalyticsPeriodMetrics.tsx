"use client";

import MetricHeader from "@/components/common/MetricHeader";
import { useFormatter } from "next-intl";
import { CalenderIcon, GroupIcon } from "@/icons";
import type { AnalyticsPeriodPoint } from "./AnalyticsPeriodChart";
import { MetricTrendBadge } from "./MetricTrend";

interface AnalyticsPeriodMetricsProps {
  points: AnalyticsPeriodPoint[];
  metricLabel?: string;
  isAcquisition?: boolean;
}

const tones = [
  "bg-brand-50/60 dark:bg-brand-500/10",
  "bg-theme-purple-500/5 dark:bg-theme-purple-500/10",
  "bg-success-50/60 dark:bg-success-500/10",
];

export default function AnalyticsPeriodMetrics({
  points,
  isAcquisition = false,
}: AnalyticsPeriodMetricsProps) {
  const format = useFormatter();
  return (
    <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {points.slice(0, 2).map((point, index) => (
        <div
          key={point.label}
          className={`relative rounded-xl p-3 sm:p-3.5 ${tones[index % tones.length]}`}
        >
          <dt>
            <MetricHeader
              label={point.label}
              icon={
                !isAcquisition && index === 0 ? <GroupIcon /> : <CalenderIcon />
              }
            />
          </dt>
          <dd className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 sm:flex-nowrap">
            <span className="shrink-0 text-xl font-bold tracking-tight text-gray-950 tabular-nums dark:text-white">
              {format.number(point.value ?? 0)}
            </span>
            {point.trend && (
              <div className="@container max-w-full min-w-0">
                <MetricTrendBadge trend={point.trend} full />
              </div>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
