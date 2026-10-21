import type { ReactNode } from "react";
import { MetricTrendBadge } from "@/components/analytics/MetricTrend";
import type { MetricTrendData } from "@/components/analytics/analyticsTrends";

interface AnalyticsMetricCardProps {
  label: string;
  badge?: ReactNode;
  value: string | null;
  description?: string;
  icon: ReactNode;
  tone?: "brand" | "success" | "purple" | "warning" | "pink" | "error";
  progress?: number;
  children?: ReactNode;
  trend?: MetricTrendData | null;
  trendVariant?: "line" | "bar";
  lowerIsBetter?: boolean;
}

const tones = {
  brand: {
    icon: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300",
    bar: "bg-brand-500 dark:bg-brand-400",
  },
  success: {
    icon: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
    bar: "bg-success-500 dark:bg-success-400",
  },
  purple: {
    icon: "bg-theme-purple-500/10 text-theme-purple-500 dark:bg-theme-purple-500/10 dark:text-theme-purple-500",
    bar: "bg-theme-purple-500 dark:bg-theme-purple-500",
  },
  warning: {
    icon: "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400",
    bar: "bg-warning-500 dark:bg-warning-400",
  },
  pink: {
    icon: "bg-theme-pink-500/10 text-theme-pink-500 dark:bg-theme-pink-500/15 dark:text-theme-pink-500",
    bar: "bg-theme-pink-500 dark:bg-theme-pink-500",
  },
  error: {
    icon: "bg-error-50 text-error-500 dark:bg-error-500/15 dark:text-error-400",
    bar: "bg-error-500 dark:bg-error-400",
  },
};

export default function AnalyticsMetricCard({
  label,
  badge,
  value,
  description = "",
  icon,
  tone = "brand",
  progress,
  children,
  trend,
  trendVariant = "line",
  lowerIsBetter = false,
}: AnalyticsMetricCardProps) {
  const palette = tones[tone];
  const metricValue = (
    <p className="text-xl font-bold tracking-tight text-gray-950 tabular-nums sm:text-2xl dark:text-white shrink-0">
      {value ?? (
        <span
          aria-hidden="true"
          className="inline-block h-8 w-16 animate-pulse rounded-md bg-gray-100 motion-reduce:animate-none dark:bg-gray-800"
        />
      )}
    </p>
  );
  return (
    <article
      aria-label={label}
      aria-busy={value === null}
      className="axon-metric flex min-w-0 flex-col rounded-xl border border-gray-200/80 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg [&>svg]:size-4 ${palette.icon}`}
          >
            {icon}
          </span>
          <h3 className="truncate text-theme-xs font-medium text-gray-500 dark:text-gray-400">
            {label}
          </h3>
        </div>
        {badge}
      </div>
      <div className="mt-2.5 flex min-w-0 items-baseline gap-2">
        {metricValue}
        {trend && (
          <div className="min-w-0 flex-1">
            <MetricTrendBadge
              trend={trend}
              lowerIsBetter={lowerIsBetter}
            />
          </div>
        )}
        {children}
      </div>
      {description && (
        <p className="mt-2 text-theme-xs leading-5 text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {progress != null &&
        !(
          trendVariant === "bar" &&
          trend?.points.some((point) => point.value !== null)
        ) && (
          <div className="mt-auto flex items-center gap-3 pt-2">
            <div
              role="progressbar"
              aria-label={label}
              aria-valuenow={Math.min(100, Math.max(0, progress))}
              aria-valuetext={value ?? undefined}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <div
                className={`h-full rounded-full motion-safe:transition-all motion-safe:duration-500 ${palette.bar}`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <span
              aria-hidden="true"
              className="shrink-0 text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              {value}
            </span>
          </div>
        )}
    </article>
  );
}
