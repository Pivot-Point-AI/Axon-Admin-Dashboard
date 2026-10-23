"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  getAnalyticsSummary,
  type AnalyticsFilters,
  type AnalyticsSection,
} from "@/lib/api/analytics";
import {
  AnalyticsPeriodContext,
  useAnalyticsPeriod,
} from "./AnalyticsPeriodContext";
import {
  customPeriodFilters,
  periodFilters,
  selectedPeriod,
} from "./analyticsPeriods";
import { analyticsSummaryData } from "./analyticsSummaryData";

interface AnalyticsCardScopeProps {
  section: AnalyticsSection;
  data: Record<string, unknown>;
  children: (data: Record<string, unknown>) => ReactNode;
}

// Gives one card its own period. Until the card's filter is changed it follows
// the page-wide filter; once changed it fetches its own data and ignores other
// cards. A new page-wide selection clears every card's override.
export default function AnalyticsCardScope({
  section,
  data,
  children,
}: AnalyticsCardScopeProps) {
  const parent = useAnalyticsPeriod();
  const { accessToken } = useAdminAuth();
  const parentKey = JSON.stringify(parent?.filters ?? {});
  const [state, setState] = useState<{
    key: string;
    filters: AnalyticsFilters | null;
  }>({ key: parentKey, filters: null });
  if (state.key !== parentKey) setState({ key: parentKey, filters: null });
  const override = state.key === parentKey ? state.filters : null;
  const overrideKey = override ? JSON.stringify(override) : "";
  const [fetched, setFetched] = useState<{
    key: string;
    data: Record<string, unknown>;
  } | null>(null);

  useEffect(() => {
    if (!overrideKey || !accessToken) return;
    const controller = new AbortController();
    const filters: AnalyticsFilters = JSON.parse(overrideKey);
    getAnalyticsSummary(section, accessToken, filters, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted)
          setFetched({
            key: overrideKey,
            data: analyticsSummaryData(section, result),
          });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [section, accessToken, overrideKey]);

  if (!parent) return <>{children(data)}</>;
  const dated = Boolean(parent.filters.date);
  const filters = override ?? parent.filters;
  const period = override
    ? dated
      ? override.date === "today" || override.date === "yesterday"
        ? override.date
        : undefined
      : selectedPeriod(override)
    : parent.period;
  // While a newly chosen period loads, keep showing the card's previous data
  // rather than flashing the page's period (which would redraw the chart twice).
  const cardData = override ? (fetched?.data ?? data) : data;
  return (
    <AnalyticsPeriodContext.Provider
      value={{
        period,
        filters,
        onChange: (next) =>
          setState({
            key: parentKey,
            filters: dated ? { date: next } : periodFilters(next),
          }),
        onCustomChange: (start, end) =>
          setState({
            key: parentKey,
            filters: dated ? { date: start } : customPeriodFilters(start, end),
          }),
      }}
    >
      {children(cardData)}
    </AnalyticsPeriodContext.Provider>
  );
}
