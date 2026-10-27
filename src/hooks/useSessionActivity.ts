"use client";

import { useCallback, useEffect, useRef } from "react";
import { logStreamUrl, parseLogFrame } from "@/lib/api/logs";

// A session with no event for this long is treated as ended.
const LIVE_WINDOW_MS = 3 * 60_000;
const RECONNECT_DELAY_MS = 5_000;

// Watches the all-sessions stream and remembers when each session last spoke,
// so the UI can tell a running session from one that only exists in history.
// Everything lives in refs — it never triggers a render.
export default function useSessionActivity(token: string | null) {
  const lastSeen = useRef(new Map<string, number>());
  const closed = useRef(new Set<string>());

  useEffect(() => {
    if (!token) return;
    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const connect = () => {
      const current = new WebSocket(logStreamUrl(token));
      socket = current;
      current.onmessage = (message) => {
        const event = parseLogFrame(message.data);
        const id = event?.session_id;
        if (!id) return;
        lastSeen.current.set(id, Date.now());
        if (event.event === "ws_disconnect") closed.current.add(id);
        else closed.current.delete(id);
      };
      current.onclose = () => {
        if (!stopped) retryTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      if (socket) {
        socket.onclose = null;
        socket.onmessage = null;
        socket.close();
      }
    };
  }, [token]);

  return useCallback((sessionId: string) => {
    if (closed.current.has(sessionId)) return false;
    const seen = lastSeen.current.get(sessionId);
    return seen !== undefined && Date.now() - seen < LIVE_WINDOW_MS;
  }, []);
}
