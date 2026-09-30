"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useAdminAuth } from "@/context/AdminAuthContext";
import useLogStream from "@/hooks/useLogStream";
import { ChevronDownIcon } from "@/icons";
import {
  listLogSessions,
  sessionIdsFrom,
  type LogEventEntry,
} from "@/lib/api/logs";
import LogEventRow from "./LogEventRow";
import LiveLogStatus from "./LiveLogStatus";
import {
  LEVEL_DOT_CLASSES,
  LEVEL_LABELS,
  LOG_LEVELS,
  normalizeLevel,
  type LogLevel,
} from "./logLevels";

const MAX_ENTRIES = 1000;
// Within this many px of the bottom still counts as following the tail.
const FOLLOW_THRESHOLD = 24;

const selectClasses =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800";

interface PausedSnapshot {
  entries: LogEventEntry[];
  received: number;
}

export default function LiveLogs() {
  const { accessToken } = useAdminAuth();
  // "" streams every session.
  const [scope, setScope] = useState("");
  const { entries, received, status, clear, reconnect } = useLogStream({
    token: accessToken,
    sessionId: scope || undefined,
    maxEntries: MAX_ENTRIES,
  });

  const [knownSessions, setKnownSessions] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [levels, setLevels] = useState<Set<LogLevel>>(
    () => new Set(LOG_LEVELS),
  );
  // While paused the list is frozen on this snapshot; the stream keeps going.
  const [paused, setPaused] = useState<PausedSnapshot | null>(null);
  const [follow, setFollow] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  // Seed the session picker; sessions seen on the stream are added as they
  // show up, so a failure here isn't worth surfacing.
  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    listLogSessions(accessToken)
      .then((data) => {
        if (!cancelled) setKnownSessions(sessionIdsFrom(data));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const shown = paused?.entries ?? entries;
  const newWhilePaused = paused ? received - paused.received : 0;

  // New sessions append to the end so options don't jump around.
  const sessionOptions = useMemo(() => {
    const seen = entries
      .map((entry) => entry.data.session_id)
      .filter((id): id is string => typeof id === "string" && !!id);
    return Array.from(new Set([...knownSessions, ...seen, scope])).filter(
      Boolean,
    );
  }, [entries, knownSessions, scope]);

  const levelCounts = useMemo(() => {
    const counts: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warning: 0,
      error: 0,
    };
    for (const entry of shown) counts[normalizeLevel(entry.data.level)] += 1;
    return counts;
  }, [shown]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return shown.filter(
      (entry) =>
        levels.has(normalizeLevel(entry.data.level)) &&
        (!query || entry.text.includes(query)),
    );
  }, [shown, levels, search]);

  // Keep the newest entry in view unless the user has scrolled up to read.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (follow && list) list.scrollTop = list.scrollHeight;
  }, [visible, follow]);

  const handleScroll = () => {
    const list = listRef.current;
    if (!list) return;
    setFollow(
      list.scrollHeight - list.scrollTop - list.clientHeight <=
        FOLLOW_THRESHOLD,
    );
  };

  const changeScope = (value: string) => {
    setScope(value);
    setPaused(null);
    setFollow(true);
  };

  const toggleLevel = (level: LogLevel) =>
    setLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });

  const togglePause = () =>
    setPaused((prev) => (prev ? null : { entries, received }));

  const handleClear = () => {
    clear();
    setPaused(null);
    setFollow(true);
  };

  const emptyMessage =
    shown.length > 0
      ? "No entries match the current filters."
      : status === "live"
        ? scope
          ? `Waiting for events from ${scope}…`
          : "Waiting for log events…"
        : status === "offline" || status === "unauthorized"
          ? "The live stream is disconnected."
          : "Connecting to the live log stream…";

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full lg:max-w-xs">
          <Label htmlFor="live-log-scope">Stream</Label>
          <select
            id="live-log-scope"
            value={scope}
            onChange={(e) => changeScope(e.target.value)}
            className={selectClasses}
          >
            <option value="">All sessions</option>
            {sessionOptions.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LiveLogStatus status={status} paused={paused !== null} />
          <Button size="sm" variant="outline" onClick={togglePause}>
            {paused
              ? `Resume${newWhilePaused > 0 ? ` (${newWhilePaused.toLocaleString()} new)` : ""}`
              : "Pause"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClear}
            disabled={shown.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="w-full md:max-w-sm">
          <Input
            id="live-log-search"
            type="search"
            aria-label="Search live logs"
            placeholder="Search events, sessions, users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div
          role="group"
          aria-label="Filter by level"
          className="flex flex-wrap items-center gap-2"
        >
          {LOG_LEVELS.map((level) => {
            const active = levels.has(level);
            return (
              <button
                key={level}
                type="button"
                aria-pressed={active}
                onClick={() => toggleLevel(level)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-theme-xs font-medium transition-colors ${
                  active
                    ? "border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    : "border-dashed border-gray-200 text-gray-400 dark:border-gray-800 dark:text-gray-500"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    active
                      ? LEVEL_DOT_CLASSES[level]
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
                {LEVEL_LABELS[level]}
                <span className="text-gray-400 tabular-nums dark:text-gray-500">
                  {levelCounts[level].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {(status === "offline" || status === "unauthorized") && (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-600 sm:flex-row sm:items-center sm:justify-between dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
          <p>
            {status === "unauthorized"
              ? "The server rejected your credentials. Sign in again with an admin account (Super admin, Manager or Viewer)."
              : "Couldn't connect to the live log stream. Check that you're signed in as an admin and that live logging is enabled on the server."}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={reconnect}
          >
            Reconnect
          </Button>
        </div>
      )}

      <div className="relative">
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="custom-scrollbar h-[60vh] min-h-80 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800"
        >
          {visible.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {emptyMessage}
            </div>
          ) : (
            <ul>
              {visible.map((entry) => (
                <LogEventRow
                  key={entry.id}
                  entry={entry}
                  onFollowSession={scope ? undefined : changeScope}
                />
              ))}
            </ul>
          )}
        </div>
        {!follow && visible.length > 0 && (
          <button
            type="button"
            onClick={() => setFollow(true)}
            className="absolute bottom-4 start-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-theme-xs font-medium text-white shadow-theme-lg transition hover:bg-gray-800 rtl:translate-x-1/2 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            <ChevronDownIcon className="size-4" />
            Jump to latest
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
        <span>
          Showing {visible.length.toLocaleString()} of{" "}
          {shown.length.toLocaleString()} entries
          {paused
            ? ` · paused, ${newWhilePaused.toLocaleString()} new since`
            : ""}
        </span>
        <span>Keeps the latest {MAX_ENTRIES.toLocaleString()} entries</span>
      </div>
    </div>
  );
}
