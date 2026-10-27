"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button/Button";
import { useAdminAuth } from "@/context/AdminAuthContext";
import useLogStream from "@/hooks/useLogStream";
import type { LogEventEntry } from "@/lib/api/logs";
import RawLogViewer from "./RawLogViewer";
import LiveLogStatus from "./LiveLogStatus";
import Pagination, { RowsPerPage } from "@/components/common/Pagination";
import usePagination from "@/hooks/usePagination";
import LogTerminalHeader from "./LogTerminalHeader";
import LogExportActions from "./LogExportActions";

const MAX_ENTRIES = 1000;
export default function LiveLogs({
  sessionId,
  tabs,
}: { sessionId?: string; tabs?: ReactNode } = {}) {
  const t = useTranslations("fixes");
  const { accessToken } = useAdminAuth();
  const { entries, received, status, clear, reconnect } = useLogStream({
    token: accessToken,
    sessionId,
    maxEntries: MAX_ENTRIES,
  });
  const [paused, setPaused] = useState<{
    entries: LogEventEntry[];
    received: number;
  } | null>(null);
  const [follow, setFollow] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const shown = paused?.entries ?? entries;
  const pagination = usePagination(shown, "", 50, follow);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && follow) list.scrollTop = list.scrollHeight;
  }, [shown, follow, pagination.page, pagination.pageSize]);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <LogTerminalHeader
        sessionId={sessionId}
        tabs={tabs}
        status={<LiveLogStatus status={status} paused={paused !== null} />}
        metadata={
          <div className="[&_select]:h-8 [&_select]:py-1">
            <RowsPerPage pagination={pagination} />
          </div>
        }
        actions={
          <>
            {!follow && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setPaused(null);
                  setFollow(true);
                }}
              >
                {t("latest")}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="min-h-7 px-2.5 py-1 text-theme-xs"
              onClick={() =>
                setPaused((previous) =>
                  previous ? null : { entries, received },
                )
              }
            >
              {t(paused ? "resume" : "pause")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="min-h-7 px-2.5 py-1 text-theme-xs"
              disabled={!shown.length}
              onClick={() => {
                clear();
                setPaused(null);
                setFollow(true);
              }}
            >
              {t("clear")}
            </Button>
            <LogExportActions entries={shown} />
            {(status === "offline" || status === "unauthorized") && (
              <Button size="sm" onClick={reconnect}>
                {t("reconnect")}
              </Button>
            )}
          </>
        }
      />
      <div
        ref={listRef}
        onScroll={() => {
          const list = listRef.current;
          if (list)
            setFollow(
              pagination.page === pagination.pageCount &&
                list.scrollHeight - list.scrollTop - list.clientHeight <= 24,
            );
        }}
        className="custom-scrollbar min-h-64 flex-1 overflow-auto lg:min-h-0"
      >
        <RawLogViewer entries={pagination.items} terminal />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-5 py-2 font-mono text-theme-xs text-gray-500 dark:border-terminal-border dark:bg-terminal-bg dark:text-terminal-muted">
        <span>
          {t("buffered", { count: shown.length, max: MAX_ENTRIES })}
          {paused &&
            ` ${t("newEvents", { count: Math.max(0, received - paused.received) })}`}
        </span>
        <div className="[&_button]:min-h-7 [&_button]:py-1 [&>nav]:mt-0 [&>nav]:border-0 [&>nav]:pt-0">
          <Pagination
            variant="footer"
            pagination={{
              ...pagination,
              setPage: (page) => {
                if (!paused) setPaused({ entries, received });
                setFollow(false);
                pagination.setPage(page);
                if (listRef.current) listRef.current.scrollTop = 0;
              },
            }}
          />
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
