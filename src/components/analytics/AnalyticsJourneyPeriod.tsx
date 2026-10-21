"use client";

import { useTranslations } from "next-intl";
import { ChevronDownIcon } from "@/icons";

export type JourneyPeriod =
  "allTime" | "last7Days" | "last14Days" | "last21Days" | "last30Days";

interface AnalyticsJourneyPeriodProps {
  value?: JourneyPeriod;
  onChange?: (period: JourneyPeriod) => void;
}

export default function AnalyticsJourneyPeriod({
  value = "allTime",
  onChange,
}: AnalyticsJourneyPeriodProps) {
  const t = useTranslations("analytics.design");
  if (!onChange) {
    return (
      <span className="inline-flex h-8 shrink-0 items-center rounded-lg border border-brand-100/80 bg-white px-3 text-theme-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        {t(value)}
      </span>
    );
  }
  const options: JourneyPeriod[] = [
    "last21Days",
    "last30Days",
    "last14Days",
    "last7Days",
    "allTime",
  ];
  return (
    <div className="relative inline-flex shrink-0 items-center">
      <select
        aria-label={t("reportingPeriod")}
        value={value}
        onChange={(event) => onChange(event.target.value as JourneyPeriod)}
        className="h-8 appearance-none rounded-lg border border-brand-100/80 bg-white ps-3 pe-7 text-theme-xs font-medium text-gray-600 outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus-visible:ring-brand-500/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {t(option)}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute end-2 size-3.5 text-gray-400 dark:text-gray-500"
      />
    </div>
  );
}
