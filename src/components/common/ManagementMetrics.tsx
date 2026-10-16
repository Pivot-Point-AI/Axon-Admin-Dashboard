import type { ReactNode } from "react";

export interface ManagementMetric {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone: "brand" | "success" | "warning" | "purple" | "error";
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-5 rounded-2xl border border-brand-100 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/3"
        >
          <div
            className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${tones[item.tone]}`}
          >
            {item.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white/90">
              {loading ? "\u2014" : item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
