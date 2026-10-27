import CountUpText from "@/components/common/CountUpText";
import MetricHeader from "@/components/common/MetricHeader";
import type { ReactNode } from "react";
import { MetricTrendBadge } from "@/components/analytics/MetricTrend";
import type { MetricTrendData } from "@/components/analytics/analyticsTrends";

interface AnalyticsMetricCardProps {
  label: string;
  badge?: ReactNode;
  iconStart?: boolean;
  value: string | null;
  description?: string;
  icon: ReactNode;
  progress?: number;
  /** A stacked bar for a count split into parts; widths are shares of the whole. */
  segments?: { label: string; share: number; className: string }[];
  children?: ReactNode;
  trend?: MetricTrendData | null;
  trendVariant?: "line" | "bar";
  lowerIsBetter?: boolean;
  info?: string | null;
}





export default function AnalyticsMetricCard({
  label,
  badge,
  iconStart = false,
  value,
  description = "",
  icon,
  progress,
  segments,
  children,
  trend,
  trendVariant = "line",
  lowerIsBetter = false,
  info,
}: AnalyticsMetricCardProps) {
  const metricValue = (
    <p className="shrink-0 text-lg font-bold tracking-tight text-gray-950 tabular-nums sm:text-xl dark:text-white">
      {value != null ? (
        <CountUpText text={value} />
      ) : (
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
      <MetricHeader
        label={label}
        icon={icon}
        badge={badge}
        iconStart={iconStart}
        info={info}
      />
      <div className="mt-2.5 flex min-w-0 flex-nowrap items-center gap-x-1.5">
        {metricValue}
        {trend && (
          <div className="@container min-w-0 flex-1">
            <MetricTrendBadge trend={trend} lowerIsBetter={lowerIsBetter} />
          </div>
        )}
        {children}
      </div>
      {description && (
        <p className="mt-2 text-theme-xs leading-5 text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {segments && segments.some((segment) => segment.share > 0) && (
        <div className="mt-auto flex items-center gap-3 pt-2">
          <div
            role="img"
            aria-label={segments
              .map((segment) => `${segment.label} ${segment.share}%`)
              .join(", ")}
            title={segments
              .map((segment) => `${segment.label}: ${segment.share}%`)
              .join(" · ")}
            className="flex h-1.5 flex-1 gap-px overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
          >
            {segments.map((segment) => (
              <div
                key={segment.label}
                className={`axon-grow-x h-full ${segment.className}`}
                style={{
                  width: `${Math.min(100, Math.max(0, segment.share))}%`,
                }}
              />
            ))}
          </div>
        </div>
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
                className="axon-grow-x h-full rounded-full bg-blue-light-500 motion-safe:transition-all motion-safe:duration-500 dark:bg-blue-light-400"
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
