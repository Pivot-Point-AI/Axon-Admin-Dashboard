"use client";
import AnalyticsCardScope from "./AnalyticsCardScope";
import AnalyticsActivityOutcomes from "./AnalyticsActivityOutcomes";
import AnalyticsActivityColumns from "./AnalyticsActivityColumns";
import AnalyticsActivityErrors from "./AnalyticsActivityErrors";
import AnalyticsDataTable from "./AnalyticsDataTable";
import { analyticsTableRows } from "./analyticsData";
import { blockDescription, blocksInfo } from "./analyticsTrends";
import AnalyticsIntentBreakdown from "./AnalyticsIntentBreakdown";
import AnalyticsSummaryBlock from "./AnalyticsSummaryBlock";

interface AnalyticsActivityProps {
  data: Record<string, unknown>;
  date?: string;
}
export default function AnalyticsActivity({
  data,
  date,
}: AnalyticsActivityProps) {
  return (
    <div className="space-y-4">
      <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <AnalyticsCardScope section="logs" data={data}>
          {(d) => <AnalyticsActivityOutcomes data={d} date={date} />}
        </AnalyticsCardScope>
        <AnalyticsCardScope section="logs" data={data}>
          {(d) => (
            <AnalyticsActivityColumns field="stt_events" value={d.stt_events} />
          )}
        </AnalyticsCardScope>
        <AnalyticsCardScope section="logs" data={data}>
          {(d) => (
            <AnalyticsActivityColumns
              field="token_usage"
              value={d.token_usage}
            />
          )}
        </AnalyticsCardScope>
      </div>
      {/* Full width, like the Text-to-Speech summary on the Performance tab. */}
      <AnalyticsCardScope section="logs" data={data}>
        {(d) => (
          <AnalyticsSummaryBlock
            data={d}
            block="flow_token_metrics"
            gauge={false}
            extras={false}
          />
        )}
      </AnalyticsCardScope>
      <AnalyticsCardScope section="logs" data={data}>
        {(d) => (
          <AnalyticsIntentBreakdown
            data={d}
            // `actions_delivered` is the older name for the same block.
            block={
              analyticsTableRows(d.token_breakdown_by_intent).length > 0
                ? "token_breakdown_by_intent"
                : "actions_delivered"
            }
          />
        )}
      </AnalyticsCardScope>
      <AnalyticsCardScope section="logs" data={data}>
        {(d) => <AnalyticsActivityErrors data={d} />}
      </AnalyticsCardScope>
      {/* The errors exactly as the API lists them, whatever their columns. */}
      <AnalyticsCardScope section="logs" data={data}>
        {(d) =>
          analyticsTableRows(d.recognized_errors ?? d.errors).length > 0 ? (
            <AnalyticsDataTable
              field="recognized_errors"
              value={d.recognized_errors ?? d.errors}
              description={
                blockDescription(d, "recognized_errors", "errors") ?? undefined
              }
              info={blocksInfo(d, ["recognized_errors", "errors"])}
            />
          ) : null
        }
      </AnalyticsCardScope>
    </div>
  );
}
