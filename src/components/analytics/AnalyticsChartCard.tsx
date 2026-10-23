import type { ReactNode } from "react";
import ComponentCard from "@/components/common/ComponentCard";

interface AnalyticsChartCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export default function AnalyticsChartCard({
  title,
  description,
  icon,
  actions,
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
    </ComponentCard>
  );
}
