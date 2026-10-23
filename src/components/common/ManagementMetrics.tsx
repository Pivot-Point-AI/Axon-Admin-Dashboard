import CountUpText from "./CountUpText";
import MetricHeader from "./MetricHeader";
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
          <MetricHeader label={item.label} icon={item.icon} />
          <div className="mt-2.5 flex min-w-0 flex-nowrap items-baseline gap-x-2">
            <p
              className={`shrink-0 leading-8 font-bold tracking-tight text-gray-950 tabular-nums dark:text-white ${typeof item.value === "string" && item.value.length > 9 ? "text-lg" : "text-lg sm:text-xl"}`}
            >
              {loading ? (
                "—"
              ) : typeof item.value === "string" ? (
                <CountUpText text={item.value} />
              ) : (
                <CountUpText text={String(item.value)} />
              )}
            </p>
            {item.description && (
              <p
                title={item.description}
                className="min-w-0 truncate text-theme-xs text-gray-500 dark:text-gray-400"
              >
                {loading ? "—" : item.description}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
