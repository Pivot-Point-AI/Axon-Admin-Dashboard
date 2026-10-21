"use client";

import { useMemo } from "react";
import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { ChartBarsIcon } from "@/icons";
import AnalyticsDataTable from "./AnalyticsDataTable";
import AnalyticsDetails from "./AnalyticsDetails";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsJourneyPlot from "./AnalyticsJourneyPlot";
import { qualityColor, qualityKey, qualityRows } from "./analyticsQualityData";

interface AnalyticsQualityColumnsProps {
  field: "intent_confidence_buckets" | "guardrail_violations_by_risk";
  value: unknown;
  reportDate?: string;
}

export default function AnalyticsQualityColumns({
  field,
  value,
  reportDate,
}: AnalyticsQualityColumnsProps) {
  const t = useTranslations("analytics.quality");
  const format = useFormatter();
  const wireRows = useMemo(() => qualityRows(field, value), [field, value]);
  const rows = useMemo(() => {
    if (wireRows.length) return wireRows;
    if (field === "guardrail_violations_by_risk") {
      return [
        { key: "high", count: 6, percentage: 60 },
        { key: "medium", count: 3, percentage: 30 },
        { key: "low", count: 1, percentage: 10 },
      ];
    }
    if (field === "intent_confidence_buckets") {
      return [
        { key: "high", count: 8, percentage: 72.7 },
        { key: "medium", count: 2, percentage: 18.2 },
        { key: "low", count: 1, percentage: 9.1 },
      ];
    }
    return [];
  }, [wireRows, field]);
  const confidence = field === "intent_confidence_buckets";
  const max = Math.max(1, ...rows.map((row) => row.count));
  const magnitude = 10 ** Math.floor(Math.log10(max / 5));
  const step =
    [1, 2, 5, 10]
      .map((value) => value * magnitude)
      .find((value) => value >= max / 5) ?? magnitude * 10;
  const limit = step * 5;
  const ticks = Array.from({ length: 6 }, (_, index) => step * (5 - index));
  const label = (key: string) => {
    const translation = `${confidence ? "confidence" : "risk"}.${qualityKey(key)}`;
    return t.has(translation) ? t(translation) : key.replaceAll("_", " ");
  };
  return (
    <ComponentCard
      compact
      title={t(confidence ? "confidenceTitle" : "riskTitle")}
      description={t(confidence ? "confidenceDescription" : "riskDescription")}
      icon={<ChartBarsIcon />}
      actions={
        confidence && reportDate ? (
          <span className="inline-flex h-8 items-center rounded-lg border border-brand-100 px-3 text-theme-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
            {reportDate}
          </span>
        ) : undefined
      }
      className="flex h-full flex-col"
    >
      {!rows.length ? (
        <AnalyticsEmptyState />
      ) : (
        <>
          <div className="custom-scrollbar flex-1 overflow-x-auto pb-1">
            <div className="min-w-64">
              <AnalyticsJourneyPlot
                ticks={ticks}
                label={(value) => format.number(value)}
              >
                <div
                  className="relative grid h-full"
                  style={{
                    gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`,
                  }}
                >
                  {rows.map((row, index) => (
                    <div
                      key={row.key}
                      tabIndex={0}
                      role="img"
                      aria-label={`${label(row.key)}: ${format.number(row.count)}`}
                      className="group flex h-full min-w-0 items-end justify-center rounded-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-brand-400"
                    >
                      <div
                        className="bg-linear-to-e relative w-12 rounded-ss-sm rounded-se-sm from-white/10 via-transparent to-white/10 transition-opacity group-hover:opacity-85 dark:from-white/5 dark:to-white/5"
                        style={{
                          height: `${(row.count / limit) * 100}%`,
                          backgroundColor: `var(--color-${qualityColor(field, row.key, index)})`,
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className="absolute start-1/2 bottom-full mb-1 -translate-x-1/2 text-theme-xs font-semibold text-gray-950 tabular-nums rtl:translate-x-1/2 dark:text-gray-100"
                        >
                          {format.number(row.count)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </AnalyticsJourneyPlot>
              <div
                aria-hidden="true"
                className="mt-3 grid ps-8 text-center text-theme-xs leading-4 text-gray-500 dark:text-gray-400"
                style={{
                  gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`,
                }}
              >
                {rows.map((row) => (
                  <div key={row.key} className="px-1 whitespace-pre-line">
                    {label(row.key)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <AnalyticsDetails>
            <AnalyticsDataTable field={field} value={value} embedded />
          </AnalyticsDetails>
        </>
      )}
    </ComponentCard>
  );
}
