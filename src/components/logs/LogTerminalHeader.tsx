"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

interface LogTerminalHeaderProps {
  status?: ReactNode;
  /** Show the "Session: …" label beside the status. */
  showSession?: boolean;
  sessionId?: string;
  tabs?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  metadata?: ReactNode;
}

export default function LogTerminalHeader({
  status,
  showSession = true,
  sessionId,
  tabs,
  actions,
  filters,
  metadata,
}: LogTerminalHeaderProps) {
  const t = useTranslations("logTerminal");
  return (
    <header className="shrink-0 border-b border-gray-200 bg-gray-50/70 dark:border-terminal-border dark:bg-terminal-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3 dark:border-terminal-border">
        {(tabs || status || showSession) && (
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            {tabs}
            {status}
            {showSession && (
              <span
                title={sessionId}
                className="max-w-64 truncate rounded-full border border-gray-200 bg-gray-100 px-3 py-1 font-mono text-theme-xs text-gray-500 dark:border-terminal-border dark:bg-white/5 dark:text-terminal-muted"
              >
                {sessionId
                  ? t("sessionLabel", { session: sessionId })
                  : t("allSessionLabel")}
              </span>
            )}
          </div>
        )}
        {metadata && <div className="ms-auto">{metadata}</div>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-3 [&_button]:min-h-8 [&_button]:px-3 [&_button]:py-1 [&_button]:text-theme-xs dark:[&_button]:border-terminal-border dark:[&_button]:bg-terminal-bg dark:[&_button]:text-gray-200">
          {actions}
        </div>
      )}
      {filters && (
        <div className="border-t border-gray-100 bg-white/60 px-5 py-3 dark:border-terminal-border dark:bg-transparent">
          {filters}
        </div>
      )}
    </header>
  );
}
