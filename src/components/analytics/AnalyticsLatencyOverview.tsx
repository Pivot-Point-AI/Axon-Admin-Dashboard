"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { AudioIcon, BoltIcon, TimeIcon } from "@/icons";
import AnalyticsDuration from "./AnalyticsDuration";
import AnalyticsLatencyCard from "./AnalyticsLatencyCard";
import { latencyData } from "./analyticsLatencyData";

interface AnalyticsLatencyOverviewProps {
  fields: string[];
  data: Record<string, unknown>;
}

const stageIcons = {
  end_to_end_latency_ms: TimeIcon,
  stt_transcription_latency_ms: AudioIcon,
  llm_generation_latency_ms: BoltIcon,
};

export default function AnalyticsLatencyOverview({
  fields,
  data,
}: AnalyticsLatencyOverviewProps) {
  const t = useTranslations("analytics.latency");
  const [selected, setSelected] = useState(fields[0]);
  const selectedField = fields.includes(selected) ? selected : fields[0];
  const tabsRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const navigate = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const rtl = event.currentTarget.ownerDocument.documentElement.dir === "rtl";
    const step =
      event.key === "ArrowRight"
        ? rtl
          ? -1
          : 1
        : event.key === "ArrowLeft"
          ? rtl
            ? 1
            : -1
          : 0;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? fields.length - 1
          : step
            ? (index + step + fields.length) % fields.length
            : null;
    if (next === null) return;
    event.preventDefault();
    setSelected(fields[next]);
    tabsRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  };
  return (
    <ComponentCard
      title={t("overviewTitle")}
      description={t("overviewDescription")}
      className="overflow-hidden p-0 sm:p-0 [&>div:first-child]:mb-0 [&>div:first-child]:px-5 [&>div:first-child]:pt-5"
    >
      <div
        ref={tabsRef}
        role="tablist"
        aria-label={t("stageNavigation")}
        className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3"
      >
        {fields.map((field, index) => {
          const timing = latencyData(data[field]);
          const average =
            timing.average ??
            timing.percentiles.find((row) => row.percentile === 50)?.value;
          const active = field === selectedField;
          const Icon = stageIcons[field as keyof typeof stageIcons] ?? TimeIcon;
          return (
            <button
              key={field}
              type="button"
              role="tab"
              id={`${id}-${field}-tab`}
              aria-selected={active}
              aria-controls={`${id}-${field}-panel`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(field)}
              onKeyDown={(event) => navigate(event, index)}
              className={`relative flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-lg border p-4 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 ${active ? "border-brand-500 bg-brand-25 ring-1 ring-brand-500 dark:border-brand-400 dark:bg-brand-500/10 dark:ring-brand-400" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-800/50"}`}
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-theme-xs font-semibold text-gray-700 dark:text-gray-300">
                  <Icon
                    aria-hidden="true"
                    className={`size-4 shrink-0 ${active ? "text-brand-600 dark:text-brand-300" : "text-gray-400 dark:text-gray-500"}`}
                  />
                  {t(`titles.${field}`)}
                </span>
                <span className="mt-1.5 block text-theme-xs text-gray-500 dark:text-gray-400">
                  {t(
                    timing.average !== null
                      ? "average"
                      : average !== undefined
                        ? "medianDuration"
                        : timing.hasData
                          ? "averageUnavailable"
                          : "timingUnavailable",
                  )}
                </span>
              </span>
              <span className="block shrink-0 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white/90">
                {average === undefined ? (
                  <span>—</span>
                ) : (
                  <AnalyticsDuration milliseconds={average} prominent />
                )}
              </span>
            </button>
          );
        })}
      </div>
      {fields.map((field) => (
        <div
          key={field}
          role="tabpanel"
          id={`${id}-${field}-panel`}
          aria-labelledby={`${id}-${field}-tab`}
          hidden={field !== selectedField}
          tabIndex={0}
          className="min-w-0 border-t border-gray-100 px-5 pt-5 pb-4 focus-visible:outline-2 focus-visible:outline-brand-400 dark:border-gray-800"
        >
          {field === selectedField && (
            <AnalyticsLatencyCard field={field} value={data[field]} />
          )}
        </div>
      ))}
    </ComponentCard>
  );
}
