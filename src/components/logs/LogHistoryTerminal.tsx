"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import DateField from "@/components/form/DateField";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Pagination, { RowsPerPage } from "@/components/common/Pagination";
import type { PaginationControls } from "@/hooks/usePagination";
import type { LogEventEntry } from "@/lib/api/logs";
import LogTerminalHeader from "./LogTerminalHeader";
import RawLogViewer from "./RawLogViewer";
import LogExportActions from "./LogExportActions";

interface LogHistoryTerminalProps {
  tabs: ReactNode;
  sessionId?: string;
  startDate: string;
  endDate: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  startInvalid: boolean;
  endInvalid: boolean;
  filterSessionId: string;
  onSessionChange: (value: string) => void;
  userId: string;
  onUserChange: (value: string) => void;
  flowId: string;
  onFlowChange: (value: string) => void;
  limit: number;
  onLimitChange: (value: number) => void;
  onSearch: () => void;
  loading: boolean;
  searched: boolean;
  error: string | null;
  entries: LogEventEntry[];
  total: number;
  pagination: PaginationControls;
}

export default function LogHistoryTerminal(props: LogHistoryTerminalProps) {
  const t = useTranslations("logTerminal");
  const f = useTranslations("fixes");
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <LogTerminalHeader
        sessionId={props.sessionId}
        tabs={props.tabs}
        status={
          <span
            role="status"
            className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 font-mono text-theme-xs text-gray-600 dark:border-terminal-border dark:bg-white/5 dark:text-terminal-muted"
          >
            {t(props.loading ? "loadingHistory" : "history")}
          </span>
        }
        metadata={
          <div className="flex flex-wrap items-center gap-2 [&_button]:min-h-8 [&_button]:px-3 [&_button]:py-1 [&_button]:text-theme-xs dark:[&_button]:border-terminal-border dark:[&_button]:bg-terminal-bg dark:[&_button]:text-gray-200">
            <label className="flex items-center gap-2 text-theme-xs text-gray-500 dark:text-terminal-muted">
              {f("historyLimit")}
              <select
                aria-label={f("historyLimit")}
                value={props.limit}
                onChange={(event) =>
                  props.onLimitChange(Number(event.target.value))
                }
                className="h-8 rounded border border-gray-200 bg-white px-2 font-mono text-theme-xs text-gray-700 dark:border-terminal-border dark:bg-terminal-bg dark:text-gray-300"
              >
                {[50, 100, 200, 500].map((limit) => (
                  <option key={limit} value={limit}>
                    {limit}
                  </option>
                ))}
              </select>
            </label>
            <div className="[&_label]:text-theme-xs [&_select]:h-8 [&_select]:py-0">
              <RowsPerPage
                pagination={props.pagination}
                disabled={props.loading}
              />
            </div>
            <Button
              variant="outline"
              onClick={props.onSearch}
              disabled={props.loading}
            >
              {t(props.loading ? "loadingHistory" : "load")}
            </Button>
            <LogExportActions entries={props.entries} />
          </div>
        }
        actions={
          <>
            <div className="flex max-w-full items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 dark:border-terminal-border dark:bg-terminal-bg [&_button]:h-8 [&_button]:w-8 [&_input]:h-8 [&_input]:border-0 [&_input]:ps-2 [&_input]:pe-8 [&_input]:font-mono [&_input]:text-theme-xs [&_input]:shadow-none dark:[&_input]:bg-terminal-bg">
              <div className="w-36">
                <DateField
                  id="log-start-date"
                  label={t("startDate")}
                  hideLabel
                  required
                  value={props.startDate}
                  max={props.endDate || undefined}
                  error={props.startInvalid}
                  onChange={props.onStartChange}
                />
              </div>
              <span
                aria-hidden="true"
                className="text-gray-400 dark:text-gray-600"
              >
                –
              </span>
              <div className="w-36">
                <DateField
                  id="log-end-date"
                  label={t("endDate")}
                  hideLabel
                  required
                  value={props.endDate}
                  min={props.startDate || undefined}
                  error={props.endInvalid}
                  onChange={props.onEndChange}
                />
              </div>
            </div>
            {!props.sessionId && (
              <div className="flex items-center gap-2 [&_input]:h-8 [&_input]:w-24 [&_input]:min-w-0 [&_input]:px-2 [&_input]:py-1 [&_input]:font-mono [&_input]:text-theme-xs">
                <Input
                  id="log-session-id"
                  aria-label={t("sessionId")}
                  placeholder={t("sessionId")}
                  value={props.filterSessionId}
                  onChange={(event) =>
                    props.onSessionChange(event.target.value)
                  }
                />
                <Input
                  id="log-user-id"
                  aria-label={t("userId")}
                  placeholder={t("userId")}
                  value={props.userId}
                  onChange={(event) => props.onUserChange(event.target.value)}
                />
                <Input
                  id="log-flow-id"
                  aria-label={t("flowId")}
                  placeholder={t("flowId")}
                  value={props.flowId}
                  onChange={(event) => props.onFlowChange(event.target.value)}
                />
              </div>
            )}
          </>
        }
      />
      {props.error && (
        <p
          role="alert"
          className="border-b border-error-200 bg-error-50 px-5 py-3 text-theme-xs text-error-600 dark:border-error-500/20 dark:bg-error-500/5 dark:text-error-400"
        >
          {props.error}
        </p>
      )}
      <div className="custom-scrollbar min-h-64 flex-1 overflow-auto lg:min-h-0">
        {props.searched && !props.loading ? (
          <RawLogViewer entries={props.entries} terminal />
        ) : (
          <p
            role="status"
            className="px-5 py-6 font-mono text-theme-xs text-gray-500 dark:text-terminal-muted"
          >
            {t(props.loading ? "loadingHistory" : "historyPrompt")}
          </p>
        )}
      </div>
      <footer className="shrink-0 border-t border-gray-200 bg-gray-50 px-5 py-2 text-theme-xs text-gray-500 dark:border-terminal-border dark:bg-terminal-bg dark:text-terminal-muted [&_button]:min-h-7 [&_button]:py-1 [&>nav]:mt-0 [&>nav]:border-0 [&>nav]:pt-0">
        {props.searched ? (
          <Pagination
            pagination={props.pagination}
            variant="footer"
            disabled={props.loading}
          />
        ) : (
          t("history")
        )}
      </footer>
    </div>
  );
}
