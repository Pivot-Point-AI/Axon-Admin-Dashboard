import { ADMIN_API_BASE_URL, apiRequest } from "./client";
import type { LogHistoryResponse, LogSessionsResponse } from "./types";

// Live view: the sessions currently being recorded.
export function listLogSessions(bearerToken: string, limit = 200) {
  return apiRequest<LogSessionsResponse>("/logs/sessions", {
    query: { limit },
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

export interface LogHistoryQuery {
  // Both dates are required by the backend (YYYY-MM-DD).
  startDate: string;
  endDate: string;
  sessionId?: string;
  userId?: string;
  flowId?: string;
  limit?: number;
}

export function getLogHistory(
  { startDate, endDate, sessionId, userId, flowId, limit = 500 }: LogHistoryQuery,
  bearerToken: string,
) {
  return apiRequest<LogHistoryResponse>("/logs/history", {
    query: {
      start_date: startDate,
      end_date: endDate,
      session_id: sessionId || undefined,
      user_id: userId || undefined,
      flow_id: flowId || undefined,
      limit,
    },
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
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
