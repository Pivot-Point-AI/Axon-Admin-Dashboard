import { ADMIN_API_BASE_URL, apiRequest } from "./client";
import { periodQuery, type AnalyticsFilters } from "./analytics";
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
      query: periodQuery(filters),
      baseUrl: ADMIN_API_BASE_URL,
    },
  );
}
