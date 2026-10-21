"use client";
import AnalyticsActivityOutcomes from "./AnalyticsActivityOutcomes";
import AnalyticsActivityChannels from "./AnalyticsActivityChannels";
import AnalyticsActivityColumns from "./AnalyticsActivityColumns";
import AnalyticsActivityActions from "./AnalyticsActivityActions";
import AnalyticsActivityErrors from "./AnalyticsActivityErrors";
import AnalyticsSlowInteractions from "./AnalyticsSlowInteractions";

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
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <AnalyticsActivityOutcomes data={data} date={date} />
        <AnalyticsActivityChannels value={data.sources} />
        <AnalyticsActivityColumns field="stt_events" value={data.stt_events} />
        <AnalyticsActivityColumns
          field="token_usage"
          value={data.token_usage}
        />
      </div>
      <AnalyticsActivityActions data={data} />
      <AnalyticsSlowInteractions value={data.slow_turns} />
      <AnalyticsActivityErrors data={data} />
    </div>
  );
}
