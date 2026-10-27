"use client";

import { valueInfo } from "./analyticsTrends";
import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { ChartBarsIcon, PieChartIcon } from "@/icons";
import AnalyticsCardActions from "./AnalyticsCardActions";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import AnalyticsRing from "./AnalyticsRing";
import AnalyticsViewAll from "./AnalyticsViewAll";
import {
  qualityColor,
  confidenceLevel,
  qualityDistribution,
  qualityKey,
} from "./analyticsQualityData";

interface AnalyticsQualityPieProps {
  field: "intent_confidence_buckets" | "intent_distribution";
  value: unknown;
}

const visibleLimit = 5;
const isOther = (key: string) => ["other", "others"].includes(qualityKey(key));

export default function AnalyticsQualityPie({
  field,
  value,
}: AnalyticsQualityPieProps) {
  const t = useTranslations("analytics.quality");
  const tInfo = useTranslations("analytics.design.info");
  const format = useFormatter();
  const confidence = field === "intent_confidence_buckets";
  const { rows: all, total } = qualityDistribution(field, value);
  const ranked = confidence ? all : [...all].sort((a, b) => b.count - a.count);
  const named = ranked.filter((row) => !isOther(row.key));
  const remainder = ranked
    .filter((row) => isOther(row.key))
    .concat(confidence ? [] : named.slice(visibleLimit))
    .reduce((sum, row) => sum + row.count, 0);
  const rows = [
    ...(confidence ? named : named.slice(0, visibleLimit)),
    ...(remainder > 0
      ? [{ key: "others", count: remainder, percentage: null }]
      : []),
  ];
  const color = (key: string, index: number) => qualityColor(field, key, index);
  const label = (key: string) => {
    const translation = `${confidence ? "confidence" : "labels"}.${confidence ? confidenceLevel(key) : qualityKey(key)}`;
    return (
      t.has(translation) ? t(translation) : key.replaceAll("_", " ")
    ).replaceAll("\n", " ");
  };
  const share = (count: number) =>
    format.number(total > 0 ? count / total : 0, {
      style: "percent",
      maximumFractionDigits: 1,
    });
  const pie = (list: typeof rows) => (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-2 sm:flex-row sm:gap-8">
      <AnalyticsRing
        rows={list}
        total={total}
        label={t("total")}
        color={color}
        nameOf={label}
        size="lg"
      />
      <dl className="w-full min-w-0 flex-1 space-y-3.5">
        {list.map((row, index) => (
          <div key={row.key} className="flex items-center gap-3 text-theme-xs">
            <dt className="flex min-w-0 flex-1 items-center gap-2 text-gray-600 dark:text-gray-300">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: `var(--color-${color(row.key, index)})`,
                }}
              />
              <span className="break-words">{label(row.key)}</span>
            </dt>
            <dd className="flex shrink-0 items-center gap-3 tabular-nums">
              <span className="min-w-4 text-end font-semibold text-gray-950 dark:text-gray-100">
                {format.number(row.count)}
              </span>
              <span className="w-11 text-end text-gray-500 dark:text-gray-400">
                {share(row.count)}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );

  const title = t(confidence ? "confidenceTitle" : "intentTitle");
  const entries = ranked.map((row, index) => ({
    key: row.key,
    label: label(row.key),
    color: color(row.key, index),
    values: [format.number(row.count), share(row.count)],
    bar: total > 0 ? row.count / total : 0,
  }));
  return (
    <ComponentCard
      compact
      title={title}
      info={valueInfo(value) ?? tInfo(confidence ? "confidence" : "intent")}
      description={t(
        confidence ? "confidenceDescription" : "intentDescription",
      )}
      icon={confidence ? <PieChartIcon /> : <ChartBarsIcon />}
      actions={
        <AnalyticsCardActions>
          <AnalyticsViewAll
            title={title}
            description={t(
              confidence ? "confidenceDescription" : "intentDescription",
            )}
            icon={confidence ? <PieChartIcon /> : <ChartBarsIcon />}
            columns={[t("category"), t("count"), t("share")]}
            entries={entries}
          >
            {all.length ? (
              <div className="flex justify-center py-4">
                <AnalyticsRing
                  rows={ranked}
                  total={total}
                  label={t("total")}
                  color={color}
                  nameOf={label}
                  size="xl"
                />
              </div>
            ) : (
              <AnalyticsEmptyState />
            )}
          </AnalyticsViewAll>
          <AnalyticsJourneyPeriod />
        </AnalyticsCardActions>
      }
      className="flex h-full flex-col"
    >
      {!rows.length ? <AnalyticsEmptyState /> : pie(rows)}
    </ComponentCard>
  );
}
