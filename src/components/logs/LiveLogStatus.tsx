"use client";

import type { LogStreamStatus } from "@/hooks/useLogStream";
import { useTranslations } from "next-intl";

const STATUS: Record<LogStreamStatus, { label: string; dot: string }> = {
  connecting: { label: "connecting", dot: "bg-warning-500" },
  live: { label: "live", dot: "bg-success-500" },
  reconnecting: { label: "reconnecting", dot: "bg-warning-500" },
  offline: { label: "offline", dot: "bg-error-500" },
  unauthorized: { label: "unauthorized", dot: "bg-error-500" },
};

interface LiveLogStatusProps {
  status: LogStreamStatus;
  paused: boolean;
}

export default function LiveLogStatus({ status, paused }: LiveLogStatusProps) {
  const t = useTranslations("logTerminal.states");
  const { label, dot } = STATUS[status];
  const pulsing = status === "live" && !paused;
  return (
    <span
      role="status"
      className={`font-mono inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-theme-xs font-medium ${status === "live" && !paused ? "border-success-200 bg-success-50 text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400" : status === "offline" || status === "unauthorized" ? "border-error-200 bg-error-50 text-error-600 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400" : "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-500/20 dark:bg-warning-500/10 dark:text-warning-400"}`}
    >
      <span className="relative flex size-2">
        {pulsing && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex size-2 rounded-full ${
            status === "live" && paused ? "bg-warning-500" : dot
          }`}
        />
      </span>
      {t(status === "live" && paused ? "paused" : label)}
    </span>
  );
}
