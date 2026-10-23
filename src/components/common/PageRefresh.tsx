"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useFormatter, useTranslations } from "next-intl";
import Button from "@/components/ui/button/Button";
import { CalenderIcon, RefreshIcon } from "@/icons";

interface PageRefreshProps {
  loading: boolean;
  error?: boolean;
  disabled?: boolean;
  onRefresh: () => void;
}

// Same "Last Updated + Refresh" control as the Dashboard. It portals into the
// page heading's action slot so every page shows it in the same place.
export default function PageRefresh({
  loading,
  error = false,
  disabled = false,
  onRefresh,
}: PageRefreshProps) {
  const t = useTranslations("dashboardAnalytics");
  const format = useFormatter();
  const slot = useSyncExternalStore(
    () => () => {},
    () => document.querySelector("[data-page-actions]"),
    () => null,
  );
  const [wasLoading, setWasLoading] = useState(loading);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  if (wasLoading !== loading) {
    setWasLoading(loading);
    if (!loading && !error) setUpdatedAt(new Date());
  }
  const control = (
    <div className="flex max-w-full items-center gap-3 rounded-xl border border-brand-100 bg-white p-1.5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="flex min-w-0 items-center gap-2.5 ps-2 pe-1">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          <CalenderIcon aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-theme-xs leading-4 text-gray-500 dark:text-gray-400">
            {t("lastUpdatedLabel")}
          </p>
          <p
            role="status"
            className="mt-0.5 text-theme-xs leading-4 font-medium text-gray-800 dark:text-gray-200"
          >
            {loading ? (
              t("updating")
            ) : updatedAt ? (
              <time dateTime={updatedAt.toISOString()}>
                {format.dateTime(updatedAt, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
            ) : (
              t("unavailable")
            )}
          </p>
        </div>
      </div>
      <Button
        title={t(loading ? "refreshing" : error ? "retry" : "refresh")}
        size="sm"
        variant="primary"
        className="min-h-10 w-10 shrink-0 !px-0 !text-white"
        onClick={onRefresh}
        disabled={loading || disabled}
        startIcon={
          <RefreshIcon
            aria-hidden="true"
            className={`size-4 text-white ${loading ? "motion-safe:animate-spin" : ""}`}
          />
        }
      >
        <span className="sr-only">
          {t(loading ? "refreshing" : error ? "retry" : "refresh")}
        </span>
      </Button>
    </div>
  );
  return slot ? createPortal(control, slot) : null;
}
