import { ADMIN_API_BASE_URL, apiRequest } from "./client";

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  refresh_token: string;
  access_expires_in: number;
  refresh_expires_in: number;
  admin_id: string;
}

export function adminLogin(body: AdminLoginRequest) {
  return apiRequest<AdminLoginResponse>("/auth/login", {
    method: "POST",
    body,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function adminRefresh(refreshToken: string) {
  return apiRequest<AdminLoginResponse>("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
    baseUrl: ADMIN_API_BASE_URL,
  });
}
