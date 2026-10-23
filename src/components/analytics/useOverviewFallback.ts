"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getDashboardOverview } from "@/lib/api/dashboardAnalytics";
import { useAnalyticsPeriod } from "./AnalyticsPeriodContext";

// The Dashboard's overview carries comparison badges (for example "vs today's
// peak") that the audience summary does not. Load it for the same period so the
// Analytics KPI cards can show the same comparisons as the Dashboard.
export default function useOverviewFallback(enabled: boolean) {
  const reporting = useAnalyticsPeriod();
  const { accessToken } = useAdminAuth();
  const key = JSON.stringify(reporting?.filters ?? {});
  const [loaded, setLoaded] = useState<{ key: string; data: unknown } | null>(
    null,
  );
  useEffect(() => {
    if (!enabled || !accessToken) return;
    const controller = new AbortController();
    getDashboardOverview(accessToken, controller.signal, JSON.parse(key))
      .then((data) => {
        if (!controller.signal.aborted) setLoaded({ key, data });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [enabled, accessToken, key]);
  return loaded?.key === key ? loaded.data : null;
}
