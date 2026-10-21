"use client";
import { useFormatter, useTranslations } from "next-intl";
import { CheckCircleIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsDataTable from "./AnalyticsDataTable";
import AnalyticsGroupedColumns from "./AnalyticsGroupedColumns";
import { asAnalyticsRecord } from "./analyticsData";
import { telemetryHistory, telemetryNumber } from "./analyticsTelemetryData";

interface AnalyticsActivityOutcomesProps {
  data: Record<string, unknown>;
  date?: string;
}
export default function AnalyticsActivityOutcomes({
  data,
  date,
}: AnalyticsActivityOutcomesProps) {
  const t = useTranslations("analytics.telemetry");
  const common = useTranslations("analytics.design");
  const format = useFormatter();
  const outcomes = asAnalyticsRecord(data.interaction_outcomes);
  const history = telemetryHistory(
    data.interaction_outcomes_trend ?? outcomes.history,
    ["successful", "failed"],
  );
  const rows = history.length
    ? history.map((point) => ({
        key: String(point.timestamp),
        label: format.dateTime(point.timestamp, {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        values: { successful: point.successful, failed: point.failed },
      }))
    : [
        {
          key: "reported",
          label: !date || date === "today" ? common("today") : date,
          values: {
            successful: telemetryNumber(
              data.turn_success_count,
              outcomes.successful,
              asAnalyticsRecord(outcomes.successful).count,
            ),
            failed: telemetryNumber(
              data.turn_failed_count,
              outcomes.failed,
              asAnalyticsRecord(outcomes.failed).count,
            ),
          },
        },
      ];
  return (
    <AnalyticsChartCard
      title={t("outcomesTitle")}
      description={t(
        history.length ? "outcomesHistoryDescription" : "outcomesDescription",
      )}
      icon={<CheckCircleIcon />}
      details={
        <AnalyticsDataTable
          field="turn_success_count"
          value={
            history.length
              ? (data.interaction_outcomes_trend ?? outcomes.history)
              : rows.map((row) => ({ ...row.values }))
          }
          embedded
        />
      }
    >
      <AnalyticsGroupedColumns
        axisSteps={4}
        rows={rows}
        series={[
          { key: "successful", label: t("successful"), token: "brand-500" },
          { key: "failed", label: t("failed"), token: "theme-purple-500" },
        ]}
      />
    </AnalyticsChartCard>
  );
}
