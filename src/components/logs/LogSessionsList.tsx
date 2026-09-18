"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ApiError } from "@/lib/api/client";
import { listLogSessions } from "@/lib/api/logs";

function extractSessionIds(payload: Record<string, unknown>): string[] {
  const candidate =
    (Array.isArray(payload.sessions) && payload.sessions) ||
    (Array.isArray(payload.session_ids) && payload.session_ids) ||
    (Array.isArray(payload.items) && payload.items) ||
    (Array.isArray(payload.data) && payload.data) ||
    null;

  if (candidate) {
    return candidate.map((item) =>
      typeof item === "string"
        ? item
        : ((item as Record<string, unknown>)?.session_id as string) ??
          JSON.stringify(item),
    );
  }

  // Fallback: if the payload itself maps session_id -> metadata.
  return Object.keys(payload);
}

export default function LogSessionsList() {
  const { accessToken } = useAdminAuth();
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [raw, setRaw] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listLogSessions(accessToken);
      setRaw(data);
      setSessionIds(extractSessionIds(data));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-7">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Log Sessions
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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Session ID
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  Loading sessions…
                </TableCell>
              </TableRow>
            ) : sessionIds.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  No log sessions found.
                </TableCell>
              </TableRow>
            ) : (
              sessionIds.map((sessionId) => (
                <TableRow key={sessionId}>
                  <TableCell className="px-4 py-3 text-sm font-mono text-gray-800 dark:text-white/90">
                    {sessionId}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <Link
                      className="text-brand-500 hover:underline"
                      href={`/logs/${encodeURIComponent(sessionId)}`}
                    >
                      View history
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {raw && sessionIds.length === 0 && (
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
