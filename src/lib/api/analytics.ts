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
  date?: string;
  start_time?: string;
  end_time?: string;
}

export function getAnalyticsSummary<K extends AnalyticsSection>(
  section: K,
  bearerToken: string,
  filters: AnalyticsFilters,
  signal?: AbortSignal,
) {
  const query =
    section === "chats"
      ? { start_time: filters.start_time, end_time: filters.end_time }
      : ["nlp", "performance", "logs"].includes(section)
        ? { date: filters.date || "today" }
        : undefined;
  return apiRequest<AnalyticsResponses[K]>(
    `/dashboard-analytics/${analyticsEndpoints[section]}`,
    { bearerToken, signal, query, baseUrl: ADMIN_API_BASE_URL },
  );
}
