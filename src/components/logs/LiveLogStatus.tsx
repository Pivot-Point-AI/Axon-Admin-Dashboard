import type { LogStreamStatus } from "@/hooks/useLogStream";

const STATUS: Record<LogStreamStatus, { label: string; dot: string }> = {
  connecting: { label: "Connecting…", dot: "bg-warning-500" },
  live: { label: "Live", dot: "bg-success-500" },
  reconnecting: { label: "Reconnecting…", dot: "bg-warning-500" },
  offline: { label: "Disconnected", dot: "bg-gray-400" },
  unauthorized: { label: "Not authorized", dot: "bg-error-500" },
};

interface LiveLogStatusProps {
  status: LogStreamStatus;
  paused: boolean;
}

export default function LiveLogStatus({ status, paused }: LiveLogStatusProps) {
  const { label, dot } = STATUS[status];
  const pulsing = status === "live" && !paused;
  return (
    <span
      role="status"
      className="inline-flex h-11 items-center gap-2 rounded-full border border-gray-200 px-4 text-theme-xs font-medium text-gray-700 dark:border-gray-800 dark:text-gray-300"
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
      {status === "live" && paused ? "Paused" : label}
    </span>
  );
}
