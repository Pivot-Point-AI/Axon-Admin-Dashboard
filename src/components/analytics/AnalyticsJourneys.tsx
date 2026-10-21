"use client";

import { useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { TableIcon } from "@/icons";
import AnalyticsDataTable from "./AnalyticsDataTable";
import AnalyticsJourneyMetrics from "./AnalyticsJourneyMetrics";
import AnalyticsJourneyTrends from "./AnalyticsJourneyTrends";
import AnalyticsJourneysByCategory from "./AnalyticsJourneysByCategory";
import AnalyticsCompletionAbandonment from "./AnalyticsCompletionAbandonment";
import AnalyticsUserDropOff from "./AnalyticsUserDropOff";

interface AnalyticsJourneysProps {
  data: Record<string, unknown>;
}

export default function AnalyticsJourneys({ data }: AnalyticsJourneysProps) {
  const t = useTranslations("analytics");

  return (
    <div className="space-y-5">
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <AnalyticsJourneyTrends data={data} />
        <AnalyticsJourneysByCategory data={data} />
        <AnalyticsCompletionAbandonment data={data} />
        <AnalyticsUserDropOff data={data} />
      </div>

      {/* Journey Outcome Metrics at a glance */}
      <AnalyticsJourneyMetrics data={data} />

      {/* Detailed Outcomes Table */}
      <ComponentCard
        title={t("design.journeyDetailTitle")}
        description={t("design.journeyDetailDescription")}
        icon={<TableIcon />}
      >
        <AnalyticsDataTable
          field="flow_breakdown_by_type"
          value={
            data.journey_outcomes_detail ??
            data.flow_breakdown_by_type ??
            data.journey_outcomes
          }
          embedded
          paginated
        />
      </ComponentCard>
    </div>
  );
}
