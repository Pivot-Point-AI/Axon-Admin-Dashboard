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
  period?: "all_time" | "last_30_days" | "last_7_days" | "today";
  start_date?: string;
  end_date?: string;
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
      ? {
          period: filters.period,
          start_date: filters.start_date,
          end_date: filters.end_date,
          start_time: filters.start_time,
          end_time: filters.end_time,
        }
      : ["nlp", "performance", "logs"].includes(section)
        ? filters.date
          ? { date: filters.date }
          : filters.start_date && filters.start_date === filters.end_date
            ? {
                date: filters.period === "today" ? "today" : filters.start_date,
              }
            : {
                period: filters.period,
                start_date: filters.start_date,
                end_date: filters.end_date,
              }
        : {
            period: filters.period ?? "all_time",
            start_date: filters.start_date,
            end_date: filters.end_date,
          };
  return apiRequest<AnalyticsResponses[K]>(
    `/dashboard-analytics/${analyticsEndpoints[section]}`,
    { bearerToken, signal, query, baseUrl: ADMIN_API_BASE_URL },
  );
}
