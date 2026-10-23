"use client";
import AnalyticsCardScope from "./AnalyticsCardScope";
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
        <AnalyticsCardScope section="logs" data={data}>
          {(d) => <AnalyticsActivityOutcomes data={d} date={date} />}
        </AnalyticsCardScope>
        <AnalyticsCardScope section="logs" data={data}>
          {(d) => <AnalyticsActivityChannels value={d.sources} />}
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
      <AnalyticsCardScope section="logs" data={data}>
        {(d) => <AnalyticsActivityActions data={d} />}
      </AnalyticsCardScope>
      <AnalyticsCardScope section="logs" data={data}>
        {(d) => <AnalyticsSlowInteractions value={d.slow_turns} />}
      </AnalyticsCardScope>
      <AnalyticsCardScope section="logs" data={data}>
        {(d) => <AnalyticsActivityErrors data={d} />}
      </AnalyticsCardScope>
    </div>
  );
}
