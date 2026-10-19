import { ADMIN_API_BASE_URL, apiRequest } from "./client";
import type { DashboardOverviewResponse } from "./types";

export function getDashboardOverview(
  bearerToken: string,
  signal?: AbortSignal,
) {
  return apiRequest<DashboardOverviewResponse>(
    "/dashboard-analytics/overview",
    {
      bearerToken,
      signal,
      baseUrl: ADMIN_API_BASE_URL,
    },
  );
}
