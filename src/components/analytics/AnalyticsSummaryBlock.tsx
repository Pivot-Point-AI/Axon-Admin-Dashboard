"use client";

import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { ChartBarsIcon } from "@/icons";
import AnalyticsCardActions from "./AnalyticsCardActions";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsGauge from "./AnalyticsGauge";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import AnalyticsGroupedColumns from "./AnalyticsGroupedColumns";
import AnalyticsViewAll from "./AnalyticsViewAll";
import { analyticsNumber, asAnalyticsRecord } from "./analyticsData";
import { titleCase, unitOf } from "./analyticsLabels";
import { MetricTrendBadge } from "./MetricTrend";
import {
  blockDescription,
  blockInfo,
  kpiEntries,
  metricDetails,
  readMetricTrend,
  trendSentiment,
  type MetricTrendData,
} from "./analyticsTrends";

interface AnalyticsSummaryBlockProps {
  data: Record<string, unknown>;
  block: string;
  /** Lead with the block's first figure, large, with its trend. */
  headline?: boolean;
  /** Draw a lone percentage as a half-circle gauge instead of a bar. */
  gauge?: boolean;
  /** Show the percentage bars and the Key figures list besides the charts. */
  extras?: boolean;
  /** Add up to two figures that changed from the previous period. */
  changes?: boolean;
  /** Keep only the figures this accepts; the rest are left out of the card. */
  filter?: (row: { key: string; label: string }) => boolean;
}

interface SummaryRow {
  key: string;
  label: string;
  value: number;
  unit: string | null;
  trend: MetricTrendData | null;
  description: string | null;
}

type Kind = "count" | "avg" | "time";

// Text the block carries about itself rather than as a figure.
const meta = new Set([
  "title",
  "label",
  "name",
  "description",
  "stat_info",
  "info",
  "display",
  "note",
]);

const colors = [
  "brand-500",
  "blue-light-400",
  "theme-purple-500",
  "success-500",
  "orange-400",
];

// Figures within this factor of each other share one chart axis.
const SCALE = 100;

// Only a pass/fail style share has a "bad" remainder; others are just a split.
const verdict = /sla|complian|success|uptime|pass/i;

// One look for every figure row, whichever list it sits in.
const rowStyle = "flex items-center justify-between gap-x-3 gap-y-1 py-2";
const labelStyle =
  "min-w-0 text-theme-xs break-words text-gray-600 dark:text-gray-300";
const valueStyle =
  "text-theme-xs font-semibold whitespace-nowrap text-gray-950 tabular-nums dark:text-white";

/** "vs last week" for a trend, from the API's own comparison text. */
function compareText(trend: MetricTrendData | null) {
  if (!trend) return null;
  const raw =
    trend.comparison ??
    trend.display
      ?.replace(/^[\s↑↓▲▼↗↘—–]+/, "")
      .replace(/^[+-]?\d[\d.,]*%?\s*/, "");
  if (!raw?.trim()) return null;
  return /^vs\.?\s/i.test(raw.trim()) ? raw.trim() : `vs ${raw.trim()}`;
}

/** A change as plain colored text: a small arrow and the percentage. */
function TrendDelta({
  trend,
  lowerIsBetter,
}: {
  trend: MetricTrendData;
  lowerIsBetter: boolean;
}) {
  const format = useFormatter();
  if (trend.direction === null) return null;
  const sentiment = trendSentiment(trend, lowerIsBetter);
  const arrow =
    trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "–";
  const compared = compareText(trend);
  return (
    <span className="flex flex-col items-center leading-4">
      <span
        className={`inline-flex items-center gap-0.5 text-[0.6875rem] font-semibold whitespace-nowrap tabular-nums ${
          trend.direction === "flat"
            ? "text-gray-400 dark:text-gray-500"
            : sentiment === "positive"
              ? "text-success-600 dark:text-success-400"
              : "text-error-600 dark:text-error-400"
        }`}
      >
        <span aria-hidden="true" className="text-[0.5rem]">
          {arrow}
        </span>
        {trend.change !== null
          ? `${format.number(Math.abs(trend.change), { maximumFractionDigits: 1 })}%`
          : null}
      </span>
      {compared && (
        <span className="text-[0.625rem] whitespace-nowrap text-gray-400 dark:text-gray-500">
          {compared}
        </span>
      )}
    </span>
  );
}

const textOf = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === "string" && !!value);

const numberOf = (record: Record<string, unknown>) =>
  analyticsNumber(
    record.value ?? record.current_value ?? record.count ?? record.avg,
  );

