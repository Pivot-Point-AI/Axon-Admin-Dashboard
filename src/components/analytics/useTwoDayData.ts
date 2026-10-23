"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  getAnalyticsSummary,
  type AnalyticsSection,
} from "@/lib/api/analytics";
import { useAnalyticsPeriod } from "./AnalyticsPeriodContext";
import { periodFilters } from "./analyticsPeriods";
import { analyticsSummaryData } from "./analyticsSummaryData";

// Picking Today or Yesterday asks the server for that single day, so its daily
// series holds one point. Charts that show a trend load yesterday and today
// together instead, and use `data` as is for every other period.
export default function useTwoDayData(
  section: AnalyticsSection,
  data: Record<string, unknown>,
) {
  const reporting = useAnalyticsPeriod();
  const { accessToken } = useAdminAuth();
  const twoDays =
    reporting?.period === "today" || reporting?.period === "yesterday";
  const key = twoDays
    ? `${periodFilters("yesterday").start_date}:${periodFilters("today").end_date}`
    : "";
  const [loaded, setLoaded] = useState<{
    key: string;
    data: Record<string, unknown>;
  } | null>(null);
  useEffect(() => {
    if (!key || !accessToken) return;
    const controller = new AbortController();
    const [start_date, end_date] = key.split(":");
    getAnalyticsSummary(
      section,
      accessToken,
      { start_date, end_date },
      controller.signal,
    )
      .then((result) => {
        if (!controller.signal.aborted)
          setLoaded({ key, data: analyticsSummaryData(section, result) });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [section, accessToken, key]);
  return key && loaded?.key === key ? loaded.data : data;
}
