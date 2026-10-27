"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button/Button";
import AnalyticsHistoryState from "./AnalyticsHistoryState";
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
  const t = useTranslations("analytics");
  const { accessToken } = useAdminAuth();
  const parentKey = JSON.stringify(parent?.filters ?? {});
  const [state, setState] = useState<{
    key: string;
    filters: AnalyticsFilters | null;
  }>({ key: parentKey, filters: null });
  if (state.key !== parentKey) setState({ key: parentKey, filters: null });
  const override = state.key === parentKey ? state.filters : null;
  const overrideKey = override ? JSON.stringify(override) : "";
  const requestKey = JSON.stringify([
    section,
    parentKey,
    overrideKey,
    accessToken,
  ]);
  const [revision, setRevision] = useState(0);
  const [fetched, setFetched] = useState<{
    key: string;
    data: Record<string, unknown> | null;
    failed: boolean;
  } | null>(null);

  useEffect(() => {
    if (!overrideKey || !accessToken) return;
    const controller = new AbortController();
    const filters: AnalyticsFilters = JSON.parse(overrideKey);
    getAnalyticsSummary(section, accessToken, filters, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted)
          setFetched({
            key: requestKey,
            data: analyticsSummaryData(section, result),
            failed: false,
          });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setFetched({ key: requestKey, data: null, failed: true });
      });
    return () => controller.abort();
  }, [section, accessToken, overrideKey, requestKey, revision]);

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
  const current = fetched?.key === requestKey ? fetched : null;
  const cardData = override ? current?.data : data;
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
      {cardData ? (
        children(cardData)
      ) : (
        <div className="space-y-3" aria-busy={!current?.failed}>
          <AnalyticsHistoryState
            loading={!current}
            failed={current?.failed ?? false}
          />
          {current?.failed && (
            <Button
              size="sm"
              onClick={() => {
                setFetched(null);
                setRevision((value) => value + 1);
              }}
            >
              {t("retry")}
            </Button>
          )}
        </div>
      )}
    </AnalyticsPeriodContext.Provider>
  );
}
