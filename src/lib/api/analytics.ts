import { ADMIN_API_BASE_URL, apiRequest } from "./client";
import type {
  UserStatsSummaryResponse,
  ChatStatsSummaryResponse,
  FlowStatsSummaryResponse,
  NlpStatsSummaryResponse,
  PerformanceStatsSummaryResponse,
  LogStatsSummaryResponse,
} from "./analyticsTypes";

export interface AnalyticsResponses {
  users: UserStatsSummaryResponse;
  chats: ChatStatsSummaryResponse;
  flows: FlowStatsSummaryResponse;
  nlp: NlpStatsSummaryResponse;
  performance: PerformanceStatsSummaryResponse;
  logs: LogStatsSummaryResponse;
}
export type AnalyticsSection = keyof AnalyticsResponses;
export const analyticsEndpoints: Record<AnalyticsSection, string> = {
  users: "user-summary",
  chats: "chat-summary",
  flows: "flow-summary",
  nlp: "nlp-summary",
  performance: "performance-summary",
  logs: "log-summary",
};
export interface AnalyticsFilters {
  period?:
    | "all_time"
    | "last_30_days"
    | "last_14_days"
    | "last_7_days"
    | "today"
    | "yesterday"
    | "custom";
  start_date?: string;
  end_date?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
}

/**
 * Query for the `period` / `start_date` / `end_date` filter every analytics
 * endpoint shares. A preset is sent alone so the API computes its own window
 * and comparison text; explicit dates go only with `custom`.
 */
export function periodQuery(filters: AnalyticsFilters) {
  if (filters.period && filters.period !== "custom")
    return { period: filters.period };
  if (!filters.start_date) return { period: "all_time" };
  return {
    period: "custom",
    start_date: filters.start_date,
    end_date: filters.end_date,
  };
}

export function getAnalyticsSummary<K extends AnalyticsSection>(
  section: K,
  bearerToken: string,
  filters: AnalyticsFilters,
  signal?: AbortSignal,
) {
  const query =
    ["nlp", "performance", "logs"].includes(section) && filters.date
      ? { date: filters.date }
      : periodQuery(filters);
  return apiRequest<AnalyticsResponses[K]>(
    `/dashboard-analytics/${analyticsEndpoints[section]}`,
    { bearerToken, signal, query, baseUrl: ADMIN_API_BASE_URL },
  );
}
