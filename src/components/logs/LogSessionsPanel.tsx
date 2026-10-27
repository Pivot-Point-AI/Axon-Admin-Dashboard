"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { listLogSessions, sessionIdsFrom } from "@/lib/api/logs";
import { RefreshIcon, SearchOutlineIcon } from "@/icons";

interface LogSessionsPanelProps {
  selected: string | undefined;
  onSelect: (sessionId: string | undefined) => void;
}

export default function LogSessionsPanel({
  selected,
  onSelect,
}: LogSessionsPanelProps) {
  const t = useTranslations("logTerminal");
  const { accessToken } = useAdminAuth();
  const [sessions, setSessions] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!accessToken) return;
      setLoading(true);
      setFailed(false);
      try {
        const data = await listLogSessions(accessToken, 200, signal);
        if (!signal?.aborted)
          setSessions([
            ...new Set(
              sessionIdsFrom(
                Array.isArray(data) ? { sessions: data } : (data ?? {}),
              ),
            ),
          ]);
      } catch {
        if (!signal?.aborted) setFailed(true);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [accessToken],
  );
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  const visible = sessions.filter((id) =>
    id.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <aside
      aria-label={t("sessions")}
      className="flex min-h-0 shrink-0 flex-col border-b border-gray-200 bg-gray-50 lg:w-72 lg:border-e lg:border-b-0 dark:border-terminal-border dark:bg-terminal-bg"
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-terminal-border">
        <h2 className="flex items-center gap-2 text-theme-xs font-semibold tracking-widest text-gray-800 uppercase dark:text-gray-200">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-brand-500 dark:bg-brand-400"
          />
          {t("sessions")}
          <span className="font-mono rounded border border-gray-200 px-1.5 py-0.5 font-normal tracking-normal text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {sessions.length}
          </span>
        </h2>
        <button
          type="button"
          title={t("refreshSessions")}
          aria-label={t("refreshSessions")}
          disabled={loading}
          onClick={() => void load()}
          className="flex size-7 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <RefreshIcon
            className={`size-3.5 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`}
          />
        </button>
      </div>
      <div className="relative border-b border-gray-200 p-3 dark:border-terminal-border">
        <SearchOutlineIcon
          aria-hidden="true"
          className="pointer-events-none absolute start-5 top-5 size-4 text-gray-400 dark:text-gray-500"
        />
        <input
          aria-label={t("searchSessions")}
          placeholder={t("searchSessions")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="font-mono w-full rounded border border-gray-200 bg-white py-1.5 ps-8 pe-2 text-theme-xs text-gray-700 outline-none focus:border-brand-400 dark:border-terminal-border dark:bg-terminal-panel dark:text-gray-200 dark:focus:border-brand-400"
        />
      </div>
      <div className="custom-scrollbar max-h-48 flex-1 space-y-1 overflow-auto p-2 lg:max-h-none">
        <button
          type="button"
          aria-pressed={!selected}
          onClick={() => onSelect(undefined)}
          className={`font-mono flex w-full items-center gap-2 rounded-md border px-3 py-2 text-start text-theme-xs font-medium ${!selected ? "border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300" : "border-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"}`}
        >
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-brand-500 dark:bg-brand-400"
          />
          {t("allSessions")}
        </button>
        {loading && !sessions.length && (
          <p
            role="status"
            className="px-3 py-2 text-theme-xs text-gray-500 dark:text-gray-400"
          >
            {t("loadingSessions")}
          </p>
        )}
        {failed && (
          <p
            role="alert"
            className="px-3 py-2 text-theme-xs text-error-600 dark:text-error-400"
          >
            {t("sessionsFailed")}
          </p>
        )}
        {!loading && !failed && !visible.length && (
          <p className="px-3 py-3 text-theme-xs text-gray-500 dark:text-gray-500">
            {t("noSessions")}
          </p>
        )}
        {visible.map((id) => (
          <button
            key={id}
            type="button"
            title={id}
            aria-pressed={selected === id}
            onClick={() => onSelect(id)}
            className={`font-mono flex w-full items-center gap-2 rounded-md border px-3 py-2 text-start text-theme-xs ${selected === id ? "border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300" : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-100"}`}
          >
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-gray-400 dark:bg-gray-600"
            />
            <span className="truncate">{id}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
