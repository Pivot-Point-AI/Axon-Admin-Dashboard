"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronDownIcon, CopyIcon } from "@/icons";
import type { LogEventEntry } from "@/lib/api/logs";
import LogAudioPlayer from "./LogAudioPlayer";
import { LEVEL_BADGE_CLASSES, LEVEL_LABELS, normalizeLevel } from "./logLevels";

interface LogEventRowProps {
  entry: LogEventEntry;
  // Include the date in the timestamp (history spans days; the live tail
  // doesn't need it).
  showDate?: boolean;
  // Hide the "View session history" link, e.g. on that session's own page.
  linkToHistory?: boolean;
  // Offered only on the live tail while it streams every session.
  onFollowSession?: (sessionId: string) => void;
}

const asText = (value: unknown) =>
  typeof value === "string" && value ? value : null;

function formatTimestamp(timestamp: string | null, showDate: boolean): string {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleString([], {
    ...(showDate ? { month: "short", day: "2-digit" } : {}),
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

const formatValue = (value: unknown) =>
  typeof value === "string" ? value : JSON.stringify(value);

const actionClasses =
  "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-theme-xs font-medium text-gray-700 transition hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-brand-400";

export default function LogEventRow({
  entry,
  showDate = false,
  linkToHistory = true,
  onFollowSession,
}: LogEventRowProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data } = entry;
  const level = normalizeLevel(data.level);
  const event =
    asText(data.event) ??
    asText(data.message) ??
    asText(data.text) ??
    asText(data.content) ??
    "(no message)";
  const sessionId = asText(data.session_id);
  const flowId = asText(data.flow_id);
  const timestamp = asText(data.timestamp) ?? asText(data.created_at);
  const audioFile =
    asText(data.audio_file) ??
    asText(data.audio_file_name) ??
    asText(data.file_name);
  const details = Object.entries(data).filter(
    ([key]) => key !== "event" && key !== "level",
  );

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (insecure origin / permissions) — nothing to do.
    }
  };

  return (
    <li
      className={`border-b border-gray-100 last:border-b-0 dark:border-gray-800 ${
        level === "error" ? "bg-error-50/40 dark:bg-error-500/5" : ""
      }`}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-3 px-4 py-2.5 text-start transition-colors hover:bg-gray-50 dark:hover:bg-white/3"
      >
        <time
          dateTime={timestamp ?? undefined}
          className="shrink-0 pt-0.5 font-mono text-theme-xs text-gray-400 tabular-nums dark:text-gray-500"
        >
          {formatTimestamp(timestamp, showDate)}
        </time>
        <span
          className={`w-16 shrink-0 rounded-md py-0.5 text-center text-theme-xs font-medium ${LEVEL_BADGE_CLASSES[level]}`}
        >
          {LEVEL_LABELS[level]}
        </span>
        <span className="min-w-0 flex-1 text-sm break-words text-gray-800 dark:text-white/90">
          {event}
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 lg:flex">
          {flowId && (
            <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-theme-xs text-gray-600 dark:bg-white/5 dark:text-gray-400">
              {flowId}
            </span>
          )}
          {sessionId && (
            <span className="max-w-40 truncate rounded-md bg-gray-100 px-2 py-0.5 font-mono text-theme-xs text-gray-600 dark:bg-white/5 dark:text-gray-400">
              {sessionId}
            </span>
          )}
        </span>
        <ChevronDownIcon
          className={`size-4 shrink-0 translate-y-0.5 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-white/3">
          {details.length > 0 && (
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {details.map(([key, value]) => (
                <div key={key} className="min-w-0">
                  <dt className="text-theme-xs text-gray-500 dark:text-gray-400">
                    {key}
                  </dt>
                  <dd className="font-mono text-theme-xs break-all text-gray-800 dark:text-white/90">
                    {formatValue(value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {audioFile && <LogAudioPlayer fileName={audioFile} />}
          <div className="flex flex-wrap items-center gap-2">
            {sessionId && onFollowSession && (
              <button
                type="button"
                onClick={() => onFollowSession(sessionId)}
                className={actionClasses}
              >
                Follow this session live
              </button>
            )}
            {sessionId && linkToHistory && (
              <Link
                href={`/logs/${encodeURIComponent(sessionId)}`}
                className={actionClasses}
              >
                View session history
              </Link>
            )}
            <button type="button" onClick={copyJson} className={actionClasses}>
              <CopyIcon className="size-3.5" />
              {copied ? "Copied" : "Copy JSON"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
