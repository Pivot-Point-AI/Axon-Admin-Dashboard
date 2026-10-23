"use client";

import { createContext, useContext } from "react";
import type { AnalyticsFilters } from "@/lib/api/analytics";
import type { AnalyticsPeriod } from "./analyticsPeriods";

interface AnalyticsPeriodState {
  period: AnalyticsPeriod | undefined;
  filters: AnalyticsFilters;
  onChange: (period: AnalyticsPeriod) => void;
  onCustomChange?: (start: string, end: string) => void;
}

export const AnalyticsPeriodContext =
  createContext<AnalyticsPeriodState | null>(null);

export function useAnalyticsPeriod() {
  return useContext(AnalyticsPeriodContext);
}
