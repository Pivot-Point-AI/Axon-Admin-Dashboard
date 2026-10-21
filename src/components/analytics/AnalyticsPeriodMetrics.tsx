"use client";

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

const iconTones = [
  "bg-white text-brand-500 shadow-2xs dark:bg-gray-800 dark:text-brand-300",
  "bg-white text-theme-purple-500 shadow-2xs dark:bg-gray-800 dark:text-theme-purple-400",
  "bg-white text-success-600 shadow-2xs dark:bg-gray-800 dark:text-success-400",
];

export default function AnalyticsPeriodMetrics({
  points,
  isAcquisition = false,
}: AnalyticsPeriodMetricsProps) {
  const format = useFormatter();
  return (
    <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {points.map((point, index) => (
        <div
          key={point.label}
          className={`relative rounded-xl p-3 sm:p-3.5 ${tones[index % tones.length]}`}
        >
          <dt className="flex items-center justify-between text-theme-xs font-medium text-gray-700 dark:text-gray-300">
            <span>{point.label}</span>
            <span
              aria-hidden="true"
              className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${iconTones[index % iconTones.length]}`}
            >
              {!isAcquisition && index === 0 ? (
                <GroupIcon className="size-4" />
              ) : (
                <CalenderIcon className="size-4" />
              )}
            </span>
          </dt>
          <dd className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-950 tabular-nums dark:text-white shrink-0">
              {point.value === null ? "—" : format.number(point.value)}
            </span>
            {point.trend && (
              <MetricTrendBadge trend={point.trend} showComparison={false} />
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
