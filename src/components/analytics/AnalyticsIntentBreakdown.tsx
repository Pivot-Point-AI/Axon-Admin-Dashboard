"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { ChartBarsIcon } from "@/icons";
import AnalyticsCardActions from "./AnalyticsCardActions";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import AnalyticsRose from "./AnalyticsRose";
import AnalyticsCategoryLine from "./AnalyticsCategoryLine";
import AnalyticsRing from "./AnalyticsRing";
import AnalyticsViewAll from "./AnalyticsViewAll";
import { analyticsNumber, analyticsTableRows } from "./analyticsData";
import { titleCase, unitOf } from "./analyticsLabels";
import { blockDescription, blockInfo } from "./analyticsTrends";

interface AnalyticsIntentBreakdownProps {
  data: Record<string, unknown>;
  block: string;
  /** How the intents are drawn: a line over the intents, a pie of shares, or a polar area chart. */
  variant?: "line" | "pie" | "rose";
}

const colors = [
  "brand-500",
  "theme-purple-500",
  "blue-light-400",
  "success-500",
  "orange-400",
  "theme-pink-500",
  "warning-500",
];

const nameColumns = ["intent", "intent_name", "name", "key", "label", "type"];
const preferred = /avg|average|mean|total|duration|time|count|value/i;
const PREVIEW = 8;

const last = (column: string) => column.split(".").at(-1) ?? column;

