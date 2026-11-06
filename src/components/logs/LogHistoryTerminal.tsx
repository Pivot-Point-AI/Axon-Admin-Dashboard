"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import DateField from "@/components/form/DateField";
import Input from "@/components/form/input/InputField";
import Pagination, { RowsPerPage } from "@/components/common/Pagination";
import type { PaginationControls } from "@/hooks/usePagination";
import type { LogEventEntry, LogFlowStatus } from "@/lib/api/logs";
import LogFlowStatusSelect from "./LogFlowStatusSelect";
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
  flowStatus: LogFlowStatus | "";
  onFlowStatusChange: (value: LogFlowStatus | "") => void;
  limit: number;
  onLimitChange: (value: number) => void;
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
        showSession={false}
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
            <LogExportActions entries={props.entries} />
          </div>
        }
        filters={
          <div
            role="group"
            aria-label={t("filters")}
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[auto_repeat(3,minmax(0,1fr))_auto] [&_input]:h-9 [&_input]:w-full [&_input]:min-w-0 [&_input]:px-3 [&_input]:py-0 [&_input]:font-mono [&_input]:text-theme-xs [&_input]:shadow-none dark:[&_input]:bg-terminal-bg"
          >
            <div className="flex h-9 min-w-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-1 sm:col-span-2 lg:col-span-1 dark:border-terminal-border dark:bg-terminal-bg [&_button]:h-7 [&_button]:w-7 [&_input]:h-8 [&_input]:border-0 [&_input]:ps-2 [&_input]:pe-8 [&_input]:shadow-none">
              <div className="min-w-32 flex-1">
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
              <div className="min-w-32 flex-1">
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
              <>
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
                <LogFlowStatusSelect
                  id="log-flow-status"
                  value={props.flowStatus}
                  onChange={props.onFlowStatusChange}
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 font-mono text-theme-xs text-gray-700 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden lg:w-40 dark:border-terminal-border dark:bg-terminal-bg dark:text-gray-300"
                />
              </>
            )}
          </div>
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
