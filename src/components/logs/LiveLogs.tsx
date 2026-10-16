"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button/Button";
import { useAdminAuth } from "@/context/AdminAuthContext";
import useLogStream from "@/hooks/useLogStream";
import type { LogEventEntry } from "@/lib/api/logs";
import RawLogViewer from "./RawLogViewer";
import LiveLogStatus from "./LiveLogStatus";

const MAX_ENTRIES = 1000;
export default function LiveLogs() {
  const t = useTranslations("fixes");
  const { accessToken } = useAdminAuth();
  const { entries, received, status, clear, reconnect } = useLogStream({
    token: accessToken,
    maxEntries: MAX_ENTRIES,
  });
  const [paused, setPaused] = useState<{
    entries: LogEventEntry[];
    received: number;
  } | null>(null);
  const [follow, setFollow] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const shown = paused?.entries ?? entries;
  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && follow) list.scrollTop = list.scrollHeight;
  }, [shown, follow]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("liveLogs")}
        </h3>
        <LiveLogStatus status={status} paused={paused !== null} />
      </div>
      <div
        ref={listRef}
        onScroll={() => {
          const list = listRef.current;
          if (list)
            setFollow(
              list.scrollHeight - list.scrollTop - list.clientHeight <= 24,
            );
        }}
        className="custom-scrollbar max-h-128 min-h-80 overflow-auto rounded-lg bg-gray-950 dark:bg-gray-950"
      >
        <RawLogViewer entries={shown} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-theme-xs text-gray-500 dark:text-gray-400">
          {t("buffered", { count: shown.length, max: MAX_ENTRIES })}
          {paused &&
            ` ${t("newEvents", { count: Math.max(0, received - paused.received) })}`}
        </span>
        <div className="flex flex-wrap gap-2">
          {!follow && (
            <Button size="sm" variant="outline" onClick={() => setFollow(true)}>
              {t("latest")}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setPaused((previous) => (previous ? null : { entries, received }))
            }
          >
            {t(paused ? "resume" : "pause")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!shown.length}
            onClick={() => {
              clear();
              setPaused(null);
              setFollow(true);
            }}
          >
            {t("clear")}
          </Button>
          {(status === "offline" || status === "unauthorized") && (
            <Button size="sm" onClick={reconnect}>
              {t("reconnect")}
            </Button>
          )}
        </div>
      </div>
      {(status === "offline" || status === "unauthorized") && (
        <p role="alert" className="text-sm text-error-600 dark:text-error-400">
          {t(status === "unauthorized" ? "unauthorized" : "offline")}
        </p>
      )}
    </div>
  );
}
