export const LOG_LEVELS = ["debug", "info", "warning", "error"] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

// Loggers disagree on names ("warn", "critical", …) — fold them into four.
export function normalizeLevel(level: unknown): LogLevel {
  const value = typeof level === "string" ? level.trim().toLowerCase() : "";
  if (value === "warn" || value === "warning") return "warning";
  if (["error", "err", "critical", "fatal", "exception"].includes(value)) {
    return "error";
  }
  if (value === "debug" || value === "trace") return "debug";
  return "info";
}

export const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: "Debug",
  info: "Info",
  warning: "Warning",
  error: "Error",
};

export const LEVEL_BADGE_CLASSES: Record<LogLevel, string> = {
  debug: "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400",
  info: "bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-400",
  warning:
    "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400",
  error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400",
};

export const LEVEL_DOT_CLASSES: Record<LogLevel, string> = {
  debug: "bg-gray-400",
  info: "bg-blue-light-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
};
