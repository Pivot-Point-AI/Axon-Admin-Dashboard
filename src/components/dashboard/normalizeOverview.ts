import {
  metricTrend,
  metricValue,
} from "@/components/analytics/analyticsTrends";
import type { DashboardOverviewResponse } from "@/lib/api/types";

const blocks = ["top_kpis", "audience_engagement", "banking_journeys"] as const;
const numeric = [
  "total_users",
  "active_sessions",
  "total_sessions",
  "stickiness_ratio_pct",
  "engaged_sessions_rate_pct",
  "returning_user_rate_pct",
  "total_flows_initiated",
  "flow_completion_rate_pct",
  "flow_abandonment_rate_pct",
] as const;

// Some responses carry the figures only inside the KPI blocks. Fill any
// top-level figure that is missing from them; reported top-level values win.
export default function normalizeOverview(
  overview: DashboardOverviewResponse,
): DashboardOverviewResponse {
  const next: Record<string, unknown> = { ...overview };
  for (const field of numeric) {
    if (typeof next[field] === "number") continue;
    const value = metricValue(overview, field, [...blocks]);
    if (value !== null) next[field] = value;
  }
  const dau = next.daily_active_users;
  if (typeof dau !== "number" && !(dau && typeof dau === "object")) {
    const count = metricValue(overview, "daily_active_users", [...blocks]);
    if (count !== null) {
      const trend = metricTrend(overview, "daily_active_users", [...blocks]);
      next.daily_active_users = {
        count,
        yesterday_count: trend?.previousCount ?? count,
        growth_pct: trend?.change ?? 0,
      };
    }
  }
  return next as unknown as DashboardOverviewResponse;
}
