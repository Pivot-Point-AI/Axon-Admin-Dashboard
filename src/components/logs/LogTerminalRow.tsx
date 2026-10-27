"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { LogEventEntry } from "@/lib/api/logs";
import { logTimestamp } from "./logDates";
import { normalizeLevel } from "./logLevels";

interface LogTerminalRowProps {
  entry: LogEventEntry;
}
const levelColors = {
  info: "text-success-700 dark:text-success-300",
  debug: "text-blue-light-700 dark:text-blue-light-300",
  warning: "text-warning-700 dark:text-orange-300",
  error: "text-error-600 dark:text-error-400",
};

export default function LogTerminalRow({ entry }: LogTerminalRowProps) {
  const t = useTranslations("logViewer");
  const format = useFormatter();
  const level = normalizeLevel(entry.data.level);
  const timestamp = logTimestamp(entry.data);
  const event = String(entry.data.event ?? entry.data.event_type ?? "log");
  const turnStart = event === "turn_started";
  const fields = Object.entries(entry.data).filter(
    ([key]) =>
      !["timestamp", "created_at", "level", "event", "event_type"].includes(
        key,
      ),
  );
  return (
    <details
      className={`group border-b px-4 py-0.5 last:border-b-0 hover:bg-gray-50 dark:hover:bg-white/3 ${turnStart ? "mt-4 border-t border-dashed border-warning-200 bg-warning-50/60 py-3 dark:border-warning-500/20 dark:bg-warning-500/5" : "border-transparent dark:border-transparent"}`}
    >
      <summary className="flex cursor-pointer list-none items-start gap-3 text-theme-sm leading-6 [&::-webkit-details-marker]:hidden">
        <time
          title={timestamp?.toISOString() ?? t("noTimestamp")}
          dateTime={timestamp?.toISOString()}
          className="hidden shrink-0 text-gray-400 tabular-nums sm:block dark:text-gray-500"
        >
          {timestamp
            ? format.dateTime(timestamp, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })
            : "—"}
        </time>
        <span className={`w-16 shrink-0 font-medium ${levelColors[level]}`}>
          [{level.toUpperCase()}]
        </span>
        <span
          className={`w-44 shrink-0 font-medium ${turnStart ? "text-warning-700 dark:text-warning-300" : "text-blue-light-700 dark:text-blue-light-300"}`}
        >
          {event}
        </span>
        <span className="min-w-0 flex-1 whitespace-pre-wrap text-gray-600 dark:text-gray-300">
          {fields.map(([key, value], index) => (
            <span key={key}>
              {index > 0 && (
                <span className="mx-2 text-gray-300 dark:text-gray-700">|</span>
              )}
              <span className="text-success-700 dark:text-success-400">
                {key}=
              </span>
              <span className="break-all text-gray-700 dark:text-gray-300">
                {typeof value === "string" ? value : JSON.stringify(value)}
              </span>
            </span>
          ))}
        </span>
      </summary>
      <pre className="mt-2 custom-scrollbar max-h-80 overflow-auto rounded border border-gray-200 bg-gray-50 p-3 text-theme-xs whitespace-pre-wrap text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
        {JSON.stringify(entry.data, null, 2)}
      </pre>
    </details>
  );
}
