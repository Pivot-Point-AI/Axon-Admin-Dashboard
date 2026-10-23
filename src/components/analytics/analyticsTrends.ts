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
  /** The server's own text for the change, for example "+12%". */
  display: string | null;
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
    "daily_to_monthly_activity",
    "daily_to_monthly",
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
  returning_users: ["returning_users"],
  one_time_users: ["one_time_users"],
  average_sessions_per_user: ["sessions_per_user"],
  dormant_users_30d: ["inactive_for_30_days", "inactive_30_days"],
  total_user_messages: ["user_messages"],
  total_assistant_messages: ["assistant_messages"],
  total_cancelled_flows: ["cancelled_by_users", "cancelled_journeys"],
  total_failed_flows: ["failed_journeys"],
  total_abandoned_flows: ["abandoned_journeys"],
  abandoned_flows_count: ["total_drop_offs", "drop_offs"],
  flow_drop_off_rate_pct: ["drop_off_rate"],
  average_steps_per_completed_flow: ["steps_to_completion"],
  total_classified_turns: ["classified_turns", "interactions_classified"],
  llm_fallback_count: ["ai_fallbacks"],
  guardrail_violations_count: ["safety_blocks"],
  total_measured_turns: ["measured_interactions"],
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
  const previousCount = firstNumber(
    metric.yesterday_count,
    metric.previous_count,
    metric.previous_value,
    trend.previous_count,
    growth.yesterday_count,
  );
  const currentCount = firstNumber(
    metric.current_count,
    metric.current_value,
    metric.count,
    metric.value,
    growth.current_count,
  );
  const calculatedChange =
    currentCount !== null && previousCount !== null
      ? previousCount !== 0
        ? ((currentCount - previousCount) / Math.abs(previousCount)) * 100
        : currentCount === 0
          ? 0
          : null
      : null;
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
    calculatedChange,
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
  // Text that reads like a comparison, whatever the field is called. When it
  // starts with a figure ("-80.0% vs yesterday") it is the server's own display
  // of the change; otherwise it is just the comparison wording.
  const phrase = [metric, trend, growth]
    .flatMap((block) => Object.values(block))
    .find(
      (value): value is string =>
        typeof value === "string" &&
        /\bvs\.?(?:\s|$)|compared|yesterday|last (?:week|month|period)|previous/i.test(
          value,
        ),
    );
  const phraseHasFigure = phrase ? /^[\s↑↓▲▼↗↘—–+-]*\d/.test(phrase) : false;
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
    phrase && !phraseHasFigure ? phrase : null,
  );
  if (direction === null && !points.some((point) => point.value !== null))
    return null;
  return {
    change,
    direction,
    comparison,
    previousCount,
    display: firstString(
      trend.display,
      trend.display_value,
      metric.trend_display,
      metric.change_display,
      growth.display,
      // A row's own `display` is the comparison text, unless it merely repeats
      // the current figure.
      typeof metric.display === "string" &&
        !(
          currentCount !== null &&
          !/^[+-]/.test(metric.display.trim()) &&
          Number(metric.display.replace(/[^\d.]/g, "")) === currentCount
        )
        ? metric.display
        : null,
      phrase && phraseHasFigure ? phrase : null,
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

function blockEntries(
  root: Record<string, unknown>,
  block: string,
): [string, unknown][] {
  const outer = asAnalyticsRecord(root[block]);
  const source = outer.metrics ?? outer.kpis ?? outer.summary ?? root[block];
  return Array.isArray(source)
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
}

function findMetric(
  root: Record<string, unknown>,
  field: string,
  blocks: string[],
): Record<string, unknown> | null {
  const keys = new Set([field, ...(aliases[field] ?? [])].map(normalize));
  for (const block of blocks)
    for (const [key, entry] of blockEntries(root, block)) {
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
      )
        return typeof entry === "number" ? { value: entry } : record;
    }
  return null;
}

/** Current figure for a metric reported inside a KPI block rather than at the
 * top level of the response. */
export function metricValue(
  data: unknown,
  field: string,
  blocks: string[] = ["top_kpis"],
): number | null {
  const record = findMetric(asAnalyticsRecord(data), field, blocks);
  return record
    ? firstNumber(
        record.current_value,
        record.current_count,
        record.value,
        record.count,
      )
    : null;
}

export function metricTrend(
  data: unknown,
  field: string,
  blocks: string[] = ["top_kpis"],
): MetricTrendData | null {
  const root = asAnalyticsRecord(data);
  for (const block of blocks) {
    const record = findMetric(root, field, [block]);
    if (record) {
      const result = readMetricTrend({
        ...record,
        current_value: firstNumber(
          record.current_value,
          record.current_count,
          record.value,
          record.count,
          root[field],
          asAnalyticsRecord(root[field]).count,
        ),
      });
      if (result) return result;
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
