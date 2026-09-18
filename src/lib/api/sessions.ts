import { apiRequest } from "./client";
import type { StartSessionRequest, StartSessionResponse } from "./types";

export function startSession(
  body: StartSessionRequest,
  licenseKey?: string | null,
) {
  return apiRequest<StartSessionResponse>("/start-session", {
    method: "POST",
    body,
    licenseKey,
  });
}
