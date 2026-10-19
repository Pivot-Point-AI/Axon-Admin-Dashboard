"use client";

import { useFormatter, useTranslations } from "next-intl";
import { CalenderIcon } from "@/icons";
import type { LogEventEntry } from "@/lib/api/logs";
import RawLogRow from "./RawLogRow";
import LogEmptyState from "./LogEmptyState";
import { logDateBounds } from "./logDates";

export default function RawLogViewer({
  entries,
}: {
  entries: LogEventEntry[];
}) {
  const t = useTranslations("fixes");
  const labels = useTranslations("logViewer");
  const format = useFormatter();
  const bounds = logDateBounds(entries);
  const dateOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  } as const;

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
      className="font-mono overflow-hidden rounded-xl border border-gray-200 bg-white text-theme-xs leading-6 text-gray-700 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4 font-outfit dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-brand-500 dark:bg-brand-400"
          />
          <span className="text-sm font-semibold text-gray-900 dark:text-white/90">
            {labels("label")}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
            <CalenderIcon aria-hidden="true" className="size-4 shrink-0" />
            <span className="sr-only">{labels("dateRange")}</span>
            {bounds ? (
              <>
                <time dateTime={bounds.start.toISOString()}>
                  {format.dateTime(bounds.start, dateOptions)}
                </time>
                {bounds.start.getTime() !== bounds.end.getTime() && (
                  <>
                    <span aria-hidden="true">–</span>
                    <time dateTime={bounds.end.toISOString()}>
                      {format.dateTime(bounds.end, dateOptions)}
                    </time>
                  </>
                )}
              </>
            ) : (
              <span>{labels("noTimestamp")}</span>
            )}
          </div>
          <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-theme-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            {labels("eventCount", { count: entries.length })}
          </span>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="flex items-center gap-3 border-s-2 border-b border-gray-200 border-s-transparent bg-gray-50 px-4 py-2.5 font-outfit text-theme-xs font-medium text-gray-500 sm:gap-4 sm:px-5 dark:border-gray-800 dark:border-s-transparent dark:bg-gray-800/40 dark:text-gray-400"
      >
        <span className="w-16 shrink-0 sm:w-20">{labels("level")}</span>
        <span className="hidden w-44 shrink-0 lg:block">
          {labels("dateTime")}
        </span>
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