/** Every numeric figure of an API summary block, however it nests them. */
function summaryRows(data: Record<string, unknown>, block: string) {
  const rows: SummaryRow[] = [];
  for (const { key, record } of kpiEntries(data, block)) {
    if (meta.has(key)) continue;
    const label = titleCase(
      textOf(record.label, record.metric, record.title, record.name) ?? key,
    );
    const value = numberOf(record);
    if (value !== null) {
      rows.push({
        key,
        label,
        value,
        unit: unitOf(
          record,
          [label, record.description, record.formatted_value].join(" "),
          key,
        ),
        trend: readMetricTrend(record),
        description: metricDetails(record).description,
      });
      continue;
    }
    // A group of figures (for example percentiles): one row per member.
    for (const [childKey, child] of Object.entries(record)) {
      if (meta.has(childKey)) continue;
      const childRecord =
        typeof child === "number" ? { value: child } : asAnalyticsRecord(child);
      const childValue = numberOf(childRecord);
      if (childValue === null) continue;
      rows.push({
        key: `${key}.${childKey}`,
        label: titleCase(childKey),
        value: childValue,
        unit:
          unitOf(childRecord, label, childKey) ?? unitOf(record, label, key),
        trend: readMetricTrend(childRecord),
        description: null,
      });
    }
  }
  return rows;
}

const isShare = (row: SummaryRow) =>
  row.unit === "%" ||
  (/sla|complian|rate|pct|percent|share/i.test(`${row.key} ${row.label}`) &&
    row.value >= 0 &&
    row.value <= 100);

/** Averages, durations and plain counts are different things to compare. */
function kindOf(row: SummaryRow): Kind {
  if (
    row.unit === "s" ||
    row.unit === "ms" ||
    row.unit === "min" ||
    /latency|duration|time|playback|(^|\s)sec(s|onds)?(\s|$)/i.test(row.label)
  )
    return "time";
  if (/(^|\s)(avg|average|mean)(\s|$)|\/\s*(turn|flow)/i.test(row.label))
    return "avg";
  return "count";
}

/** Rows of one kind and unit, split wherever the scale jumps too far. */
function clusters(rows: SummaryRow[]) {
  const groups = new Map<string, SummaryRow[]>();
  for (const row of rows) {
    const id = `${kindOf(row)}|${row.unit ?? ""}`;
    groups.set(id, [...(groups.get(id) ?? []), row]);
  }
  const result: { kind: Kind; unit: string | null; rows: SummaryRow[] }[] = [];
  for (const [id, group] of groups) {
    const sorted = [...group].sort((a, b) => b.value - a.value);
    let current: SummaryRow[] = [];
    const flush = () => {
      if (current.length)
        result.push({
          kind: id.split("|")[0] as Kind,
          unit: current[0].unit,
          rows: current,
        });
      current = [];
    };
    for (const row of sorted) {
      if (
        current.length &&
        row.value > 0 &&
        current[0].value > row.value * SCALE
      )
        flush();
      current.push(row);
    }
    flush();
  }
  return result;
}

