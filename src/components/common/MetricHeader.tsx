import type { ReactNode } from "react";

interface MetricHeaderProps {
  label: string;
  icon: ReactNode;
  badge?: ReactNode;
  iconStart?: boolean;
}

export default function MetricHeader({
  label,
  icon,
  badge,
  iconStart = false,
}: MetricHeaderProps) {
  return (
    <div
      className={`flex justify-between gap-3 ${badge ? "items-start" : "items-center"}`}
    >
      <div className={`min-w-0 ${iconStart ? "flex-1" : ""}`}>
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">
          {label}
        </h3>
        {badge && <div className="mt-1">{badge}</div>}
      </div>
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300 ${iconStart ? "order-first size-10 rounded-xl [&>svg]:size-5" : "size-8 rounded-lg [&>svg]:size-4"}`}
      >
        {icon}
      </span>
    </div>
  );
}
