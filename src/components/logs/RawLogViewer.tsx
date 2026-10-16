"use client";

import { useTranslations } from "next-intl";
import type { LogEventEntry } from "@/lib/api/logs";
import RawLogRow from "./RawLogRow";
import LogEmptyState from "./LogEmptyState";

export default function RawLogViewer({
  entries,
}: {
  entries: LogEventEntry[];
}) {
  const t = useTranslations("fixes");
  const labels = useTranslations("logViewer");

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <LogEmptyState />
      </div>
    );
  }

  return (
    <div
      aria-label={t("rawLogs")}
      className="font-mono overflow-hidden rounded-xl border border-gray-800 bg-gray-950 text-theme-xs leading-6 text-gray-100 shadow-theme-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-800 bg-gray-900/70 px-5 py-4 font-outfit dark:border-gray-800 dark:bg-gray-900/70">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-blue-light-400 dark:bg-blue-light-400"
          />
          <span className="text-sm font-medium text-gray-100 dark:text-gray-100">
            {labels("label")}
          </span>
        </div>
        <span className="rounded-md border border-gray-700/70 bg-gray-800/60 px-2.5 py-0.5 text-theme-xs text-gray-400 dark:border-gray-700/70 dark:bg-gray-800/60 dark:text-gray-400">
          {labels("eventCount", { count: entries.length })}
        </span>
      </div>
      <div
        aria-hidden="true"
        className="flex items-center gap-3 border-s-2 border-b border-gray-800 border-s-transparent px-4 py-2 font-outfit text-theme-xs font-medium text-gray-500 sm:gap-4 sm:px-5 dark:border-gray-800 dark:border-s-transparent dark:text-gray-500"
      >
        <span className="w-14 shrink-0 sm:w-20">{labels("level")}</span>
        <span className="min-w-0 flex-1 sm:w-44 sm:flex-none sm:shrink-0">
          {labels("event")}
        </span>
        <span className="hidden min-w-0 flex-1 sm:block">
          {labels("preview")}
        </span>
        <span className="w-28 shrink-0 text-center">{labels("payload")}</span>
      </div>
      {entries.map((entry) => (
        <RawLogRow key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
