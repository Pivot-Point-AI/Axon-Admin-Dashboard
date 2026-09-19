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
  user_id: string;
  role: string;
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

export function adminForgotPassword(email: string) {
  return apiRequest<unknown>("/auth/forgot-password", {
    method: "POST",
    body: { email },
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function adminResetPassword(token: string, newPassword: string) {
  return apiRequest<unknown>("/auth/reset-password", {
    method: "POST",
    body: { token, new_password: newPassword },
    baseUrl: ADMIN_API_BASE_URL,
  });
}