/** One API summary block: a headline, then small charts of comparable figures. */
export default function AnalyticsSummaryBlock({
  data,
  block,
  headline: showHeadline = false,
  gauge = true,
  extras = true,
  changes: showChanges = false,
  filter,
}: AnalyticsSummaryBlockProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const source = asAnalyticsRecord(data[block]);
  const rows = summaryRows(data, block).filter((row) =>
    filter ? filter(row) : true,
  );
  const title =
    textOf(source.title, source.label, source.name) ??
    (t.has(`fields.${block}`) ? t(`fields.${block}`) : titleCase(block));
  const description = blockDescription(data, block) ?? undefined;
  const number = (value: number) =>
    format.number(value, { maximumFractionDigits: 2 });
  const withUnit = (row: SummaryRow) =>
    `${number(row.value)}${row.unit ? ` ${row.unit}` : ""}`;

  const shares = rows.filter(isShare);
  const measures = rows.filter((row) => !isShare(row));
  // A chart needs at least two columns, one of them above zero. Every other
  // figure is listed under the charts, so nothing the API sends is dropped.
  const headline = showHeadline ? measures[0] : undefined;
  // Two figures the API compares with the previous period, those that moved first.
  const changes = (showChanges ? rows : [])
    .filter((row) => row.trend && row.trend.direction !== null)
    .sort(
      (a, b) =>
        Number(b.trend?.direction !== "flat") -
        Number(a.trend?.direction !== "flat"),
    )
    .slice(0, 2);
  const groups = clusters(showHeadline ? measures.slice(1) : measures);
  const charts = groups.filter(
    (group) => group.rows.length > 1 && group.rows.some((row) => row.value > 0),
  );
  const listed = groups
    .filter((group) => !charts.includes(group))
    .flatMap((group) => group.rows);

  const heading = "text-theme-xs font-semibold tracking-wide uppercase";
  const content = !rows.length ? (
    <AnalyticsEmptyState />
  ) : (
    <div className="flex flex-1 flex-col gap-6">
      {headline && (
        <div>
          <p className="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
            {headline.label}
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-title-sm font-bold text-gray-950 tabular-nums dark:text-white">
              {number(headline.value)}
            </span>
            {headline.unit && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {headline.unit}
              </span>
            )}
            <MetricTrendBadge trend={headline.trend} />
          </div>
        </div>
      )}
      {extras && gauge && shares.length === 1 && (
        <div className="flex flex-col items-center pb-5">
          <AnalyticsGauge
            rate={Math.min(1, Math.max(0, shares[0].value / 100))}
            caption={shares[0].label}
            good={verdict.test(shares[0].label) ? "success-500" : "brand-500"}
            bad={verdict.test(shares[0].label) ? "error-500" : "blue-light-300"}
          />
        </div>
      )}
      {extras && (shares.length > 1 || (!gauge && shares.length === 1)) && (
        <ul className="space-y-3.5">
          {shares.map((row) => (
            <li key={row.key}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {row.label}
                </span>
                <span className="font-bold text-gray-950 tabular-nums dark:text-white">
                  {number(row.value)}%
                </span>
              </div>
              <div
                role="meter"
                aria-label={row.label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={row.value}
                className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <div
                  className="h-full rounded-full bg-brand-500 transition-[width] duration-700"
                  style={{ width: `${Math.min(100, row.value)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      {charts.length > 0 && (
        <div
          className="grid gap-x-6 gap-y-8"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))",
          }}
        >
          {charts.map((group) => (
            <section
              key={`${group.kind}-${group.rows[0].key}`}
              className="min-w-0 space-y-2"
            >
              <h3 className={`${heading} text-gray-500 dark:text-gray-400`}>
                {t(`design.summaryKinds.${group.kind}`)}
                {group.unit ? ` (${group.unit})` : ""}
              </h3>
              <AnalyticsGroupedColumns
                rows={group.rows.map((row) => ({
                  key: row.key,
                  label: row.label,
                  values: { value: row.value },
                  note: row.trend ? (
                    <TrendDelta
                      trend={row.trend}
                      lowerIsBetter={/latency|time|fail|error|abandon|drop|slow/i.test(
                        row.label,
                      )}
                    />
                  ) : undefined,
                }))}
                series={[
                  {
                    key: "value",
                    label: group.unit ?? "",
                    token: "brand-500",
                  },
                ]}
                color={(_, index) => colors[index % colors.length]}
                legend={false}
                fractional
                axisSteps={4}
              />
            </section>
          ))}
        </div>
      )}
      <div className="mt-auto space-y-6">
        {changes.length > 0 && (
          <section className="space-y-2">
            <h3 className={`${heading} text-gray-500 dark:text-gray-400`}>
              {t("design.summaryKinds.changes")}
            </h3>
            <dl className="divide-y divide-gray-100 dark:divide-gray-800">
              {changes.map((row) => (
                <div key={row.key} className={rowStyle}>
                  <dt className={labelStyle}>{row.label}</dt>
                  <dd className="flex shrink-0 items-center gap-1.5">
                    <span className={valueStyle}>{withUnit(row)}</span>
                    <MetricTrendBadge trend={row.trend} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        {extras && listed.length > 0 && (
          <section className="space-y-2">
            <h3 className={`${heading} text-gray-500 dark:text-gray-400`}>
              {t("design.summaryKinds.figures")}
            </h3>
            <dl className="divide-y divide-gray-100 dark:divide-gray-800">
              {listed.map((row) => (
                <div key={row.key} className={rowStyle}>
                  <dt className={labelStyle}>{row.label}</dt>
                  <dd className="flex shrink-0 items-center gap-1.5">
                    <span className={valueStyle}>{withUnit(row)}</span>
                    <MetricTrendBadge trend={row.trend} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
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
          {rows.length > 0 && (
            <AnalyticsViewAll
              title={title}
              description={description}
              icon={<ChartBarsIcon />}
              columns={[t("design.categoryColumn"), t("design.value")]}
              entries={rows.map((row) => ({
                key: row.key,
                label: row.label,
                values: [withUnit(row)],
              }))}
            >
              {content}
            </AnalyticsViewAll>
          )}
          <AnalyticsJourneyPeriod />
        </AnalyticsCardActions>
      }
      className="flex h-full flex-col"
    >
      {content}
    </ComponentCard>
  );
}
