import type { ReactNode } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import AnalyticsDetails from "./AnalyticsDetails";

interface AnalyticsChartCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  actions?: ReactNode;
  details?: ReactNode;
  detailsLabel?: string;
  children: ReactNode;
}

export default function AnalyticsChartCard({
  title,
  description,
  icon,
  actions,
  details,
  detailsLabel,
  children,
}: AnalyticsChartCardProps) {
  return (
    <ComponentCard
      compact
      title={title}
      description={description}
      icon={icon}
      actions={actions}
      className="flex h-full flex-col"
    >
      <div className="min-w-0 flex-1">{children}</div>
      {details && (
        <AnalyticsDetails label={detailsLabel}>{details}</AnalyticsDetails>
      )}
    </ComponentCard>
  );
}
