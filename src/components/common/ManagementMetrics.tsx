import type { ReactNode } from "react";

export interface ManagementMetric {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone: "brand" | "success" | "warning" | "purple" | "error";
  description?: string;
  showTrendIcon?: boolean;
}
interface ManagementMetricsProps {
  items: ManagementMetric[];
  loading?: boolean;
}
const tones = {
  brand: "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
  success:
    "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400",
  warning:
    "bg-warning-50 text-warning-500 dark:bg-warning-500/15 dark:text-warning-400",
  purple:
    "bg-theme-purple-500/10 text-theme-purple-500 dark:bg-theme-purple-500/15 dark:text-theme-purple-500",
  error: "bg-error-50 text-error-500 dark:bg-error-500/15 dark:text-error-400",
};
export default function ManagementMetrics({
  items,
  loading,
}: ManagementMetricsProps) {
  return (
    <div
      className={`axon-management-metrics grid grid-cols-1 gap-4 sm:grid-cols-2 ${items.length === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}
    >
      {items.map((item) => (
        <article
          key={item.label}
          aria-busy={loading}
          className="axon-metric flex min-w-0 flex-col rounded-xl border border-gray-200/80 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              aria-hidden="true"
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg [&>svg]:size-4 ${tones[item.tone]}`}
            >
              {item.icon}
            </div>
            <p className="truncate text-theme-xs font-medium text-gray-500 dark:text-gray-400">
              {item.label}
            </p>
          </div>
          <div className="mt-2.5">
            <p
              className={`leading-8 font-bold tracking-tight break-words text-gray-950 tabular-nums dark:text-white ${typeof item.value === "string" && item.value.length > 9 ? "text-lg" : "text-xl sm:text-2xl"}`}
            >
              {loading ? "\u2014" : item.value}
            </p>
          </div>
          {item.description && (
            <p className="mt-2 text-theme-xs leading-5 text-gray-500 dark:text-gray-400">
              {loading ? "\u2014" : item.description}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
