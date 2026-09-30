import { ADMIN_API_BASE_URL, API_BASE_URL, apiRequest } from "./client";
import type {
  LogEvent,
  LogHistoryResponse,
  LogSessionsResponse,
} from "./types";

// The sessions currently being recorded.
export function listLogSessions(bearerToken: string, limit = 200) {
  return apiRequest<LogSessionsResponse>("/logs/sessions", {
    query: { limit },
    bearerToken,
    baseUrl: ADMIN_API_BASE_URL,
  });
}

// /logs/sessions doesn't declare a response schema, so accept the common
// wrappers, falling back to a payload that maps session_id -> metadata.
export function sessionIdsFrom(payload: Record<string, unknown>): string[] {
  const candidate =
    (Array.isArray(payload.sessions) && payload.sessions) ||
    (Array.isArray(payload.session_ids) && payload.session_ids) ||
    (Array.isArray(payload.items) && payload.items) ||
    (Array.isArray(payload.data) && payload.data) ||
    null;
  if (!candidate) return Object.keys(payload);
  return candidate
    .map((item) =>
      typeof item === "string"
        ? item
        : (item as Record<string, unknown> | null)?.session_id,
    )
    .filter((id): id is string => typeof id === "string" && !!id);
}

// Live tail over WebSocket — all sessions, or just one. Unlike the REST logs
// endpoints this lives on the backend root, not under /admin. Browsers can't
// set headers on a WebSocket, so the admin JWT goes in ?token=. In the
// browser the URL runs through the same-origin /backend proxy (Next.js
// forwards the upgrade via the rewrite in next.config.ts), so it becomes
// wss:// whenever the page is https:// and never trips mixed-content blocking.
export function logStreamUrl(token: string, sessionId?: string): string {
  const path = sessionId
    ? `/logs/ws/${encodeURIComponent(sessionId)}`
    : "/logs/ws";
  const url = new URL(`${API_BASE_URL}${path}`, window.location.href);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  return url.toString();
}

// Frames / history lines are stringified JSON objects; anything else is kept
// as a plain event so nothing is silently dropped.
export function parseLogFrame(data: unknown): LogEvent | null {
  if (typeof data !== "string" || !data.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(data);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as LogEvent;
    }
  } catch {
    // Not JSON — fall through.
  }
  return { event: data };
}

// /logs/history returns { lines: [...] } with one JSON-encoded event per
// line. Accept the other usual wrappers and already-parsed objects too.
export function logEventsFrom(payload: unknown): LogEvent[] {
  const source = payload as Record<string, unknown> | unknown[] | null;
  const list = Array.isArray(source)
    ? source
    : source &&
      ["lines", "entries", "history", "logs", "items", "data"]
        .map((key) => source[key])
        .find(Array.isArray);
  if (!list) return [];
  return list
    .map((item) =>
      typeof item === "string"
        ? parseLogFrame(item)
        : item && typeof item === "object" && !Array.isArray(item)
          ? (item as LogEvent)
          : null,
    )
    .filter((event): event is LogEvent => event !== null);
}

export interface LogEventEntry {
  id: number;
  data: LogEvent;
  // Lower-cased JSON of the event, for cheap free-text filtering.
  text: string;
}

let nextLogEntryId = 0;

export function toLogEntry(data: LogEvent): LogEventEntry {
  return {
    id: nextLogEntryId++,
    data,
    text: JSON.stringify(data).toLowerCase(),
  };
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
  signal?: AbortSignal,
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
    signal,
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
