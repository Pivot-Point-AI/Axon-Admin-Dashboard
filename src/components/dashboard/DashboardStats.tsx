"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { CalenderIcon, RefreshIcon } from "@/icons";
import Button from "@/components/ui/button/Button";
import { ApiError } from "@/lib/api/client";
import { getDashboardOverview } from "@/lib/api/dashboardAnalytics";
import type { DashboardOverviewResponse } from "@/lib/api/types";
import AnalyticsKpiCards from "./AnalyticsKpiCards";
import EngagementOverview from "./EngagementOverview";
import FlowOutcomes from "./FlowOutcomes";

interface DashboardStatsProps {
  heading?: ReactNode;
}

export default function DashboardStats({ heading }: DashboardStatsProps = {}) {
  const { accessToken } = useAdminAuth();
  const t = useTranslations("dashboardAnalytics");
  const format = useFormatter();
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();
    getDashboardOverview(accessToken, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setOverview(data);
          setUpdatedAt(new Date());
          setError(null);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setError(err instanceof ApiError ? err.message : t("loadFailed"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [accessToken, t, revision]);

  const refresh = () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setRevision((value) => value + 1);
  };

  return (
    <section aria-label={t("title")} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {heading ?? (
          <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">
            {t("snapshot")}
          </h2>
        )}
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
                  <time
                    dateTime={updatedAt.toISOString()}
                    title={format.dateTime(updatedAt, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  >
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
            size="sm"
            variant="primary"
            className="min-h-10 shrink-0 gap-2 !text-white"
            onClick={refresh}
            disabled={loading}
            startIcon={
              <RefreshIcon
                aria-hidden="true"
                className={`size-4 text-white ${loading ? "motion-safe:animate-spin" : ""}`}
              />
            }
          >
            {t(loading ? "refreshing" : error ? "retry" : "refresh")}
          </Button>
        </div>
      </div>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
        >
          {error}
        </div>
      )}
      <div aria-busy={loading} className="space-y-6">
        <AnalyticsKpiCards overview={overview} />
        <EngagementOverview overview={overview} />
        <FlowOutcomes overview={overview} />
      </div>
    </section>
  );
}
