import { ADMIN_API_BASE_URL, apiRequest } from "./client";
import type { ConfigResponse, ConfigUpdateRequest } from "./types";

export function listConfigurations(bearerToken: string) {
  return apiRequest<ConfigResponse[]>("/configurations/", {
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function updateConfiguration(
  configKey: string,
  body: ConfigUpdateRequest,
  bearerToken: string,
) {
  return apiRequest<ConfigResponse>(
    `/configurations/${encodeURIComponent(configKey)}`,
    { method: "PUT", body, bearerToken, baseUrl: ADMIN_API_BASE_URL },
  );
}
