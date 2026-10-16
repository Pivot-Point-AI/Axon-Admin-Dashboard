"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import type { LogEventEntry } from "@/lib/api/logs";
import { normalizeLevel } from "./logLevels";
import { ChevronDownIcon } from "@/icons";

interface RawLogRowProps {
  entry: LogEventEntry;
}

export default function RawLogRow({ entry }: RawLogRowProps) {
  const t = useTranslations("logViewer");
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const level = normalizeLevel(entry.data.level);
  const tone =
    level === "error"
      ? "text-error-400 dark:text-error-400"
      : level === "warning"
        ? "text-warning-400 dark:text-warning-400"
        : "text-success-300 dark:text-success-300";

  return (
    <div
      className={`border-s-2 border-b border-gray-800/70 px-4 py-3 transition-colors last:border-b-0 sm:px-5 dark:border-gray-800/70 ${expanded ? "border-s-blue-light-400 bg-gray-900/70 dark:border-s-blue-light-400 dark:bg-gray-900/70" : "border-s-transparent hover:bg-white/3 dark:border-s-transparent dark:hover:bg-white/3"}`}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <span className={`w-14 shrink-0 font-medium sm:w-20 ${tone}`}>
          [{String(entry.data.level ?? "info").toUpperCase()}]
        </span>
        <span
          className="min-w-0 flex-1 truncate text-blue-light-300 sm:w-44 sm:flex-none sm:shrink-0 dark:text-blue-light-300"
          title={String(entry.data.event ?? "event")}
        >
          {String(entry.data.event ?? "event")}
        </span>
        <code className="hidden min-w-0 flex-1 truncate text-gray-300 sm:block dark:text-gray-300">
          {JSON.stringify(entry.data)}
        </code>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setExpanded((previous) => !previous)}
          className={`inline-flex w-28 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-1.5 font-outfit text-theme-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 ${expanded ? "border-blue-light-500/30 bg-blue-light-500/10 text-blue-light-300 hover:bg-blue-light-500/15 dark:border-blue-light-500/30 dark:bg-blue-light-500/10 dark:text-blue-light-300 dark:hover:bg-blue-light-500/15" : "border-gray-800 bg-gray-900/50 text-gray-300 hover:border-gray-600 hover:bg-white/5 hover:text-white dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-white/5 dark:hover:text-white"}`}
        >
          <span>{t(expanded ? "viewLess" : "viewMore")}</span>
          <ChevronDownIcon
            aria-hidden="true"
            className={`size-3.5 shrink-0 transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {expanded && (
        <div className="mt-4 flex items-center justify-between rounded-t-xl border border-b-0 border-gray-700/70 bg-gray-800/50 px-4 py-2.5 dark:border-gray-700/70 dark:bg-gray-800/50">
          <span className="font-outfit text-theme-xs font-medium text-gray-300 dark:text-gray-300">
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
        className="font-mono custom-scrollbar max-h-96 max-w-full overflow-auto rounded-b-xl border border-gray-700/70 bg-gray-950 p-5 text-theme-xs leading-7 break-all whitespace-pre-wrap text-gray-200 dark:border-gray-700/70 dark:bg-gray-950 dark:text-gray-200"
      >
        {expanded ? JSON.stringify(entry.data, null, 2) : null}
      </pre>
    </div>
  );
}
