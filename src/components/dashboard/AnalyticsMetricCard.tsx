import type { ReactNode } from "react";

interface AnalyticsMetricCardProps {
  label: string;
  badge?: ReactNode;
  value: string | null;
  description?: string;
  icon: ReactNode;
  tone?: "brand" | "success" | "purple" | "warning" | "pink" | "error";
  progress?: number;
  children?: ReactNode;
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
}: AnalyticsMetricCardProps) {
  const palette = tones[tone];
  const detailed = description.length > 0;
  const metricValue = (
    <p className="text-2xl font-semibold tracking-tight text-gray-950 tabular-nums dark:text-white/90">
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
      className={`axon-metric flex min-w-0 flex-col rounded-xl border border-brand-100 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 ${detailed ? "min-h-36" : "min-h-32"}`}
    >
      <div
        className={`flex gap-3 ${detailed ? "items-start" : "items-center"}`}
      >
        <span
          aria-hidden="true"
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl [&>svg]:size-5 ${palette.icon}`}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="min-w-0 text-theme-xs font-medium text-gray-700 dark:text-gray-300">
              {label}
            </h3>
            {badge}
          </div>
          {detailed && <div className="mt-1">{metricValue}</div>}
        </div>
      </div>
      {!detailed && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {metricValue}
          {children && (
            <div className="flex flex-wrap items-center gap-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
              {children}
            </div>
          )}
        </div>
      )}
      {detailed && children && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
          {children}
        </div>
      )}
      {description && (
        <p className="mt-2 text-theme-xs leading-5 text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {progress != null && (
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
