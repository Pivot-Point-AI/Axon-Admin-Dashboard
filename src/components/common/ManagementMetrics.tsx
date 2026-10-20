import type { ReactNode } from "react";

export interface ManagementMetric {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone: "brand" | "success" | "warning" | "purple" | "error";
  description?: string;
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
        <div
          key={item.label}
          aria-busy={loading}
          className="axon-metric relative flex min-h-28 min-w-0 items-start gap-3 overflow-hidden rounded-xl border border-brand-100/70 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <div
            aria-hidden="true"
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl [&>svg]:size-5 ${tones[item.tone]}`}
          >
            {item.icon}
          </div>
          <div className="min-w-0">
            <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-300">
              {item.label}
            </p>
            <p
              className={`mt-2 font-semibold tracking-tight break-words text-gray-950 tabular-nums dark:text-white/90 ${typeof item.value === "string" && item.value.length > 9 ? "text-xl" : "text-2xl"}`}
            >
              {loading ? "\u2014" : item.value}
            </p>
            {item.description && (
              <p className="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
