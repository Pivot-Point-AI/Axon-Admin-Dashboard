import type { ReactNode } from "react";

interface AnalyticsMetricCardProps {
  label: string;
  value: string | null;
  description: string;
  icon: ReactNode;
  tone?: "brand" | "success" | "purple" | "warning";
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
};

export default function AnalyticsMetricCard({
  label,
  value,
  description,
  icon,
  tone = "brand",
  progress,
  children,
}: AnalyticsMetricCardProps) {
  const palette = tones[tone];
  return (
    <article
      aria-label={label}
      aria-busy={value === null}
      className="flex min-h-36 min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs transition-shadow motion-safe:hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </h3>
        <span
          aria-hidden="true"
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg [&>svg]:size-4 ${palette.icon}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 text-title-sm font-semibold tracking-tight text-gray-900 tabular-nums dark:text-white/90">
        {value ?? (
          <span
            aria-hidden="true"
            className="inline-block h-8 w-16 animate-pulse rounded-md bg-gray-100 motion-reduce:animate-none dark:bg-gray-800"
          />
        )}
      </p>
      {description && (
        <p className="mt-1 text-theme-xs leading-4 text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {children && (
        <div className="mt-1 flex flex-wrap items-center gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
          {children}
        </div>
      )}
      {progress != null && (
        <div className="mt-auto pt-3">
          <div
            role="progressbar"
            aria-label={label}
            aria-valuenow={Math.min(100, Math.max(0, progress))}
            aria-valuetext={value ?? undefined}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <div
              className={`h-full rounded-full motion-safe:transition-all motion-safe:duration-500 ${palette.bar}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </article>
  );
}
