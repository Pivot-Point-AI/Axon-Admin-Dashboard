import { ADMIN_API_BASE_URL, apiRequest } from "./client";
import type { LogHistoryResponse, LogSessionsResponse } from "./types";

export function listLogSessions(bearerToken: string, limit = 200) {
  return apiRequest<LogSessionsResponse>("/logs/sessions", {
    query: { limit },
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export function getLogHistory(
  sessionId: string,
  bearerToken: string,
  limit = 500,
) {
  return apiRequest<LogHistoryResponse>(
    `/logs/history/${encodeURIComponent(sessionId)}`,
    { query: { limit }, bearerToken, baseUrl: ADMIN_API_BASE_URL },
  );
}

// The audio endpoint is bearer-protected, so a plain <audio src> (which can't
// send an Authorization header) won't work — fetch it and hand back a blob URL.
export async function fetchAudioObjectUrl(
  fileName: string,
  bearerToken: string,
): Promise<string> {
  const response = await fetch(
    `${ADMIN_API_BASE_URL}/logs/audio/${encodeURIComponent(fileName)}`,
    { headers: { Authorization: `Bearer ${bearerToken}` } },
  );
  if (!response.ok) {
    throw new Error(`Failed to load audio file (status ${response.status})`);
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
