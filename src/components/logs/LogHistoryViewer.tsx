"use client";

import Pagination from "@/components/common/Pagination";
import usePagination from "@/hooks/usePagination";
import useRequiredFields from "@/hooks/useRequiredFields";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
import type { LogEvent } from "@/lib/api/types";
import RawLogViewer from "./RawLogViewer";
import LogHistoryTerminal from "./LogHistoryTerminal";

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

const DAY_MS = 86_400_000;
const MIN_SEARCH_DATE = "2000-01-01";

// Safety net in case the server returns events outside the requested dates.
// Events without a readable timestamp are kept, and the range is widened by a
// day on each side so a server/browser timezone difference can't drop rows.
function inDateRange(
  event: LogEvent,
  startDate: string,
  endDate: string,
): boolean {
  const time = Date.parse(String(event.timestamp ?? ""));
  if (Number.isNaN(time)) return true;
  const start = Date.parse(`${startDate}T00:00:00Z`) - DAY_MS;
  const end = Date.parse(`${endDate}T00:00:00Z`) + 2 * DAY_MS;
  return time >= start && time < end;
}

// Large ranges are scanned server-side; past this the server is likely stuck,
// and a spinner that never ends is worse than an error.
const HISTORY_TIMEOUT_MS = 60_000;

function historyErrorMessage(
  err: unknown,
  t: (key: "historyTimeout" | "historyLoadFailed") => string,
): string {
  if (err instanceof DOMException && err.name === "TimeoutError") {
    return t("historyTimeout");
  }
  if (err instanceof ApiError) {
    return err.message;
  }
  return t("historyLoadFailed");
}

interface LogHistoryViewerProps {
  terminalTabs?: ReactNode;
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
  terminalTabs,
}: LogHistoryViewerProps) {
  const f = useTranslations("fixes");
  const errors = useTranslations("apiErrors");
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
  const latestRequest = useRef(0);
  const inFlight = useRef<AbortController | null>(null);

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
    // Only the newest request may update the list; an older, slower response
    // must not overwrite results for the dates now on screen.
    const requestId = ++latestRequest.current;
    // Cancel the superseded request too, so a pile of overlapping scans doesn't
    // hammer the server (and surface spurious errors).
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
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
        AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(HISTORY_TIMEOUT_MS),
        ]),
      );
      if (requestId !== latestRequest.current) return;
      pagination.setPage(1);
      setEntries(
        logEventsFrom(data)
          .filter((event) => inDateRange(event, startDate, endDate))
          .map(toLogEntry),
      );
      setSearched(true);
    } catch (err) {
      if (requestId === latestRequest.current)
        setError(historyErrorMessage(err, errors));
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
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

  // Re-run the search shortly after the filters change, so editing them updates
  // the results without a separate Load click.
  const filtersSeeded = useRef(false);
  useEffect(() => {
    if (!filtersSeeded.current) {
      filtersSeeded.current = true;
      return;
    }
    // A half-edited range isn't worth a request (or an error flash).
    // Typing a year into a date field passes through values like 0002-10-19,
    // which the server answers with a 500.
    const plausible = (date: string) => date >= MIN_SEARCH_DATE;
    if (
      !accessToken ||
      !plausible(startDate) ||
      !plausible(endDate) ||
      startDate > endDate
    )
      return;
    const timer = setTimeout(() => void search(), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, fetchLimit, filterSessionId, userId, flowId]);

  const pagination = usePagination(entries, "", 50);
  const pageEntries = pagination.items;

  if (terminalTabs)
    return (
      <LogHistoryTerminal
        tabs={terminalTabs}
        sessionId={sessionId}
        startDate={startDate}
        endDate={endDate}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
        startInvalid={
          required.invalid(startDate) ||
          (!!startDate && !!endDate && startDate > endDate)
        }
        endInvalid={required.invalid(endDate)}
        filterSessionId={filterSessionId}
        onSessionChange={setFilterSessionId}
        userId={userId}
        onUserChange={setUserId}
        flowId={flowId}
        onFlowChange={setFlowId}
        limit={fetchLimit}
        onLimitChange={setFetchLimit}
        onSearch={() => void search()}
        loading={loading}
        searched={searched}
        error={error}
        entries={pageEntries}
        total={entries.length}
        pagination={pagination}
      />
    );

  return (
    <div className="axon-log-history space-y-4">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">
          {t("recorded")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("historySubtitle")}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950/50">
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
          <Pagination
            variant="header"
            pagination={pagination}
            disabled={loading}
          />
          <div className="custom-scrollbar max-h-128 overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <RawLogViewer entries={pageEntries} terminal />
          </div>
          <Pagination
            variant="footer"
            pagination={pagination}
            disabled={loading}
          />
          <p className="mb-4 text-theme-xs text-gray-500 dark:text-gray-400">
            {f("historyBound", { count: entries.length })}
          </p>
        </>
      )}
    </div>
  );
}
