import type { ReactNode } from "react";
import ComponentCard from "@/components/common/ComponentCard";

interface AnalyticsChartCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  actions?: ReactNode;
  info?: string | null;
  children: ReactNode;
}

export default function AnalyticsChartCard({
  title,
  description,
  icon,
  actions,
  info,
  children,
}: AnalyticsChartCardProps) {
  return (
    <ComponentCard
      compact
      title={title}
      description={description}
      icon={icon}
      actions={actions}
      info={info}
      className="flex h-full flex-col"
    >
      <div className="min-w-0 flex-1">{children}</div>
    </ComponentCard>
  );
}
