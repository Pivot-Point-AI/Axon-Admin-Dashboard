import { ADMIN_API_BASE_URL, apiRequest } from "./client";
import type { FlowModel } from "./types";

// No response_model declared on the backend for GET /flows/ — treat the
// payload as unknown and render it defensively.
export function getFlows(bearerToken: string) {
  return apiRequest<unknown>("/flows/", {
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function updateFlow(body: FlowModel, bearerToken: string) {
  return apiRequest<unknown>("/flows/", {
    method: "PUT",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}