/** A per-intent API block as ranked bars, with the full table one click away. */
export default function AnalyticsIntentBreakdown({
  data,
  block,
  variant = "line",
}: AnalyticsIntentBreakdownProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const [chosen, setChosen] = useState<string | null>(null);
  const source = data[block];
  const rows = analyticsTableRows(source);
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const nameColumn =
    nameColumns.find((column) =>
      rows.some((row) => typeof row[column] === "string"),
    ) ??
    columns.find((column) =>
      rows.some((row) => typeof row[column] === "string"),
    ) ??
    "name";
  const numeric = columns.filter(
    (column) =>
      column !== nameColumn &&
      rows.some((row) => analyticsNumber(row[column]) !== null) &&
      rows.every(
        (row) => row[column] == null || analyticsNumber(row[column]) !== null,
      ),
  );
  // Two columns with identical numbers are one metric under two names ("count"
  // and "tokens"): keep the more descriptive one.
  const generic = /^(count|value|total)$/;
  const signature = (column: string) =>
    rows.map((row) => analyticsNumber(row[column])).join("|");
  const metrics = numeric.filter(
    (column) =>
      !numeric.some(
        (other) =>
          other !== column &&
          signature(other) === signature(column) &&
          (generic.test(last(column)) && !generic.test(last(other))
            ? true
            : generic.test(last(other)) && !generic.test(last(column))
              ? false
              : numeric.indexOf(other) < numeric.indexOf(column)),
      ),
  );
  const active =
    chosen && metrics.includes(chosen)
      ? chosen
      : (metrics.find((column) => preferred.test(last(column))) ?? metrics[0]);
  const name = (row: Record<string, unknown>, index: number) =>
    titleCase(String(row[nameColumn] ?? `#${index + 1}`));
  const unitFor = (column: string) => unitOf({}, "", last(column)) ?? undefined;
  const number = (value: number) =>
    format.number(value, { maximumFractionDigits: 2 });

  const ranked = active
    ? rows
        .map((row, index) => ({
          key: `${index}`,
          label: name(row, index),
          count: analyticsNumber(row[active]) ?? 0,
        }))
        .sort((a, b) => b.count - a.count)
    : [];
  const title = t.has(`fields.${block}`)
    ? t(`fields.${block}`)
    : titleCase(block);
  const description = blockDescription(data, block) ?? undefined;
  // The side list follows the chart: the selected metric only, same order.
  const entries = ranked.map((row) => ({
    key: row.key,
    label: row.label,
    values: [number(row.count)],
    bar: ranked[0]?.count ? row.count / ranked[0].count : null,
  }));

  const names = new Map(ranked.map((row) => [row.key, row.label]));

  // One chart for the card and its full view; the full view shows every intent.
  // The card keeps its tabs to one row; the full view lists every metric.
  const TAB_LIMIT = 4;
  const body = (limit: number, tabLimit = metrics.length, large = false) =>
    !ranked.length || !active ? (
      <AnalyticsEmptyState />
    ) : (
      <div className="space-y-3">
        {metrics.length > 1 && (
          <div
            role="tablist"
            aria-label={title}
            className={
              large
                ? "flex flex-wrap gap-1"
                : "no-scrollbar flex gap-1 overflow-x-auto"
            }
          >
            {(() => {
              const shown = metrics.slice(0, tabLimit);
              return !active || shown.includes(active)
                ? shown
                : [...shown.slice(0, tabLimit - 1), active];
            })().map((column) => (
              <button
                key={column}
                type="button"
                role="tab"
                aria-selected={column === active}
                onClick={() => setChosen(column)}
                className={`shrink-0 rounded-lg px-2 py-1 text-theme-xs font-medium whitespace-nowrap transition-colors ${
                  column === active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                }`}
              >
                {titleCase(last(column)).replace(/ Per /g, " / ")}
              </button>
            ))}
          </div>
        )}
        {variant === "rose" ? (
          <AnalyticsRose
            large={large}
            items={ranked.slice(0, Math.min(limit, 10)).map((row) => ({
              key: row.key,
              label: row.label,
              value: row.count,
            }))}
            total={ranked.reduce((sum, row) => sum + row.count, 0)}
          />
        ) : variant === "pie" ? (
          (() => {
            const shown = ranked.slice(0, Math.min(limit, 6));
            const rest = ranked
              .slice(shown.length)
              .reduce((sum, row) => sum + row.count, 0);
            const parts =
              rest > 0
                ? [...shown, { key: "others", label: "", count: rest }]
                : shown;
            const total = parts.reduce((sum, row) => sum + row.count, 0);
            const nameOf = (key: string) =>
              key === "others" ? t("design.others") : (names.get(key) ?? key);
            return (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
                <AnalyticsRing
                  rows={parts}
                  total={total}
                  label={titleCase(last(active))}
                  color={(key, index) =>
                    key === "others"
                      ? "gray-400"
                      : colors[index % colors.length]
                  }
                  size="xl"
                  nameOf={nameOf}
                />
                <dl className="w-full min-w-0 flex-1 space-y-3">
                  {parts.map((row, index) => (
                    <div
                      key={row.key}
                      className="flex items-center justify-between gap-3 text-theme-xs"
                    >
                      <dt className="flex min-w-0 items-center gap-2 text-gray-600 dark:text-gray-300">
                        <span
                          aria-hidden="true"
                          className="size-2.5 shrink-0 rounded-full"
                          style={{
                            background: `var(--color-${row.key === "others" ? "gray-400" : colors[index % colors.length]})`,
                          }}
                        />
                        <span className="break-words">{nameOf(row.key)}</span>
                      </dt>
                      <dd className="flex shrink-0 items-center gap-3 tabular-nums">
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                          {number(row.count)}
                        </span>
                        <span className="w-12 text-end text-gray-500 dark:text-gray-400">
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
            );
          })()
        ) : (
          <AnalyticsCategoryLine
            points={ranked.slice(0, limit).map((row) => ({
              key: row.key,
              label: row.label,
              value: row.count,
            }))}
          />
        )}
        {variant === "line" && unitFor(active) && (
          <p className="text-end text-theme-xs text-gray-400 dark:text-gray-500">
            {unitFor(active)}
          </p>
        )}
      </div>
    );

  return (
    <ComponentCard
      compact
      title={title}
      description={description}
      info={blockInfo(data, block)}
      icon={<ChartBarsIcon />}
      actions={
        <AnalyticsCardActions>
          {entries.length > 0 && (
            <AnalyticsViewAll
              title={title}
              description={description}
              icon={<ChartBarsIcon />}
              columns={[
                t("design.categoryColumn"),
                active ? titleCase(last(active)) : t("design.value"),
              ]}
              entries={entries}
            >
              {body(ranked.length, metrics.length, true)}
            </AnalyticsViewAll>
          )}
          <AnalyticsJourneyPeriod />
        </AnalyticsCardActions>
      }
      className="h-full"
    >
      {body(PREVIEW, TAB_LIMIT)}
    </ComponentCard>
  );
}
