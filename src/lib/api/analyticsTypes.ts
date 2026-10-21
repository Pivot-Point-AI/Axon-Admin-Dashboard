// Response types from the admin OpenAPI schema.
interface AnalyticsTrendBlocks {
  top_kpis?: Record<string, unknown>;
}

export interface UserStatsSummaryResponse extends AnalyticsTrendBlocks {
  active_audience?: Record<string, unknown>;
  audience_and_retention?: Array<Record<string, unknown>>;
  new_user_acquisition?: Record<string, unknown>;
  total_users: number;
  active_sessions: number;
  total_sessions: number;
  returning_users: number;
  one_time_users: number;
  retention_rate_pct: number;
  average_sessions_per_user: number;
  daily_active_users: number;
  daily_active_users_growth: Record<string, unknown>;
  today_returning_user_rate_pct: number;
  weekly_active_users: number;
  monthly_active_users: number;
  stickiness_ratio_pct: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
  dormant_users_30d: number;
  language_breakdown: Record<string, unknown>;
}

export interface ChatStatsSummaryResponse extends AnalyticsTrendBlocks {
  conversation_details?: Array<Record<string, unknown>>;
  start_time?: string | null;
  end_time?: string | null;
  total_messages: number;
  total_user_messages: number;
  total_assistant_messages: number;
  total_sessions: number;
  engaged_sessions: number;
  empty_sessions: number;
  engaged_sessions_rate_pct: number;
  average_turns_per_engaged_session: number;
  peak_activity_hours: Array<PeakActivityHour>;
  activity_by_day_of_week: Array<DayActivity>;
}

export interface FlowStatsSummaryResponse extends AnalyticsTrendBlocks {
  most_popular_journeys?: Array<Record<string, unknown>>;
  journey_outcomes?: Array<Record<string, unknown>>;
  journey_outcomes_detail?: Array<Record<string, unknown>>;
  outcomes_at_a_glance?: Record<string, unknown>;
  total_initialized_flows: number;
  total_completed_flows: number;
  total_cancelled_flows: number;
  total_failed_flows: number;
  total_abandoned_flows: number;
  abandoned_flows_count: number;
  flow_completion_rate_pct: number;
  flow_drop_off_rate_pct: number;
  flow_abandonment_rate_pct: number;
  average_steps_per_completed_flow: number;
  top_popular_flows: Array<Record<string, unknown>>;
  flow_breakdown_by_type: Record<string, unknown>;
}

export interface NlpStatsSummaryResponse extends AnalyticsTrendBlocks {
  confidence_distribution?: Record<string, unknown>;
  why_ai_fallback_was_used?: Record<string, unknown>;
  safety_blocks_by_risk?: Record<string, unknown>;
  safety_blocks_by_reason?: Record<string, unknown>;
  what_users_ask_for?: Record<string, unknown>;
  fallbacks_and_safety?: Record<string, unknown>;
  date: string;
  total_classified_turns: number;
  average_intent_confidence: number;
  high_confidence_rate_pct: number;
  intent_confidence_buckets: Record<string, unknown>;
  llm_fallback_count: number;
  llm_fallback_rate_pct: number;
  fallback_reasons: Record<string, number>;
  guardrail_violations_count: number;
  guardrail_violations_by_risk: Record<string, number>;
  guardrail_violations_by_reason: Record<string, number>;
  intent_distribution: Record<string, unknown>;
}

export interface PerformanceStatsSummaryResponse extends AnalyticsTrendBlocks {
  response_time_percentiles?: Record<string, unknown>;
  speech_recognition_percentiles?: Record<string, unknown>;
  ai_generation_percentiles?: Record<string, unknown>;
  average_time_by_stage?: Record<string, number>;
  slowest_interactions?: Array<Record<string, unknown>>;
  date: string;
  total_measured_turns: number;
  end_to_end_latency_ms: Record<string, unknown>;
  stt_transcription_latency_ms: Record<string, unknown>;
  llm_generation_latency_ms: Record<string, unknown>;
  stage_averages_ms: Record<string, number>;
  slow_turns_count_above_1500ms: number;
  top_slowest_turns: Array<Record<string, unknown>>;
}

export interface LogStatsSummaryResponse extends AnalyticsTrendBlocks {
  interaction_outcomes?: Record<string, unknown>;
  conversation_channels?: Record<string, unknown>;
  speech_recognition_events?: Record<string, unknown>;
  token_usage_breakdown?: Record<string, unknown>;
  actions_delivered?: Array<Record<string, unknown>>;
  slow_interactions?: Array<Record<string, unknown>>;
  recognized_errors?: Array<Record<string, unknown>>;
  found: boolean;
  date: string;
  turn_success_count?: number;
  turn_failed_count?: number;
  sources?: Record<string, number>;
  stt_events?: Record<string, number>;
  token_usage?: Record<string, number>;
  dispatched_actions?: Record<string, number>;
  slow_turns?: Array<Record<string, unknown>>;
  errors?: Array<Record<string, unknown>>;
}

export interface PeakActivityHour {
  hour: number;
  count: number;
}

export interface DayActivity {
  day_index: number;
  day_name: string;
  count: number;
}
