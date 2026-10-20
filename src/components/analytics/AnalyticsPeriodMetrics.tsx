"use client";

import { useFormatter } from "next-intl";
import { CalenderIcon, GroupIcon } from "@/icons";
import type { AnalyticsPeriodPoint } from "./AnalyticsPeriodChart";

interface AnalyticsPeriodMetricsProps {
  points: AnalyticsPeriodPoint[];
}

const tones = [
  "bg-brand-25 dark:bg-brand-500/10",
  "bg-theme-purple-500/5 dark:bg-theme-purple-500/10",
  "bg-success-50 dark:bg-success-500/10",
];

export default function AnalyticsPeriodMetrics({
  points,
}: AnalyticsPeriodMetricsProps) {
  const format = useFormatter();
  return (
    <dl className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
      {points.map((point, index) => (
        <div
          key={point.label}
          className={`relative rounded-xl p-3 ${tones[index % tones.length]}`}
        >
          <dt className="pe-4 text-theme-xs text-gray-600 dark:text-gray-400">
            {point.label}
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-gray-950 tabular-nums dark:text-white/90">
            {point.value === null ? "—" : format.number(point.value)}
          </dd>
          <span
            aria-hidden="true"
            className="absolute end-3 top-3 hidden text-brand-500 sm:block dark:text-brand-300"
          >
            {index === 0 ? (
              <GroupIcon className="size-4" />
            ) : (
              <CalenderIcon className="size-4" />
            )}
          </span>
        </div>
      ))}
    </dl>
  );
}
