"use client";

import AnalyticsCardScope from "./AnalyticsCardScope";
import AnalyticsIntentBreakdown from "./AnalyticsIntentBreakdown";
import AnalyticsSlowInteractions from "./AnalyticsSlowInteractions";
import AnalyticsSummaryBlock from "./AnalyticsSummaryBlock";

interface AnalyticsPerformanceProps {
  data: Record<string, unknown>;
}

const summaries = [
  "average_response_time_summary",
  "speech_to_text_summary",
  "text_to_speech_summary",
];

const breakdowns = [
  "turn_time_breakdown_by_intent",
  "speech_to_text_breakdown_by_intent",
  "text_to_speech_breakdown_by_intent",
];

export default function AnalyticsPerformance({
  data,
}: AnalyticsPerformanceProps) {
  return (
    <div className="space-y-4">
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        {summaries.map((block, index) => (
          <div
            key={block}
            className={`min-w-0 ${index === summaries.length - 1 && summaries.length % 2 === 1 ? "lg:col-span-2" : ""}`}
          >
            <AnalyticsCardScope section="performance" data={data}>
              {(d) => (
                <AnalyticsSummaryBlock
                  data={d}
                  block={block}
                  changes={block === "average_response_time_summary"}
                />
              )}
            </AnalyticsCardScope>
          </div>
        ))}
      </div>
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        {breakdowns.map((block, index) => (
          <div
            key={block}
            className={`min-w-0 ${index === 0 ? "lg:col-span-2" : ""}`}
          >
            <AnalyticsCardScope section="performance" data={data}>
              {(d) => (
                <AnalyticsIntentBreakdown
                  data={d}
                  block={block}
                  variant={
                    block === "speech_to_text_breakdown_by_intent"
                      ? "pie"
                      : block === "text_to_speech_breakdown_by_intent"
                        ? "rose"
                        : "line"
                  }
                />
              )}
            </AnalyticsCardScope>
          </div>
        ))}
      </div>
      <AnalyticsCardScope section="performance" data={data}>
        {(d) => <AnalyticsSlowInteractions value={d.top_slowest_turns} />}
      </AnalyticsCardScope>
    </div>
  );
}
