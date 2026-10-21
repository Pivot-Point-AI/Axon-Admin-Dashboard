import { analyticsNumber, asAnalyticsRecord } from "./analyticsData";

export interface MetricTrendPoint {
  value: number | null;
  label: string | null;
}

export interface MetricTrendData {
  change: number | null;
  direction: "up" | "down" | "flat" | null;
  comparison: string | null;
  previousCount: number | null;
  favorable: boolean | null;
  points: MetricTrendPoint[];
}

// The OpenAPI describes these blocks as additionalProperties objects. Keep
// their wire data unknown and validate numbers before showing a trend.
const aliases: Record<string, string[]> = {
  total_users: ["total_unique_users", "unique_users", "totalUsers"],
  active_sessions: [
    "current_active_sessions",
    "live_active_sessions",
    "activeSessions",
  ],
  daily_active_users: ["dau", "dailyActiveUsers", "today", "daily"],
  weekly_active_users: ["weekly", "last_7_days"],
  monthly_active_users: ["monthly", "last_30_days"],
  new_users_today: ["today"],
  new_users_this_week: ["last_7_days", "this_week"],
  new_users_this_month: ["last_30_days", "this_month"],
  total_sessions: ["sessions", "totalSessions"],
  engaged_sessions_rate_pct: [
    "engaged_sessions_rate",
    "session_engagement",
    "engagement_rate",
    "engagedSessionsRate",
  ],
  returning_user_rate_pct: ["returning_user_rate", "returningUserRate"],
  today_returning_user_rate_pct: [
    "returning_users_today",
    "today_returning_user_rate",
  ],
  stickiness_ratio_pct: [
    "user_stickiness",
    "stickiness_ratio",
    "stickinessRatio",
  ],
  total_flows_initiated: [
    "total_initialized_flows",
    "flows_initiated",
    "journeys_started",
    "totalFlowsInitiated",
  ],
  total_initialized_flows: [
    "total_flows_initiated",
    "flows_initiated",
    "journeys_started",
  ],
  total_completed_flows: ["journeys_completed", "completed_flows"],
  flow_completion_rate_pct: [
    "flow_completion_rate",
    "completion_rate",
    "flowCompletionRate",
  ],
  flow_abandonment_rate_pct: [
    "flow_abandonment_rate",
    "abandonment_rate",
    "flowAbandonmentRate",
  ],
  retention_rate_pct: ["user_retention", "retention_rate"],
  average_turns_per_engaged_session: [
    "turns_per_conversation",
    "average_turns",
  ],
  average_intent_confidence: ["average_confidence", "intent_confidence"],
  high_confidence_rate_pct: ["high_confidence_rate"],
  llm_fallback_rate_pct: ["fallback_rate", "llm_fallback_rate"],
  average_response_time: [
    "average_response_time_ms",
    "avg_response_time_ms",
    "average_latency_ms",
  ],
  p95_response_time: ["p95_response_time_ms", "p95_latency_ms"],
  slow_turns_count_above_1500ms: ["slow_interactions", "slow_turns"],
  turn_success_count: ["successful_interactions", "successful_turns"],
  turn_failed_count: ["failed_interactions", "failed_turns"],
  recorded_errors: ["recognized_errors", "error_count", "errors_count"],
};
const normalize = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, "");
const firstNumber = (...values: unknown[]) =>
  values.map(analyticsNumber).find((value) => value !== null) ?? null;
const firstString = (...values: unknown[]) =>
  values
    .find(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    )
    ?.trim() ?? null;
const firstBoolean = (...values: unknown[]) =>
  values.find((value): value is boolean => typeof value === "boolean") ?? null;

export function readMetricHistory(history: unknown): MetricTrendPoint[] {
  const series = asAnalyticsRecord(history);
  const rawPoints = Array.isArray(history)
    ? history
    : Array.isArray(series.values)
      ? series.values
      : Array.isArray(series.data)
        ? series.data
        : Array.isArray(series.points)
          ? series.points
          : [];
  const labels = Array.isArray(series.labels)
    ? series.labels
    : Array.isArray(series.dates)
      ? series.dates
      : [];
  return Array.from(rawPoints, (point, index) => {
    const row = asAnalyticsRecord(point);
    return {
      value: firstNumber(
        point,
        row.value,
        row.count,
        row.y,
        row.users,
        row.active_users,
        row.new_users,
      ),
      label: firstString(
        row.label,
        row.date,
        row.timestamp,
        row.x,
        labels[index],
      ),
    };
  });
}

