"use client";
import { valueInfo, valueDescription } from "./analyticsTrends";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import { useFormatter, useTranslations } from "next-intl";
import { ChartBarsIcon } from "@/icons";
import AnalyticsChartCard from "./AnalyticsChartCard";
import AnalyticsGroupedColumns from "./AnalyticsGroupedColumns";
import AnalyticsRing from "./AnalyticsRing";
import { telemetryDistribution } from "./analyticsTelemetryData";

interface AnalyticsActivityColumnsProps {
  field: "stt_events" | "token_usage";
  value: unknown;
}
const colors = [
  "brand-500",
  "theme-purple-500",
  "blue-light-400",
  "success-500",
];
// Only token volumes share one axis; ratios, call counts and per-flow
// averages are on other scales and are not plotted.
const volumeKeys =
  /^(total|total_tokens|prompt|prompt_tokens|completion|completion_tokens|total_in_tokens|total_out_tokens|input_tokens|output_tokens)$/;

export default function AnalyticsActivityColumns({
  field,
  value,
}: AnalyticsActivityColumnsProps) {
  const t = useTranslations("analytics.telemetry");
  const format = useFormatter();
  const tInfo = useTranslations("analytics.design.info");
  const allRows = telemetryDistribution(value);
  const stt = field === "stt_events";
  const split = !stt && allRows.some((row) => volumeKeys.test(row.key));
  // "Prompt" and "total in" are the same figure under two names; show one.
  const has = (pattern: RegExp) => allRows.some((row) => pattern.test(row.key));
  const duplicate = (key: string) =>
    (/^(total_in_tokens|input_tokens)$/.test(key) && has(/^prompt/)) ||
    (/^(total_out_tokens|output_tokens)$/.test(key) && has(/^completion/)) ||
    (key === "total" && has(/^total_tokens$/));
  const rows = split
    ? allRows.filter((row) => volumeKeys.test(row.key) && !duplicate(row.key))
    : allRows;
  // Total tokens are prompt plus completion: show that split as a donut.
  const parts = stt
    ? []
    : rows.filter((row) =>
        /^(prompt|prompt_tokens|completion|completion_tokens|total_in_tokens|total_out_tokens|input_tokens|output_tokens)$/.test(
          row.key,
        ),
      );
  const donut = parts.length >= 2 && parts.some((row) => row.count > 0);
  const whole =
    rows.find((row) => /^(total|total_tokens)$/.test(row.key))?.count ??
    parts.reduce((sum, row) => sum + row.count, 0);
  const label = (key: string) =>
    t.has(`${stt ? "events" : "tokens"}.${key}`)
      ? t(`${stt ? "events" : "tokens"}.${key}`)
      : key.replaceAll("_", " ");
  const color = (key: string, index: number) =>
    !stt && /^(prompt|prompt_tokens|input_tokens|total_in_tokens)$/.test(key)
      ? "brand-500"
      : !stt &&
          /^(completion|completion_tokens|output_tokens|total_out_tokens)$/.test(
            key,
          )
        ? "blue-light-400"
        : stt
          ? ({
              transcribed: "brand-500",
              empty: "theme-purple-500",
              failed: "orange-400",
              garbage_dropped: "success-500",
            }[key] ?? colors[index % colors.length])
          : colors[index % colors.length];
  return (
    <AnalyticsChartCard
      title={t(stt ? "speechTitle" : "tokensTitle")}
      description={
        valueDescription(value) ??
        t(stt ? "speechDescription" : "tokensDescription")
      }
      icon={<ChartBarsIcon />}
      info={valueInfo(value) ?? tInfo(stt ? "speech" : "tokens")}
      actions={<AnalyticsJourneyPeriod />}
    >
      {stt && (
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-theme-xs text-gray-500 dark:text-gray-400">
          {rows.map((row, index) => (
            <span key={row.key} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{
                  backgroundColor: `var(--color-${color(row.key, index)})`,
                }}
              />
              {label(row.key)}
            </span>
          ))}
        </div>
      )}
      {donut ? (
        <div className="flex flex-col items-center gap-5">
          <AnalyticsRing
            rows={parts}
            total={whole}
            label={t("total")}
            color={color}
            size="lg"
            nameOf={label}
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
                      background: `var(--color-${color(row.key, index)})`,
                    }}
                  />
                  <span className="break-words">{label(row.key)}</span>
                </dt>
                <dd className="flex shrink-0 items-center gap-3 tabular-nums">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {format.number(row.count)}
                  </span>
                  <span className="w-12 text-end text-gray-500 dark:text-gray-400">
                    {format.number(whole > 0 ? row.count / whole : 0, {
                      style: "percent",
                      maximumFractionDigits: 1,
                    })}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <AnalyticsGroupedColumns
          axisSteps={stt ? 5 : 4}
          rows={rows.map((row) => ({
            key: row.key,
            label: label(row.key),
            values: { count: row.count },
          }))}
          series={[{ key: "count", label: t("total"), token: "brand-500" }]}
          color={color}
          legend={false}
        />
      )}
    </AnalyticsChartCard>
  );
}
