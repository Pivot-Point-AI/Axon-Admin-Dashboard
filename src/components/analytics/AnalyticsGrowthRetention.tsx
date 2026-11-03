"use client";

import { useFormatter, useTranslations } from "next-intl";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import { useAnalyticsPeriod } from "./AnalyticsPeriodContext";
import ComponentCard from "@/components/common/ComponentCard";
import InfoTip from "@/components/common/InfoTip";
import { TableIcon } from "@/icons";
import { analyticsNumber, asAnalyticsRecord } from "./analyticsData";
import { metricGroups } from "./analyticsPresentation";
import MetricTrend from "./MetricTrend";
import AnalyticsValue from "./AnalyticsValue";
import { acquisitionIcons, acquisitionRows } from "./AnalyticsAcquisition";
import { audienceHealthIcons } from "./AnalyticsMetrics";
import {
  blockInfo,
  lowerMetricIsBetter,
  fieldDetails,
  metricDetails,
  readMetricTrend,
  metricTrend,
  type MetricTrendData,
  blockDescription,
} from "./analyticsTrends";

interface AnalyticsGrowthRetentionProps {
  data: Record<string, unknown>;
}

interface GrowthRow {
  key: string;
  label: string;
  value: React.ReactNode;
  trend: MetricTrendData | null;
  lowerIsBetter: boolean;
  description?: string | null;
  info?: string | null;
  Icon: (props: { className?: string }) => React.JSX.Element;
}

const humanize = (key: string) =>
  key.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const textOf = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === "string" && !!value);

/** Rows of one group as the response lists them, with their own wording. */
function listedRows(entries: unknown[]): Omit<GrowthRow, "Icon">[] {
  return entries.flatMap((entry, index) => {
    const record = asAnalyticsRecord(entry);
    const label = textOf(
      record.metric,
      record.label,
      record.title,
      record.name,
      record.key,
    );
    if (!label) return [];
    const raw = record.value ?? record.count ?? record.formatted_value;
    return [
      {
        key: `${label}-${index}`,
        label,
        value: typeof raw === "string" ? raw : (analyticsNumber(raw) ?? "—"),
        trend: readMetricTrend(record),
        lowerIsBetter: false,
        ...metricDetails(record),
      },
    ];
  });
}

/** Groups from the consolidated `user_growth_and_retention` block, if sent. */
function consolidatedGroups(
  block: unknown,
): { title: string; rows: Omit<GrowthRow, "Icon">[] }[] {
  const asGroup = (title: string, value: unknown) => {
    const record = asAnalyticsRecord(value);
    const entries = Array.isArray(value)
      ? value
      : Array.isArray(record.metrics)
        ? record.metrics
        : Array.isArray(record.rows)
          ? record.rows
          : null;
    const rows = entries ? listedRows(entries) : [];
    return rows.length
      ? [
          {
            title: textOf(record.title, record.label, record.name) ?? title,
            rows,
          },
        ]
      : [];
  };
  if (Array.isArray(block)) {
    const nested = block.flatMap((entry, index) =>
      asGroup(`#${index + 1}`, entry),
    );
    return nested.length ? nested : asGroup("", block);
  }
  const record = asAnalyticsRecord(block);
  if (Array.isArray(record.metrics)) return asGroup("", record);
  return Object.entries(record).flatMap(([key, value]) =>
    asGroup(humanize(key), value),
  );
}

const trendBlocks = [
  "audience_and_retention",
  "new_user_acquisition",
  "user_growth_and_retention",
  "top_kpis",
];

