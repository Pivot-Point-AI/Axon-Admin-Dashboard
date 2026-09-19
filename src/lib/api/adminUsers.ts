import { ADMIN_API_BASE_URL, apiRequest } from "./client";
import type {
  CreateDashboardUserRequest,
  DashboardUserResponse,
} from "./types";

export function listDashboardUsers(bearerToken: string) {
  return apiRequest<DashboardUserResponse[]>("/management/", {
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function createDashboardUser(
  body: CreateDashboardUserRequest,
  bearerToken: string,
) {
  return apiRequest<DashboardUserResponse>("/management/", {
    method: "POST",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function deleteDashboardUser(userId: string, bearerToken: string) {
  return apiRequest<unknown>(`/management/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}
