"use client";

import { useTranslations } from "next-intl";
import type { LogEventEntry } from "@/lib/api/logs";
import { normalizeLevel } from "./logLevels";

export default function RawLogViewer({
  entries,
}: {
  entries: LogEventEntry[];
}) {
  const t = useTranslations("fixes");
  return (
    <div
      aria-label={t("rawLogs")}
      className="font-mono custom-scrollbar overflow-x-auto rounded-lg border border-gray-800 bg-gray-950 p-4 text-theme-xs leading-6 text-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
    >
      {entries.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-400">{t("noRaw")}</p>
      ) : (
        entries.map((entry) => {
          const level = normalizeLevel(entry.data.level);
          const tone =
            level === "error"
              ? "text-error-400 dark:text-error-400"
              : level === "warning"
                ? "text-warning-400 dark:text-warning-400"
                : "text-success-300 dark:text-success-300";
          return (
            <div
              key={entry.id}
              className="flex min-w-max gap-4 border-b border-gray-800/60 py-1 last:border-0 dark:border-gray-800/60"
            >
              <span className={`w-20 shrink-0 ${tone}`}>
                [{String(entry.data.level ?? "info").toUpperCase()}]
              </span>
              <span className="w-44 shrink-0 text-blue-light-300 dark:text-blue-light-300">
                {String(entry.data.event ?? "event")}
              </span>
              <code className="whitespace-pre">
                {JSON.stringify(entry.data)}
              </code>
            </div>
          );
        })
      )}
    </div>
  );
}
