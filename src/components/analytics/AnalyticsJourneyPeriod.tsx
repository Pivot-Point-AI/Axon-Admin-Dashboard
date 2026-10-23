"use client";

import AnalyticsPeriodSelect from "./AnalyticsPeriodSelect";
import { useAnalyticsPeriod } from "./AnalyticsPeriodContext";
import type { AnalyticsPeriod } from "./analyticsPeriods";
export type JourneyPeriod = AnalyticsPeriod;

interface AnalyticsJourneyPeriodProps {
  value?: JourneyPeriod | "customRange";
  onChange?: (period: JourneyPeriod) => void;
  onCustomChange?: (start: string, end: string) => void;
  start?: string;
  end?: string;
}

export default function AnalyticsJourneyPeriod({
  value = "last7Days",
  onChange,
  onCustomChange,
  start,
  end,
}: AnalyticsJourneyPeriodProps) {
  const reporting = useAnalyticsPeriod();
  // Without its own handler the control drives the page-wide filter.
  const change = onChange ?? reporting?.onChange;
  if (!change) return null;
  const dated = Boolean(reporting?.filters.date);
  const current = onChange ? value : (reporting?.period ?? "customRange");
  return (
    <AnalyticsPeriodSelect
      value={current === "customRange" ? undefined : current}
      options={dated ? ["today", "yesterday"] : undefined}
      customMode={dated ? "day" : "range"}
      onChange={change}
      start={
        start ??
        (dated ? reporting?.filters.date : reporting?.filters.start_date)
      }
      end={
        end ?? (dated ? reporting?.filters.date : reporting?.filters.end_date)
      }
      onCustomChange={onCustomChange ?? reporting?.onCustomChange}
    />
  );
}