export function metricHistory(
  data: unknown,
  block: string,
): MetricTrendPoint[] {
  const source = asAnalyticsRecord(asAnalyticsRecord(data)[block]);
  return readMetricHistory(
    source.series ??
      source.time_series ??
      source.daily_series ??
      source.history ??
      source.chart ??
      source,
  );
}

export function readMetricTrend(value: unknown): MetricTrendData | null {
  const metric = asAnalyticsRecord(value);
  const trend = asAnalyticsRecord(metric.trend);
  const growth = asAnalyticsRecord(metric.growth);
  const change = firstNumber(
    metric.change_pct,
    metric.growth_pct,
    metric.trend_pct,
    metric.percentage_change,
    trend.change_pct,
    trend.growth_pct,
    trend.pct,
    trend.percentage,
    growth.growth_pct,
    growth.change_pct,
    growth.pct,
  );
  const reportedDirection = firstString(
    trend.direction,
    metric.trend_direction,
    metric.direction,
    typeof metric.trend === "string" ? metric.trend : null,
  )?.toLowerCase();
  const direction =
    change !== null
      ? change > 0
        ? "up"
        : change < 0
          ? "down"
          : "flat"
      : ["up", "increase", "increasing"].includes(reportedDirection ?? "")
        ? "up"
        : ["down", "decrease", "decreasing"].includes(reportedDirection ?? "")
          ? "down"
          : ["flat", "neutral", "unchanged", "stable"].includes(
                reportedDirection ?? "",
              )
            ? "flat"
            : null;
  const history =
    metric.sparkline ?? trend.sparkline ?? metric.history ?? trend.history;
  const points = readMetricHistory(history);
  const comparison = firstString(
    metric.comparison_label,
    metric.change_label,
    metric.trend_label,
    metric.comparison,
    trend.comparison_label,
    trend.change_label,
    trend.comparison,
    trend.label,
    trend.vs,
    metric.compared_to,
    growth.comparison_label,
  );
  if (direction === null && !points.some((point) => point.value !== null))
    return null;
  return {
    change,
    direction,
    comparison,
    previousCount: firstNumber(
      metric.yesterday_count,
      metric.previous_count,
      trend.previous_count,
      growth.yesterday_count,
    ),
    favorable: firstBoolean(
      trend.is_positive,
      trend.is_improvement,
      metric.is_positive,
      metric.is_improvement,
      trend.favorable,
      metric.favorable,
    ),
    points,
  };
}

export function metricTrend(
  data: unknown,
  field: string,
  blocks: string[] = ["top_kpis"],
): MetricTrendData | null {
  const root = asAnalyticsRecord(data);
  const keys = new Set([field, ...(aliases[field] ?? [])].map(normalize));
  for (const block of blocks) {
    const outer = asAnalyticsRecord(root[block]);
    const source = outer.metrics ?? outer.kpis ?? outer.summary ?? root[block];
    const entries: [string, unknown][] = Array.isArray(source)
      ? source.map((item) => {
          const row = asAnalyticsRecord(item);
          return [
            firstString(
              row.key,
              row.field,
              row.metric,
              row.id,
              row.name,
              row.label,
              row.title,
            ) ?? "",
            item,
          ];
        })
      : Object.entries(asAnalyticsRecord(source));
    for (const [key, entry] of entries) {
      const record = asAnalyticsRecord(entry);
      if (
        [
          key,
          record.key,
          record.field,
          record.metric,
          record.label,
          record.title,
        ].some(
          (value) => typeof value === "string" && keys.has(normalize(value)),
        )
      ) {
        const result = readMetricTrend(entry);
        if (result) return result;
      }
    }
  }
  const direct =
    readMetricTrend(root[`${field}_growth`]) ?? readMetricTrend(root[field]);
  if (
    direct &&
    field === "daily_active_users" &&
    direct.comparison === null &&
    direct.previousCount !== null
  )
    return { ...direct, comparison: "yesterday" };
  return direct;
}

export function lowerMetricIsBetter(field: string): boolean {
  return /abandon|drop_off|failed|error|fallback|latency|response_time|slow_turn|dormant/.test(
    field,
  );
}

export function trendSentiment(
  trend: MetricTrendData,
  lowerIsBetter = false,
): "positive" | "negative" | "neutral" {
  if (trend.direction === null || trend.direction === "flat") return "neutral";
  const favorable =
    trend.favorable ??
    (lowerIsBetter ? trend.direction === "down" : trend.direction === "up");
  return favorable ? "positive" : "negative";
}
