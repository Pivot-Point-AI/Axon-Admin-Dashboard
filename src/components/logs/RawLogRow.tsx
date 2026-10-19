"use client";

import { useId, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import type { LogEventEntry } from "@/lib/api/logs";
import { LEVEL_BADGE_CLASSES, LEVEL_LABELS, normalizeLevel } from "./logLevels";
import { logTimestamp } from "./logDates";
import { ChevronDownIcon } from "@/icons";

interface RawLogRowProps {
  entry: LogEventEntry;
}

export default function RawLogRow({ entry }: RawLogRowProps) {
  const t = useTranslations("logViewer");
  const format = useFormatter();
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const level = normalizeLevel(entry.data.level);
  const timestamp = logTimestamp(entry.data);
  const dateLabel = timestamp
    ? format.dateTime(timestamp, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    : t("noTimestamp");

  return (
    <div
      className={`border-s-2 border-b border-gray-100 px-4 py-3 transition-colors last:border-b-0 sm:px-5 dark:border-gray-800 ${expanded ? "border-s-brand-500 bg-brand-25 dark:border-s-brand-400 dark:bg-brand-500/5" : "border-s-transparent hover:bg-gray-50 dark:border-s-transparent dark:hover:bg-white/3"}`}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <span className="w-16 shrink-0 sm:w-20">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-theme-xs font-medium ${LEVEL_BADGE_CLASSES[level]}`}
          >
            {LEVEL_LABELS[level]}
          </span>
        </span>
        <time
          dateTime={timestamp?.toISOString()}
          title={dateLabel}
          className="hidden w-44 shrink-0 text-theme-xs text-gray-500 tabular-nums lg:block dark:text-gray-400"
        >
          {dateLabel}
        </time>
        <span
          className="min-w-0 flex-1 text-brand-600 sm:w-44 sm:flex-none sm:shrink-0 dark:text-brand-300"
          title={String(entry.data.event ?? "event")}
        >
          <span className="block truncate font-medium">
            {String(entry.data.event ?? "event")}
          </span>
          <time
            dateTime={timestamp?.toISOString()}
            className="mt-0.5 block text-theme-xs text-gray-500 tabular-nums lg:hidden dark:text-gray-400"
          >
            {dateLabel}
          </time>
        </span>
        <code className="hidden min-w-0 flex-1 truncate text-gray-500 sm:block dark:text-gray-400">
          {JSON.stringify(entry.data)}
        </code>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setExpanded((previous) => !previous)}
          className={`inline-flex w-28 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-1.5 font-outfit text-theme-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 ${expanded ? "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/15" : "border-gray-200 bg-white text-gray-600 hover:border-brand-200 hover:bg-gray-50 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-white/5 dark:hover:text-white"}`}
        >
          <span>{t(expanded ? "viewLess" : "viewMore")}</span>
          <ChevronDownIcon
            aria-hidden="true"
            className={`size-3.5 shrink-0 transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {expanded && (
        <div className="mt-4 flex items-center justify-between rounded-t-xl border border-b-0 border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800/50">
          <span className="font-outfit text-theme-xs font-medium text-gray-700 dark:text-gray-300">
            {String(entry.data.event ?? t("event"))}
          </span>
          <span className="text-theme-xs text-gray-500 dark:text-gray-500">
            JSON
          </span>
        </div>
      )}
      <pre
        id={detailsId}
        hidden={!expanded}
        className="font-mono custom-scrollbar max-h-96 max-w-full overflow-auto rounded-b-xl border border-gray-200 bg-white p-5 text-theme-xs leading-7 break-all whitespace-pre-wrap text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
      >
        {expanded ? JSON.stringify(entry.data, null, 2) : null}
      </pre>
    </div>
  );
}
