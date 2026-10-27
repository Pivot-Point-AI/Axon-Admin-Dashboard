"use client";

import { blocksInfo } from "./analyticsTrends";
import useReveal from "./useReveal";
import CountUpText from "@/components/common/CountUpText";
import AnalyticsSliceHover from "./AnalyticsSliceHover";
import AnalyticsSliceLabels from "./AnalyticsSliceLabels";
import { useCallback } from "react";
import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { PieChartIcon } from "@/icons";
import AnalyticsCardActions from "./AnalyticsCardActions";
import AnalyticsChartCanvas, {
  type AnalyticsCanvasFrame,
} from "./AnalyticsChartCanvas";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import AnalyticsViewAll from "./AnalyticsViewAll";
import {
  journeyCategories,
  journeyColors,
  journeyDistribution,
  journeyLabelKey,
} from "./analyticsJourneyInsights";

interface AnalyticsJourneysByCategoryProps {
  data: Record<string, unknown>;
}

interface PieRow {
  key: string;
  count: number;
}

const tokenFor = (key: string, index: number) =>
  journeyLabelKey(key) === "others"
    ? "gray-400"
    : journeyColors[index % (journeyColors.length - 1)];

function CategoryPie({
  rows,
  total,
  large = false,
  legend = true,
}: {
  rows: PieRow[];
  total: number;
  large?: boolean;
  legend?: boolean;
}) {
  const t = useTranslations("analytics.design");
  const format = useFormatter();
  const reveal = useReveal(rows.map((row) => row.count).join(","));
  const draw = useCallback(
    ({ ctx, width, height, color, dark }: AnalyticsCanvasFrame) => {
      const size = Math.min(width, height);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(width / 2, height / 2);
      ctx.arc(
        width / 2,
        height / 2,
        size,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * reveal,
      );
      ctx.closePath();
      ctx.clip();
      const radius = size / 2 - 2;
      const thickness = size * 0.26;
      const center = { x: width / 2, y: height / 2 };
      let angle = -Math.PI / 2;
      ctx.lineWidth = thickness;
      ctx.strokeStyle = color(dark ? "gray-800" : "gray-200");
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius - thickness / 2, 0, Math.PI * 2);
      ctx.stroke();
      rows.forEach((row, index) => {
        const slice = total > 0 ? (row.count / total) * Math.PI * 2 : 0;
        if (!slice) return;
        const gap = Math.min(0.025, slice / 4);
        ctx.beginPath();
        ctx.arc(
          center.x,
          center.y,
          radius - thickness / 2,
          angle + gap / 2,
          angle + slice - gap / 2,
        );
        ctx.lineCap = "butt";
        const token = tokenFor(row.key, index);
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, color(token));
        gradient.addColorStop(
          1,
          color(token === "gray-400" ? "gray-300" : token),
        );
        ctx.strokeStyle = gradient;
        ctx.stroke();
        angle += slice;
      });
      ctx.restore();
    },
    [rows, total, reveal],
  );
  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 sm:flex-row ${large ? "min-h-96 gap-10" : "min-h-48"}`}
    >
      <div className={`relative shrink-0 ${large ? "size-72" : "size-48"}`}>
        <AnalyticsChartCanvas
          draw={draw}
          aria-hidden="true"
          className="size-full"
        />
        <AnalyticsSliceLabels rows={rows} total={total} radius={0.74} />
        <AnalyticsSliceHover
          rows={rows}
          total={total}
          hole={0.48}
          label={(key) => {
            const labelKey = journeyLabelKey(key);
            return labelKey ? t(labelKey) : key.replaceAll("_", " ");
          }}
        />
        <div className="pointer-events-none absolute inset-[26%] flex flex-col items-center justify-center text-center">
          <span
            className={`font-bold tracking-tight text-gray-950 tabular-nums dark:text-white ${large ? "text-2xl" : "text-lg"}`}
          >
            <CountUpText text={format.number(total)} />
          </span>
          <span className="max-w-full text-[0.6875rem] leading-3 break-words text-gray-500 dark:text-gray-400">
            {t("totalStarted")}
          </span>
        </div>
      </div>
      {legend && (
        <dl className="w-full min-w-0 flex-1 space-y-3.5">
          {rows.map((row, index) => {
            const labelKey = journeyLabelKey(row.key);
            return (
              <div
                key={row.key}
                className="flex items-center justify-between gap-2 text-theme-xs"
              >
                <dt className="flex min-w-0 items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      background: `var(--color-${tokenFor(row.key, index)})`,
                    }}
                  />
                  <span className="break-words">
                    {labelKey ? t(labelKey) : row.key.replaceAll("_", " ")}
                  </span>
                </dt>
                <dd className="flex shrink-0 items-center gap-3 tabular-nums">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {format.number(row.count)}
                  </span>
                  <span className="w-10 text-end text-gray-500 dark:text-gray-400">
                    {format.number(total > 0 ? row.count / total : 0, {
                      style: "percent",
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </div>
  );
}

export default function AnalyticsJourneysByCategory({
  data,
}: AnalyticsJourneysByCategoryProps) {
  const t = useTranslations("analytics.design");
  const tInfo = useTranslations("analytics.design.info");
  const format = useFormatter();
  const { rows, total } = journeyDistribution(data);
  const everything: PieRow[] = journeyCategories(data)
    .filter((row) => row.count !== null)
    .map((row) => ({ key: row.key, count: row.count! }))
    .sort((a, b) => b.count - a.count);
  const everythingTotal = Math.max(
    total,
    everything.reduce((sum, row) => sum + row.count, 0),
  );
  const nameOf = (key: string) => {
    const labelKey = journeyLabelKey(key);
    return labelKey ? t(labelKey) : key.replaceAll("_", " ");
  };
  const share = (count: number) =>
    format.number(everythingTotal > 0 ? count / everythingTotal : 0, {
      style: "percent",
      maximumFractionDigits: 1,
    });
  const entries = everything.map((row, index) => ({
    key: row.key,
    label: nameOf(row.key),
    color: tokenFor(row.key, index),
    values: [format.number(row.count), share(row.count)],
    bar: everythingTotal > 0 ? row.count / everythingTotal : 0,
  }));

  return (
    <ComponentCard
      compact
      title={t("journeysByCategory")}
      icon={<PieChartIcon />}
      info={
        blocksInfo(data, [
          "flow_breakdown_by_type",
          "journey_outcomes_detail",
          "journey_outcomes",
          "most_popular_journeys",
          "top_popular_flows",
        ]) ?? tInfo("journeysByCategory")
      }
      actions={
        <AnalyticsCardActions>
          <AnalyticsViewAll
            title={t("journeysByCategory")}
            icon={<PieChartIcon />}
            columns={[t("categoryColumn"), t("totalStarted"), "%"]}
            entries={entries}
          >
            {everything.length ? (
              <CategoryPie
                rows={everything}
                total={everythingTotal}
                large
                legend={false}
              />
            ) : (
              <AnalyticsEmptyState />
            )}
          </AnalyticsViewAll>
          <AnalyticsJourneyPeriod />
        </AnalyticsCardActions>
      }
      className="h-full"
    >
      {!rows.length ? (
        <AnalyticsEmptyState />
      ) : (
        <CategoryPie rows={rows} total={total} />
      )}
    </ComponentCard>
  );
}
