"use client";

import { useCallback, useEffect, useState } from "react";
import {
  logStreamUrl,
  parseLogFrame,
  toLogEntry,
  type LogEventEntry,
} from "@/lib/api/logs";

export type LogStreamStatus =
  | "connecting"
  | "live"
  | "reconnecting"
  | "offline"
  | "unauthorized";

interface UseLogStreamOptions {
  token: string | null;
  // Omit to stream every session.
  sessionId?: string;
  // Oldest entries are dropped beyond this.
  maxEntries?: number;
}

// The backend closes with 1008 (policy violation) when the token is rejected.
const POLICY_VIOLATION = 1008;
const MAX_RETRIES = 4;
const MAX_RETRY_DELAY_MS = 15_000;
// A handshake the server never answers would otherwise sit in "connecting"
// indefinitely.
const HANDSHAKE_TIMEOUT_MS = 10_000;
// Busy streams can push many frames a second — batch them into one render.
const FLUSH_INTERVAL_MS = 200;

export default function useLogStream({
  token,
  sessionId,
  maxEntries = 1000,
}: UseLogStreamOptions) {
  const [entries, setEntries] = useState<LogEventEntry[]>([]);
  // Total events received, including ones since dropped by maxEntries.
  const [received, setReceived] = useState(0);
  const [status, setStatus] = useState<LogStreamStatus>("connecting");
  const [attempt, setAttempt] = useState(0);

  // Switching session means a new stream: start from a clean slate.
  const [prevSessionId, setPrevSessionId] = useState(sessionId);
  if (prevSessionId !== sessionId) {
    setPrevSessionId(sessionId);
    setEntries([]);
    setStatus("connecting");
  }

  useEffect(() => {
    if (!token) return;
    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let flushTimer: ReturnType<typeof setTimeout> | undefined;
    let handshakeTimer: ReturnType<typeof setTimeout> | undefined;
    let retries = 0;
    let pending: LogEventEntry[] = [];

    const flush = () => {
      flushTimer = undefined;
      const batch = pending;
      pending = [];
      setEntries((prev) => {
        const next = prev.concat(batch);
        return next.length > maxEntries ? next.slice(-maxEntries) : next;
      });
      setReceived((count) => count + batch.length);
    };

    const connect = () => {
      const current = new WebSocket(logStreamUrl(token, sessionId));
      socket = current;
      // Closing a socket that's still connecting fires onclose → retry path.
      handshakeTimer = setTimeout(() => current.close(), HANDSHAKE_TIMEOUT_MS);
      current.onopen = () => {
        clearTimeout(handshakeTimer);
        retries = 0;
        setStatus("live");
      };
      current.onmessage = (message) => {
        const data = parseLogFrame(message.data);
        if (!data) return;
        pending.push(toLogEntry(data));
        flushTimer ??= setTimeout(flush, FLUSH_INTERVAL_MS);
      };
      current.onclose = (event) => {
        clearTimeout(handshakeTimer);
        if (event.code === POLICY_VIOLATION) {
          setStatus("unauthorized");
          return;
        }
        // A rejected handshake (bad token, stream disabled) closes without
        // ever opening, so this also stops us hammering a server that says no.
        if (retries >= MAX_RETRIES) {
          setStatus("offline");
          return;
        }
        setStatus("reconnecting");
        retryTimer = setTimeout(
          connect,
          Math.min(1000 * 2 ** retries, MAX_RETRY_DELAY_MS),
        );
        retries += 1;
      };
    };

    connect();
    return () => {
      clearTimeout(retryTimer);
      clearTimeout(flushTimer);
      clearTimeout(handshakeTimer);
      if (socket) {
        socket.onclose = null;
        socket.onmessage = null;
        socket.close();
      }
    };
  }, [token, sessionId, attempt, maxEntries]);

  const clear = useCallback(() => setEntries([]), []);

  const reconnect = useCallback(() => {
    setStatus("connecting");
    setAttempt((n) => n + 1);
  }, []);

  return { entries, received, status, clear, reconnect };
}
