"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/utils";
import { ChevronLeftIcon } from "@/icons";
import { useAdminAuth } from "@/context/AdminAuthContext";
import useSessionActivity from "@/hooks/useSessionActivity";
import LiveLogs from "./LiveLogs";
import LogHistoryViewer from "./LogHistoryViewer";
import LogSessionsPanel from "./LogSessionsPanel";

const tabs = [
  { key: "live", label: "realtime" },
  { key: "historical", label: "history" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function LogsManager() {
  const [activeTab, setActiveTab] = useState<TabKey>("live");
  const [sessionId, setSessionId] = useState<string>();
  const [fullScreen, setFullScreen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(true);
  useEffect(() => {
    if (!fullScreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullScreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullScreen]);
  const t = useTranslations("logTerminal");
  const { accessToken } = useAdminAuth();
  const isSessionLive = useSessionActivity(accessToken);
  // A session that has ended has nothing to tail, so open its history instead.
  const selectSession = (id: string | undefined) => {
    setSessionId(id);
    if (id && activeTab === "live" && !isSessionLive(id))
      setActiveTab("historical");
  };
  const tabControls = (
    <div className="flex items-center gap-2">
      <div
        role="tablist"
        aria-label={t("views")}
        className="flex rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-terminal-border dark:bg-terminal-bg"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            id={`log-tab-${tab.key}`}
            role="tab"
            aria-controls={`log-panel-${tab.key}`}
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "rounded px-4 py-1.5 text-theme-xs font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-theme-xs dark:bg-terminal-panel dark:text-gray-100"
                : "text-gray-500 hover:text-gray-700 dark:text-terminal-muted dark:hover:text-gray-200",
            )}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-pressed={fullScreen}
        onClick={() => setFullScreen((value) => !value)}
        className="rounded-lg border border-gray-200 px-3 py-2 text-theme-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-terminal-border dark:text-gray-300 dark:hover:bg-white/5"
      >
        {t(fullScreen ? "exitFullScreen" : "fullScreen")}
      </button>
    </div>
  );

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden border border-gray-200 bg-white lg:flex-row dark:border-terminal-border dark:bg-terminal-panel",
        fullScreen
          ? "fixed inset-0 z-999999 h-dvh"
          : "min-h-160 rounded-lg shadow-theme-sm lg:h-[calc(100dvh-5.5rem)] lg:min-h-0",
      )}
    >
      <button
        type="button"
        aria-pressed={sessionsOpen}
        aria-label={t(sessionsOpen ? "hideSessions" : "showSessions")}
        onClick={() => setSessionsOpen((value) => !value)}
        className={cn(
          "group absolute top-1/2 z-10 hidden size-6 -translate-y-1/2 items-center justify-center rounded-full border border-brand-300 bg-white text-brand-500 shadow-focus-ring transition-[inset-inline-start,translate,background-color,color] duration-300 ease-in-out hover:bg-brand-50 hover:text-brand-600 lg:flex dark:border-brand-500/60 dark:bg-terminal-panel dark:text-brand-400 dark:hover:bg-brand-500/15 dark:hover:text-brand-300",
          sessionsOpen
            ? "start-72 -translate-x-1/2 rtl:translate-x-1/2"
            : "start-2",
        )}
      >
        <ChevronLeftIcon
          aria-hidden="true"
          className={cn(
            "size-4 transition-transform duration-300",
            sessionsOpen ? "rtl:rotate-180" : "rotate-180 rtl:rotate-0",
          )}
        />
        <span
          role="tooltip"
          className="pointer-events-none absolute start-full top-1/2 ms-2 -translate-y-1/2 rounded-md bg-gray-900 px-2 py-1 text-theme-xs font-medium whitespace-nowrap text-white opacity-0 shadow-tooltip transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-gray-700"
        >
          {t(sessionsOpen ? "hideSessions" : "showSessions")}
        </span>
      </button>
      {/* Hidden rather than unmounted so the session list isn't refetched. */}
      <div
        className={cn(
          "flex min-h-0 overflow-hidden lg:transition-[width] lg:duration-300 lg:ease-in-out [&>aside]:flex-1 lg:[&>aside]:w-72 lg:[&>aside]:flex-none",
          sessionsOpen ? "lg:w-72" : "max-lg:hidden lg:w-0",
        )}
      >
        <LogSessionsPanel selected={sessionId} onSelect={selectSession} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          role="tabpanel"
          id={`log-panel-${activeTab}`}
          aria-labelledby={`log-tab-${activeTab}`}
          className="flex min-h-0 flex-1 flex-col"
        >
          {activeTab === "live" ? (
            <LiveLogs
              key={sessionId ?? "global"}
              sessionId={sessionId}
              tabs={tabControls}
            />
          ) : (
            <LogHistoryViewer
              key={sessionId ?? "global"}
              sessionId={sessionId}
              terminalTabs={tabControls}
              autoSearch
            />
          )}
        </div>
      </div>
    </div>
  );
}
