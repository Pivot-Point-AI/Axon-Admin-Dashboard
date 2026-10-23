import { ADMIN_API_BASE_URL, apiRequest } from "./client";
import type { AnalyticsFilters } from "./analytics";
import type { DashboardOverviewResponse } from "./types";

export function getDashboardOverview(
  bearerToken: string,
  signal?: AbortSignal,
  filters: AnalyticsFilters = {},
) {
  return apiRequest<DashboardOverviewResponse>(
    "/dashboard-analytics/overview",
    {
      bearerToken,
      signal,
      query: {
        period: filters.period,
        start_date: filters.start_date,
        end_date: filters.end_date,
      },
      baseUrl: ADMIN_API_BASE_URL,
    },
  );
}
