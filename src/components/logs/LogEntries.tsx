"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { fetchAudioObjectUrl } from "@/lib/api/logs";

export interface LogEntry {
  raw: Record<string, unknown>;
  text: string | null;
  timestamp: string | null;
  audioFileName: string | null;
  sessionId: string | null;
}

// The logs endpoints don't declare a response schema, so accept the common
// wrappers (bare array, or an object holding the list under a usual key).
export function extractLogEntries(payload: unknown): LogEntry[] {
  const source = payload as Record<string, unknown> | unknown[] | null;
  const candidate: unknown[] | null = Array.isArray(source)
    ? source
    : (source &&
        ((Array.isArray(source.entries) && source.entries) ||
          (Array.isArray(source.history) && source.history) ||
          (Array.isArray(source.logs) && source.logs) ||
          (Array.isArray(source.items) && source.items) ||
          (Array.isArray(source.data) && source.data))) ||
      null;

  if (!candidate) return [];

  return candidate.map((item) => {
    const record = (item && typeof item === "object" ? item : {}) as Record<
      string,
      unknown
    >;
    const text =
      (typeof record.text === "string" && record.text) ||
      (typeof record.message === "string" && record.message) ||
      (typeof record.content === "string" && record.content) ||
      null;
    const timestamp =
      (typeof record.created_at === "string" && record.created_at) ||
      (typeof record.timestamp === "string" && record.timestamp) ||
      null;
    const audioFileName =
      (typeof record.audio_file === "string" && record.audio_file) ||
      (typeof record.audio_file_name === "string" && record.audio_file_name) ||
      (typeof record.file_name === "string" && record.file_name) ||
      null;
    const sessionId =
      typeof record.session_id === "string" ? record.session_id : null;
    return { raw: record, text, timestamp, audioFileName, sessionId };
  });
}

function AudioPlayer({ fileName }: { fileName: string }) {
  const { accessToken } = useAdminAuth();
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let objectUrl: string | null = null;
    fetchAudioObjectUrl(fileName, accessToken)
      .then((url) => {
        objectUrl = url;
        setSrc(url);
      })
      .catch(() => setError("Failed to load audio."));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileName, accessToken]);

  if (error) return <p className="mt-2 text-xs text-error-500">{error}</p>;
  if (!src) return <p className="mt-2 text-xs text-gray-400">Loading audio…</p>;
  return <audio className="mt-2 w-full" controls src={src} />;
}

export default function LogEntryList({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 p-3 dark:border-gray-800"
        >
          {(entry.timestamp || entry.sessionId) && (
            <div className="mb-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-400">
              {entry.timestamp && (
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
              )}
              {entry.sessionId && (
                <span className="font-mono">{entry.sessionId}</span>
              )}
            </div>
          )}
          {entry.text && (
            <p className="text-sm text-gray-800 dark:text-white/90">
              {entry.text}
            </p>
          )}
          {entry.audioFileName && <AudioPlayer fileName={entry.audioFileName} />}
          {!entry.text && !entry.audioFileName && (
            <pre className="overflow-x-auto text-xs text-gray-500 dark:text-gray-400">
              {JSON.stringify(entry.raw, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
