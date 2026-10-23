"use client";

import AnalyticsCardScope from "./AnalyticsCardScope";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import AnalyticsCardActions from "./AnalyticsCardActions";
import { useState } from "react";
import { useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import { TableIcon } from "@/icons";
import AnalyticsDataTable from "./AnalyticsDataTable";
import AnalyticsJourneyTrends from "./AnalyticsJourneyTrends";
import AnalyticsJourneysByCategory from "./AnalyticsJourneysByCategory";
import AnalyticsCompletionAbandonment from "./AnalyticsCompletionAbandonment";

interface AnalyticsJourneysProps {
  data: Record<string, unknown>;
}

export default function AnalyticsJourneys({ data }: AnalyticsJourneysProps) {
  const t = useTranslations("analytics");
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-5">
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <AnalyticsCardScope section="flows" data={data}>
          {(d) => <AnalyticsJourneyTrends data={d} />}
        </AnalyticsCardScope>
        <AnalyticsCardScope section="flows" data={data}>
          {(d) => <AnalyticsJourneysByCategory data={d} />}
        </AnalyticsCardScope>
        <div className="min-w-0 lg:col-span-2">
          <AnalyticsCardScope section="flows" data={data}>
            {(d) => <AnalyticsCompletionAbandonment data={d} />}
          </AnalyticsCardScope>
        </div>
      </div>

      {/* Detailed Outcomes Table */}
      <AnalyticsCardScope section="flows" data={data}>
        {(d) => (
          <ComponentCard
            title={t("design.journeyDetailTitle")}
            description={t("design.journeyDetailDescription")}
            icon={<TableIcon />}
            actions={
              <AnalyticsCardActions>
                <div className="w-full sm:w-64">
                  <Input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("design.searchJourneys")}
                    aria-label={t("design.searchJourneys")}
                  />
                </div>
                <AnalyticsJourneyPeriod />
              </AnalyticsCardActions>
            }
          >
            <AnalyticsDataTable
              field="flow_breakdown_by_type"
              value={
                d.journey_outcomes_detail ??
                d.flow_breakdown_by_type ??
                d.journey_outcomes
              }
              embedded
              paginated
              query={query}
            />
          </ComponentCard>
        )}
      </AnalyticsCardScope>
    </div>
  );
}
