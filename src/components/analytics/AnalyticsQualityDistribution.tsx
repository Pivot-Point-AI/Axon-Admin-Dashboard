"use client";

import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { ChartBarsIcon, PieChartIcon } from "@/icons";
import AnalyticsDataTable from "./AnalyticsDataTable";
import AnalyticsDetails from "./AnalyticsDetails";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsRing from "./AnalyticsRing";
import {
  qualityColor,
  qualityDistribution,
  qualityKey,
} from "./analyticsQualityData";

interface AnalyticsQualityDistributionProps {
  field: "fallback_reasons" | "intent_distribution";
  value: unknown;
}

export default function AnalyticsQualityDistribution({
  field,
  value,
}: AnalyticsQualityDistributionProps) {
  const t = useTranslations("analytics.quality");
  const format = useFormatter();
  const { rows, total } = qualityDistribution(field, value);
  const intents = field === "intent_distribution";
  const color = (key: string, index: number) => qualityColor(field, key, index);
  const label = (key: string) => {
    const translation = `labels.${qualityKey(key)}`;
    return t.has(translation) ? t(translation) : key.replaceAll("_", " ");
  };
  return (
    <ComponentCard
      compact
      title={t(intents ? "intentTitle" : "fallbackTitle")}
      description={t(intents ? "intentDescription" : "fallbackDescription")}
      icon={intents ? <ChartBarsIcon /> : <PieChartIcon />}
      className="flex h-full flex-col"
    >
      {!rows.length ? (
        <AnalyticsEmptyState />
      ) : (
        <>
          <div
            className={`flex flex-1 flex-col items-center justify-center gap-5 py-2 sm:flex-row ${intents ? "sm:gap-10" : ""}`}
          >
            <AnalyticsRing
              rows={rows}
              total={total}
              label={t("total")}
              color={color}
              size={intents ? "md" : "lg"}
            />
            <dl className="w-full min-w-0 flex-1 space-y-4">
              {rows.map((row, index) => (
                <div
                  key={row.key}
                  className="flex items-center gap-3 text-theme-xs"
                >
                  <dt
                    className={`flex min-w-0 items-center gap-2 text-gray-600 dark:text-gray-300 ${intents ? "w-28 shrink-0 sm:w-36" : "flex-1"}`}
                  >
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: `var(--color-${color(row.key, index)})`,
                      }}
                    />
                    <span className="break-words">{label(row.key)}</span>
                  </dt>
                  {intents && (
                    <div
                      aria-hidden="true"
                      className="hidden h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100 sm:block dark:bg-gray-800"
                    >
                      <div
                        className="bg-linear-to-e h-full rounded-full from-white/15 to-transparent dark:from-white/10"
                        style={{
                          width: `${total > 0 ? (row.count / total) * 100 : 0}%`,
                          backgroundColor: `var(--color-${color(row.key, index)})`,
                        }}
                      />
                    </div>
                  )}
                  <dd
                    className={`flex shrink-0 items-center gap-3 tabular-nums ${intents ? "ms-auto" : ""}`}
                  >
                    <span className="min-w-4 text-end font-semibold text-gray-950 dark:text-gray-100">
                      {format.number(row.count)}
                    </span>
                    <span className="w-11 text-end text-gray-500 dark:text-gray-400">
                      {format.number(total > 0 ? row.count / total : 0, {
                        style: "percent",
                        maximumFractionDigits: 1,
                      })}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <AnalyticsDetails>
            <AnalyticsDataTable field={field} value={value} embedded />
          </AnalyticsDetails>
        </>
      )}
    </ComponentCard>
  );
}
