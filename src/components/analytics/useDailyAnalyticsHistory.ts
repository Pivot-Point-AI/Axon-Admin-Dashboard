"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  getAnalyticsSummary,
  type AnalyticsFilters,
} from "@/lib/api/analytics";
import type { AnalyticsTrendPoint } from "./AnalyticsTrendChart";
import {
  historyDates,
  loadDailyHistory,
  type DailyHistorySection,
} from "./analyticsDailyHistory";

export default function useDailyAnalyticsHistory(
  section: DailyHistorySection,
  filters: AnalyticsFilters,
  reported: AnalyticsTrendPoint[],
  snapshot: unknown,
) {
  const { accessToken } = useAdminAuth();
  const datesKey = JSON.stringify(historyDates(filters));
  const requestKey = `${section}:${datesKey}`;
  const hasReported = reported.length > 0;
  const enabled = !hasReported && Boolean(accessToken) && datesKey !== "[]";
  const [result, setResult] = useState<{
    key: string;
    points: AnalyticsTrendPoint[];
    failed: boolean;
    snapshot: unknown;
    token: string;
  } | null>(null);
  useEffect(() => {
    if (!enabled || !accessToken) return;
    const controller = new AbortController();
    const dates: string[] = JSON.parse(datesKey);
    loadDailyHistory(
      section,
      dates,
      (date) =>
        getAnalyticsSummary(
          section,
          accessToken,
          section === "flows" ? { start_date: date, end_date: date } : { date },
          controller.signal,
        ),
      controller.signal,
    )
      .then((points) => {
        if (!controller.signal.aborted)
          setResult({
            key: requestKey,
            points,
            failed: false,
            snapshot,
            token: accessToken,
          });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({
            key: requestKey,
            points: [],
            failed: true,
            snapshot,
            token: accessToken,
          });
        controller.abort();
      });
    return () => controller.abort();
  }, [section, accessToken, datesKey, requestKey, enabled, snapshot]);
  const current =
    result?.key === requestKey &&
    result.snapshot === snapshot &&
    result.token === accessToken;
  return {
    points: hasReported ? reported : enabled && current ? result!.points : [],
    loading: enabled && !current,
    failed: enabled && current && result!.failed,
  };
}