/** Audience & retention and new-user acquisition as one table, grouped. */
export default function AnalyticsGrowthRetention({
  data,
}: AnalyticsGrowthRetentionProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const reporting = useAnalyticsPeriod();

  const audienceFields =
    metricGroups.users?.find((group) => group.title === "audienceHealth")
      ?.fields ?? [];
  const consolidated = consolidatedGroups(data.user_growth_and_retention).map(
    (group) => ({
      title: group.title,
      rows: group.rows.map((row, index) => ({
        ...row,
        Icon: acquisitionIcons[index % acquisitionIcons.length],
      })),
    }),
  );
  const groups: { title: string; rows: GrowthRow[] }[] = consolidated.length
    ? consolidated
    : [
        {
          title: t("design.audienceHealth"),
          rows: audienceFields.map((field, index) => ({
            key: field,
            label: t(`fields.${field}`),
            value: (
              <AnalyticsValue
                value={analyticsNumber(data[field]) ?? 0}
                field={field}
              />
            ),
            trend: metricTrend(data, field, trendBlocks),
            lowerIsBetter: lowerMetricIsBetter(field),
            ...fieldDetails(data, field, trendBlocks),
            Icon:
              audienceHealthIcons[field]?.icon ??
              acquisitionIcons[index % acquisitionIcons.length],
          })),
        },
        {
          title: t("design.newUsers"),
          rows: acquisitionRows(data).map((row, index) => ({
            key: row.key,
            label: row.label,
            value:
              typeof row.value === "number"
                ? format.number(row.value, { maximumFractionDigits: 2 })
                : (row.value ?? "—"),
            trend: row.trend,
            lowerIsBetter: false,
            description: row.description,
            info: row.info,
            Icon: acquisitionIcons[index % acquisitionIcons.length],
          })),
        },
      ];

  // A heading that only repeats the card's own title adds nothing.
  const cardTitle = t("design.growthRetention");
  const showHeader = (title: string) =>
    groups.length > 1 &&
    title.trim() !== "" &&
    title.trim().toLowerCase() !== cardTitle.toLowerCase();

  return (
    <ComponentCard
      title={t("design.growthRetention")}
      description={
        blockDescription(data, "user_growth_and_retention") ??
        t("design.growthRetentionDescription")
      }
      icon={<TableIcon />}
      actions={
        reporting ? (
          <AnalyticsJourneyPeriod
            value={reporting.period ?? "customRange"}
            onChange={reporting.onChange}
          />
        ) : undefined
      }
      info={
        blockInfo(data, "user_growth_and_retention") ??
        blockInfo(data, "audience_and_retention")
      }
    >
      <div className="overflow-x-auto border-t border-gray-200 dark:border-gray-700">
        <table className="w-full min-w-96 text-start">
          <thead className="sr-only">
            <tr>
              <th scope="col">{t("design.metric")}</th>
              <th scope="col">{t("design.value")}</th>
              <th scope="col">{t("design.change")}</th>
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody
              key={group.title}
              className="divide-y divide-gray-100 dark:divide-gray-800"
            >
              {showHeader(group.title) && (
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={3}
                    className="bg-gray-50 px-3 py-2 text-start text-theme-xs font-semibold tracking-wide text-gray-500 uppercase dark:bg-white/3 dark:text-gray-400"
                  >
                    {group.title}
                  </th>
                </tr>
              )}
              {group.rows.map(
                ({
                  key,
                  label,
                  value,
                  trend,
                  lowerIsBetter,
                  description,
                  info,
                  Icon,
                }) => (
                  <tr key={key}>
                    <th
                      scope="row"
                      className="py-1.5 ps-3 pe-3 text-start text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300"
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5">
                            <span className="break-words">{label}</span>
                            {info && <InfoTip text={info} title={label} />}
                          </span>
                          {description && (
                            <span className="block text-theme-xs leading-4 font-normal break-words text-gray-500 dark:text-gray-400">
                              {description}
                            </span>
                          )}
                        </span>
                      </span>
                    </th>
                    <td className="px-3 py-1.5 text-center text-sm font-bold text-gray-950 tabular-nums dark:text-white">
                      {value}
                    </td>
                    <td className="py-1.5 ps-3 pe-3">
                      <span className="flex min-w-0 justify-end [&>span]:justify-end">
                        {trend ? (
                          <MetricTrend
                            compact
                            trend={trend}
                            lowerIsBetter={lowerIsBetter}
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="text-sm text-gray-300 dark:text-gray-600"
                          >
                            —
                          </span>
                        )}
                      </span>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          ))}
        </table>
      </div>
    </ComponentCard>
  );
}
