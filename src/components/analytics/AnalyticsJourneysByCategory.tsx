"use client";

import { useCallback } from "react";
import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { PieChartIcon } from "@/icons";
import AnalyticsChartCanvas, {
  type AnalyticsCanvasFrame,
} from "./AnalyticsChartCanvas";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import {
  journeyColors,
  journeyDistribution,
  journeyLabelKey,
} from "./analyticsJourneyInsights";

interface AnalyticsJourneysByCategoryProps {
  data: Record<string, unknown>;
}

export default function AnalyticsJourneysByCategory({
  data,
}: AnalyticsJourneysByCategoryProps) {
  const t = useTranslations("analytics.design");
  const format = useFormatter();
  const { rows, total } = journeyDistribution(data);
  const draw = useCallback(
    ({ ctx, width, height, color, dark }: AnalyticsCanvasFrame) => {
      const size = Math.min(width, height);
      const radius = size / 2 - 2;
      const thickness = size * 0.17;
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
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        const token =
          journeyLabelKey(row.key) === "others"
            ? "gray-400"
            : journeyColors[index];
        gradient.addColorStop(0, color(token));
        gradient.addColorStop(
          1,
          color(token === "gray-400" ? "gray-300" : token),
        );
        ctx.strokeStyle = gradient;
        ctx.stroke();
        angle += slice;
      });
    },
    [rows, total],
  );

  return (
    <ComponentCard
      compact
      title={t("journeysByCategory")}
      icon={<PieChartIcon />}
      iconClassName="bg-theme-purple-500/10 text-theme-purple-500 dark:bg-theme-purple-500/15 dark:text-theme-purple-500"
      actions={<AnalyticsJourneyPeriod />}
      className="h-full"
    >
      {!rows.length ? (
        <AnalyticsEmptyState />
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center gap-5 sm:flex-row">
          <div className="relative size-48 shrink-0">
            <AnalyticsChartCanvas
              draw={draw}
              aria-hidden="true"
              className="size-full"
            />
            <div className="pointer-events-none absolute inset-10 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold tracking-tight text-gray-950 tabular-nums dark:text-white">
                {format.number(total)}
              </span>
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                {t("totalStarted")}
              </span>
            </div>
          </div>
          <dl className="w-full min-w-0 flex-1 space-y-3.5">
            {rows.map((row, index) => {
              const labelKey = journeyLabelKey(row.key);
              const label = labelKey
                ? t(labelKey)
                : row.key.replaceAll("_", " ");
              const token =
                labelKey === "others" ? "gray-400" : journeyColors[index];
              return (
                <div
                  key={row.key}
                  className="flex items-center justify-between gap-2 text-theme-xs"
                >
                  <dt className="flex min-w-0 items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: `var(--color-${token})` }}
                    />
                    <span className="break-words">{label}</span>
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
        </div>
      )}
    </ComponentCard>
  );
}
