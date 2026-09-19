import { ADMIN_API_BASE_URL, apiRequest } from "./client";
import type { MessageModel } from "./types";

// No response_model declared on the backend for GET /messages/ — treat the
// payload as unknown and render it defensively.
export function getMessages(bearerToken: string) {
  return apiRequest<unknown>("/messages/", {
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function updateMessage(body: MessageModel, bearerToken: string) {
  return apiRequest<unknown>("/messages/", {
    method: "PUT",
    body,
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}
