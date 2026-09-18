"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ApiError } from "@/lib/api/client";
import { fetchAudioObjectUrl, getLogHistory } from "@/lib/api/logs";

interface LogEntry {
  raw: Record<string, unknown>;
  text: string | null;
  timestamp: string | null;
  audioFileName: string | null;
}

function extractEntries(payload: Record<string, unknown>): LogEntry[] {
  const candidate =
    (Array.isArray(payload.entries) && payload.entries) ||
    (Array.isArray(payload.history) && payload.history) ||
    (Array.isArray(payload.logs) && payload.logs) ||
    (Array.isArray(payload.items) && payload.items) ||
    (Array.isArray(payload.data) && payload.data) ||
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
    return { raw: record, text, timestamp, audioFileName };
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

export default function LogSessionDetail({
  sessionId,
}: {
  sessionId: string;
}) {
  const { accessToken } = useAdminAuth();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [raw, setRaw] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getLogHistory(sessionId, accessToken);
      setRaw(data);
      setEntries(extractEntries(data));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load log history.");
    } finally {
      setLoading(false);
    }
  }, [sessionId, accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-7">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Session {sessionId}
        </h3>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No structured entries found for this session.
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-3 dark:border-gray-800"
            >
              {entry.timestamp && (
                <div className="mb-1 text-xs text-gray-400">
                  {new Date(entry.timestamp).toLocaleString()}
                </div>
              )}
              {entry.text && (
                <p className="text-sm text-gray-800 dark:text-white/90">
                  {entry.text}
                </p>
              )}
              {entry.audioFileName && (
                <AudioPlayer fileName={entry.audioFileName} />
              )}
              {!entry.text && !entry.audioFileName && (
                <pre className="overflow-x-auto text-xs text-gray-500 dark:text-gray-400">
                  {JSON.stringify(entry.raw, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {raw && (
        <details className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <summary className="cursor-pointer">Raw response</summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
            {JSON.stringify(raw, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
