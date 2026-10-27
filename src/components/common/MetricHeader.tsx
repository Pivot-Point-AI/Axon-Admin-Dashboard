import type { ReactNode } from "react";
import InfoTip from "./InfoTip";

interface MetricHeaderProps {
  label: string;
  icon: ReactNode;
  badge?: ReactNode;
  /** A larger icon tile. The icon always leads and the info button trails. */
  iconStart?: boolean;
  info?: string | null;
}

export default function MetricHeader({
  label,
  icon,
  badge,
  iconStart = false,
  info,
}: MetricHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300 ${iconStart ? "size-10 rounded-xl [&>svg]:size-5" : "size-8 rounded-lg [&>svg]:size-4"}`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">
          {label}
        </h3>
        {badge && <div className="mt-1">{badge}</div>}
      </div>
      {info && <InfoTip text={info} title={label} />}
    </div>
  );
}
