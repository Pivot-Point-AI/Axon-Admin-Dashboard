import type { AnalyticsSection } from "@/lib/api/analytics";
import { asAnalyticsRecord } from "./analyticsData";
import { analyticsFields } from "./analyticsFields";
import { chartFields } from "./analyticsPresentation";
import { metricValue } from "./analyticsTrends";

const aliases: Partial<Record<AnalyticsSection, Record<string, string[]>>> = {
  users: {
    language_breakdown: ["language_preferences"],
  },
  chats: {
    peak_activity_hours: ["activity_by_hour"],
    activity_by_day_of_week: ["activity_by_weekday"],
  },
  nlp: {
    intent_confidence_buckets: ["confidence_distribution"],
    fallback_reasons: ["why_ai_fallback_was_used"],
    guardrail_violations_by_risk: ["safety_blocks_by_risk"],
    guardrail_violations_by_reason: ["safety_blocks_by_reason"],
    intent_distribution: ["what_users_ask_for"],
  },
  performance: {
    end_to_end_latency_ms: ["response_time_percentiles"],
    stt_transcription_latency_ms: ["speech_recognition_percentiles"],
    llm_generation_latency_ms: ["ai_generation_percentiles"],
    stage_averages_ms: ["average_time_by_stage"],
    top_slowest_turns: ["slowest_interactions"],
  },
  logs: {
    sources: ["conversation_channels"],
    stt_events: ["speech_recognition_events"],
    token_usage: ["token_usage_breakdown"],
    dispatched_actions: ["actions_delivered"],
    slow_turns: ["slow_interactions"],
    errors: ["recognized_errors"],
  },
};

/** Keep the wire response intact while accepting both documented naming generations. */
export function analyticsSummaryData(
  section: AnalyticsSection,
  input: unknown,
): Record<string, unknown> {
  const data = { ...asAnalyticsRecord(input) };
  for (const [canonical, alternatives] of Object.entries(
    aliases[section] ?? {},
  )) {
    const candidates = [
      data[canonical],
      ...alternatives.map((key) => data[key]),
    ];
    data[canonical] =
      candidates.find(
        (value) =>
          value != null &&
          (typeof value !== "object" || Object.keys(value).length > 0),
      ) ?? candidates.find((value) => value != null);
  }
  // Newer responses report headline figures inside KPI blocks; fill any flat
  // figure that is missing from them. Reported top-level values always win.
  const blocks = Object.keys(data).filter(
    (key) => data[key] !== null && typeof data[key] === "object",
  );
  for (const field of analyticsFields[section]) {
    if (data[field] != null || chartFields.has(field)) continue;
    const value = metricValue(
      data,
      field,
      blocks.filter((key) => key !== field),
    );
    if (value !== null) data[field] = value;
  }
  return data;
}
