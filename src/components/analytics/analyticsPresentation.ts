import type { AnalyticsSection } from "@/lib/api/analytics";

export const sectionMetrics: Record<AnalyticsSection, readonly string[]> = {
  users: [
    "total_users",
    "daily_active_users",
    "total_sessions",
    "retention_rate_pct",
  ],
  chats: [
    "total_messages",
    "total_sessions",
    "engaged_sessions_rate_pct",
    "average_turns_per_engaged_session",
  ],
  flows: [
    "total_initialized_flows",
    "total_completed_flows",
    "flow_completion_rate_pct",
    "flow_abandonment_rate_pct",
  ],
  nlp: [
    "total_classified_turns",
    "average_intent_confidence",
    "high_confidence_rate_pct",
    "llm_fallback_rate_pct",
  ],
  performance: [
    "total_measured_turns",
    "average_response_time",
    "p95_response_time",
    "slow_turns_count_above_1500ms",
  ],
  logs: [
    "turn_success_count",
    "turn_failed_count",
    "total_tokens",
    "recorded_errors",
  ],
};

export const chartFields = new Set([
  "peak_activity_hours",
  "activity_by_day_of_week",
  "top_popular_flows",
  "intent_confidence_buckets",
  "fallback_reasons",
  "guardrail_violations_by_risk",
  "guardrail_violations_by_reason",
  "intent_distribution",
  "stage_averages_ms",
  "sources",
  "stt_events",
  "token_usage",
  "dispatched_actions",
]);

export const latencyFields = new Set([
  "end_to_end_latency_ms",
  "stt_transcription_latency_ms",
  "llm_generation_latency_ms",
]);

export const metricGroups: Partial<
  Record<AnalyticsSection, { title: string; fields: string[] }[]>
> = {
  users: [
    {
      title: "audienceHealth",
      fields: [
        "active_sessions",
        "returning_users",
        "one_time_users",
        "average_sessions_per_user",
        "today_returning_user_rate_pct",
        "stickiness_ratio_pct",
        "dormant_users_30d",
      ],
    },
    {
      title: "newUsers",
      fields: [
        "new_users_today",
        "new_users_this_week",
        "new_users_this_month",
      ],
    },
  ],
  chats: [
    {
      title: "conversationDetails",
      fields: [
        "total_user_messages",
        "total_assistant_messages",
        "engaged_sessions",
        "empty_sessions",
      ],
    },
  ],
  flows: [
    {
      title: "journeyDetails",
      fields: [
        "total_cancelled_flows",
        "total_failed_flows",
        "total_abandoned_flows",
        "abandoned_flows_count",
        "flow_drop_off_rate_pct",
        "average_steps_per_completed_flow",
      ],
    },
  ],
  nlp: [
    {
      title: "qualityDetails",
      fields: ["llm_fallback_count", "guardrail_violations_count"],
    },
  ],
};
