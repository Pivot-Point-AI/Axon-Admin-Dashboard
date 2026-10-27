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
import { loadAllTimeErrorHistory } from "./analyticsErrorHistory";
import { errorSnapshot } from "./analyticsTelemetryData";
import { asAnalyticsRecord } from "./analyticsData";

export default function useDailyAnalyticsHistory(
  section: DailyHistorySection,
  filters: AnalyticsFilters,
  reported: AnalyticsTrendPoint[],
  snapshot: unknown,
) {
  const { accessToken } = useAdminAuth();
  const [revision, setRevision] = useState(0);
  const datesKey = JSON.stringify(historyDates(filters));
  const requestKey = `${section}:${datesKey}:${revision}`;
  const hasReported = reported.length > 0;
  const allTimeErrors =
    section === "logs" &&
    datesKey === "[]" &&
    !filters.date &&
    (!filters.period || filters.period === "all_time") &&
    errorSnapshot(asAnalyticsRecord(snapshot)).total > 0;
  const enabled =
    !hasReported &&
    Boolean(accessToken) &&
    (datesKey !== "[]" || allTimeErrors);
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
    // Let effect cleanup run before starting network work during React's
    // development replay; actual date changes still abort in-flight requests.
    Promise.resolve()
      .then(() =>
        allTimeErrors
          ? loadAllTimeErrorHistory(
              asAnalyticsRecord(snapshot),
              (range) =>
                getAnalyticsSummary(
                  "logs",
                  accessToken,
                  range,
                  controller.signal,
                ),
              controller.signal,
            )
          : loadDailyHistory(
              section,
              dates,
              (date) =>
                getAnalyticsSummary(
                  section,
                  accessToken,
                  section === "flows"
                    ? { start_date: date, end_date: date }
                    : { date },
                  controller.signal,
                ),
              controller.signal,
            ),
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
  }, [
    section,
    accessToken,
    datesKey,
    requestKey,
    enabled,
    allTimeErrors,
    snapshot,
  ]);
  const current =
    result?.key === requestKey &&
    result.snapshot === snapshot &&
    result.token === accessToken;
  return {
    points: hasReported ? reported : enabled && current ? result!.points : [],
    loading: enabled && !current,
    failed: enabled && current && result!.failed,
    retry: () => setRevision((value) => value + 1),
  };
}
