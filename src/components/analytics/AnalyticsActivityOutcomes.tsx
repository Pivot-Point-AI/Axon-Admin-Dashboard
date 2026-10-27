"use client";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import { useFormatter, useTranslations } from "next-intl";
import { CheckCircleIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsGauge from "./AnalyticsGauge";
import AnalyticsGroupedColumns from "./AnalyticsGroupedColumns";
import { useAnalyticsPeriod } from "./AnalyticsPeriodContext";
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
  const tInfo = useTranslations("analytics.design.info");
  const common = useTranslations("analytics.design");
  const format = useFormatter();
  const reporting = useAnalyticsPeriod();
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
          label: reporting?.period
            ? common(reporting.period)
            : !date || date === "today"
              ? common("today")
              : date,
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
  const single = rows[0]?.values;
  const successful = history.length ? 0 : (single?.successful ?? 0);
  const failed = history.length ? 0 : (single?.failed ?? 0);
  const rate = successful + failed > 0 ? successful / (successful + failed) : 0;
  return (
    <AnalyticsChartCard
      title={t("outcomesTitle")}
      info={tInfo("outcomes")}
      description={t(
        history.length ? "outcomesHistoryDescription" : "outcomesDescription",
      )}
      icon={<CheckCircleIcon />}
      actions={<AnalyticsJourneyPeriod />}
    >
      {history.length ? (
        <AnalyticsGroupedColumns
          axisSteps={4}
          rows={rows}
          series={[
            { key: "successful", label: t("successful"), token: "brand-500" },
            { key: "failed", label: t("failed"), token: "theme-purple-500" },
          ]}
        />
      ) : successful + failed > 0 ? (
        // A single reported total has no time axis, so show the success rate.
        <div className="flex flex-col items-center gap-9 py-2">
          <AnalyticsGauge
            rate={rate}
            caption={common("successRate")}
            good="success-500"
            bad="error-500"
          />
          <dl className="grid w-full max-w-sm grid-cols-2 gap-3">
            {(
              [
                ["successful", successful, "bg-success-500"],
                ["failed", failed, "bg-error-500"],
              ] as const
            ).map(([key, count, dot]) => (
              <div
                key={key}
                className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/3"
              >
                <dt className="flex items-center gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
                  <span
                    aria-hidden="true"
                    className={`size-2 rounded-full ${dot}`}
                  />
                  {t(key)}
                </dt>
                <dd className="mt-1 text-xl font-bold text-gray-950 tabular-nums dark:text-white">
                  {format.number(count)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <AnalyticsEmptyState />
      )}
    </AnalyticsChartCard>
  );
}
