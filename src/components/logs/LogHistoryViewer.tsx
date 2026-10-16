"use client";

import Pagination from "@/components/common/Pagination";
import usePagination from "@/hooks/usePagination";
import useRequiredFields from "@/hooks/useRequiredFields";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import DateField from "@/components/form/DateField";
import Input from "@/components/form/input/InputField";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ApiError } from "@/lib/api/client";
import {
  getLogHistory,
  logEventsFrom,
  toLogEntry,
  type LogEventEntry,
} from "@/lib/api/logs";
import RawLogViewer from "./RawLogViewer";

const toDateInput = (date: Date) => {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
};

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDateInput(date);
};

const QUICK_RANGES: {
  label: string;
  get: () => { start: string; end: string };
}[] = [
  { label: "Today", get: () => ({ start: daysAgo(0), end: daysAgo(0) }) },
  { label: "Last 7 days", get: () => ({ start: daysAgo(7), end: daysAgo(0) }) },
  {
    label: "Last 30 days",
    get: () => ({ start: daysAgo(30), end: daysAgo(0) }),
  },
  {
    label: "This month",
    get: () => {
      const now = new Date();
      return {
        start: toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
        end: daysAgo(0),
      };
    },
  },
];

// Large ranges are scanned server-side; past this the server is likely stuck,
// and a spinner that never ends is worse than an error.
const HISTORY_TIMEOUT_MS = 60_000;

function historyErrorMessage(err: unknown): string {
  if (err instanceof DOMException && err.name === "TimeoutError") {
    return "The logs server didn't respond within 60 seconds. Try a shorter date range, or try again later.";
  }
  if (err instanceof ApiError) {
    return err.status >= 500
      ? `The logs server hit an internal error (${err.status}) while loading these logs. Try a shorter date range, or try again later.`
      : err.message;
  }
  return "Failed to load log history.";
}

interface LogHistoryViewerProps {
  // When set, the search is pinned to this session and the session / user /
  // flow filters are hidden.
  sessionId?: string;
  // Run the first search as soon as the auth token is available (used on the
  // single-session page).
  autoSearch?: boolean;
}

export default function LogHistoryViewer({
  sessionId,
  autoSearch = false,
}: LogHistoryViewerProps) {
  const f = useTranslations("fixes");
  const [fetchLimit, setFetchLimit] = useState(200);
  const t = useTranslations("managementDesign");
  const { accessToken } = useAdminAuth();
  const [startDate, setStartDate] = useState(() => daysAgo(7));
  const [endDate, setEndDate] = useState(() => toDateInput(new Date()));
  const [filterSessionId, setFilterSessionId] = useState("");
  const [userId, setUserId] = useState("");
  const [flowId, setFlowId] = useState("");

  const [entries, setEntries] = useState<LogEventEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const required = useRequiredFields();

  const search = async () => {
    if (!accessToken) return;
    // Both dates are required by the API.
    setError(null);
    if (!required.validate([startDate, endDate])) return;
    if (startDate > endDate) {
      setError("Start date must be on or before the end date.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getLogHistory(
        {
          limit: fetchLimit,
          startDate,
          endDate,
          sessionId: sessionId ?? filterSessionId.trim(),
          userId: userId.trim(),
          flowId: flowId.trim(),
        },
        accessToken,
        AbortSignal.timeout(HISTORY_TIMEOUT_MS),
      );
      pagination.setPage(1);
      setEntries(logEventsFrom(data).map(toLogEntry));
      setSearched(true);
    } catch (err) {
      setError(historyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const autoRan = useRef(false);
  useEffect(() => {
    if (autoSearch && accessToken && !autoRan.current) {
      autoRan.current = true;
      void search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSearch, accessToken]);

  const pagination = usePagination(entries, "", 50);
  const pageEntries = pagination.items;

  return (
    <div className="axon-log-history">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
          {t("recorded")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("historySubtitle")}
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-gray-25 p-4 dark:border-gray-800 dark:bg-gray-900/40">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="me-1 text-theme-xs font-medium text-gray-500 dark:text-gray-400">
            Quick range
          </span>
          <label className="ms-auto flex items-center gap-2 text-theme-xs text-gray-600 dark:text-gray-300">
            {f("historyLimit")}
            <select
              aria-label={f("historyLimit")}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              value={fetchLimit}
              onChange={(e) => setFetchLimit(Number(e.target.value))}
            >
              {[50, 100, 200, 500].map((limit) => (
                <option key={limit} value={limit}>
                  {limit}
                </option>
              ))}
            </select>
          </label>
          {QUICK_RANGES.map((range) => (
            <button
              key={range.label}
              type="button"
              onClick={() => {
                const { start, end } = range.get();
                setStartDate(start);
                setEndDate(end);
                setError(null);
              }}
              className={`rounded-lg border px-4 py-2 text-theme-xs font-medium transition-colors ${
                range.get().start === startDate && range.get().end === endDate
                  ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                  : "border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-500 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DateField
            id="log-start-date"
            label="Start date"
            required
            value={startDate}
            max={endDate || undefined}
            error={
              required.invalid(startDate) ||
              (!!startDate && !!endDate && startDate > endDate)
            }
            onChange={setStartDate}
          />
          <DateField
            id="log-end-date"
            label="End date"
            required
            value={endDate}
            min={startDate || undefined}
            error={required.invalid(endDate)}
            onChange={setEndDate}
          />
          {!sessionId && (
            <>
              <div>
                <Label htmlFor="log-session-id">Session ID</Label>
                <Input
                  id="log-session-id"
                  value={filterSessionId}
                  placeholder="Optional"
                  onChange={(e) => setFilterSessionId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="log-user-id">User ID</Label>
                <Input
                  id="log-user-id"
                  value={userId}
                  placeholder="Optional"
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="log-flow-id">Flow ID</Label>
                <Input
                  id="log-flow-id"
                  value={flowId}
                  placeholder="Optional"
                  onChange={(e) => setFlowId(e.target.value)}
                />
              </div>
            </>
          )}
          <div className="flex items-end">
            <Button className="w-full" onClick={search} disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </Button>
          </div>
        </div>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
      ) : !searched ? (
        !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose a start and end date, then search to load historical logs.
          </p>
        )
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No log entries found for the selected filters.
        </p>
      ) : (
        <>
          <p className="mb-2 text-theme-xs text-gray-500 dark:text-gray-400">
            {entries.length.toLocaleString()}{" "}
            {entries.length === 1 ? "entry" : "entries"}
          </p>
          <RawLogViewer entries={pageEntries} />
          <Pagination pagination={pagination} disabled={loading} />
          <p className="mb-4 text-theme-xs text-gray-500 dark:text-gray-400">
            {f("historyBound", { count: entries.length })}
          </p>
        </>
      )}
    </div>
  );
}
