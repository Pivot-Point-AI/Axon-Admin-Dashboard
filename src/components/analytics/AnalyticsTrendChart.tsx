"use client";

import { useCallback, useId, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import AnalyticsChartCanvas, {
  type AnalyticsCanvasFrame,
} from "./AnalyticsChartCanvas";

export interface AnalyticsTrendPoint {
  timestamp: number;
  [key: string]: number | null;
}
interface AnalyticsTrendChartProps {
  points: AnalyticsTrendPoint[];
  series: { key: string; token: string; label: string }[];
  title: string;
  curve?: "smooth" | "straight";
  axisSteps?: number;
  compactAxis?: boolean;
}

export default function AnalyticsTrendChart({
  points,
  series,
  title,
  curve = "smooth",
  axisSteps = 4,
  compactAxis = false,
}: AnalyticsTrendChartProps) {
  const t = useTranslations("analytics.design");
  const format = useFormatter();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const hintId = useId();
  const dateLabel = useCallback(
    (timestamp: number) =>
      format.dateTime(timestamp, {
        month: "short",
        day: "2-digit",
        timeZone: "UTC",
      }),
    [format],
  );

  const draw = useCallback(
    ({ ctx, width, height, color, dark, rtl, font }: AnalyticsCanvasFrame) => {
      if (!points.length) return;
      const start = rtl ? 12 : 34;
      const end = width - (rtl ? 34 : 12);
      const top = 12;
      const bottom = height - 26;
      const first = points[0].timestamp;
      const duration = points[points.length - 1].timestamp - first;
      const x = (index: number) => {
        const fraction = duration
          ? (points[index].timestamp - first) / duration
          : 0.5;
        return start + (rtl ? 1 - fraction : fraction) * (end - start);
      };
      const maximum =
        Math.max(
          1,
          ...points.flatMap((point) =>
            series.map(({ key }) => point[key] ?? 0),
          ),
        ) * 1.05;
      const magnitude = 10 ** Math.floor(Math.log10(maximum / axisSteps));
      const step =
        [1, 2, 2.5, 5, 10]
          .map((value) => value * magnitude)
          .find((value) => value >= maximum / axisSteps) ?? magnitude * 10;
      const limit = step * axisSteps;
      const y = (value: number) => bottom - (value / limit) * (bottom - top);
      ctx.font = `11px ${font}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = rtl ? "left" : "right";
      for (let tick = 0; tick <= axisSteps; tick++) {
        const value = tick * step;
        ctx.fillStyle = color(dark ? "gray-400" : "gray-500");
        ctx.fillText(
          format.number(
            value,
            compactAxis
              ? { notation: "compact", maximumFractionDigits: 1 }
              : undefined,
          ),
          rtl ? end + 8 : start - 8,
          y(value),
        );
        ctx.strokeStyle = color(dark ? "gray-800" : "gray-100");
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(start, y(value));
        ctx.lineTo(end, y(value));
        ctx.stroke();
      }
      const labelStep = Math.max(
        1,
        Math.ceil(points.length / Math.max(2, Math.floor((end - start) / 62))),
      );
      const labelIndices = points
        .map((_, index) => index)
        .filter(
          (index) =>
            index % labelStep === 0 &&
            index < points.length - Math.ceil(labelStep / 2),
        );
      labelIndices.push(points.length - 1);
      ctx.textAlign = "center";
      for (const index of labelIndices) {
        ctx.strokeStyle = color(dark ? "gray-800" : "gray-100");
        ctx.beginPath();
        ctx.moveTo(x(index), top);
        ctx.lineTo(x(index), bottom);
        ctx.stroke();
        ctx.fillStyle = color(dark ? "gray-400" : "gray-500");
        ctx.fillText(
          dateLabel(points[index].timestamp),
          Math.max(24, Math.min(width - 24, x(index))),
          height - 9,
        );
      }
      // Draw each contiguous reported series; missing observations remain gaps.
      for (const { key, token } of series) {
        let index = 0;
        while (index < points.length) {
          if (points[index][key] == null) {
            index++;
            continue;
          }
          const firstIndex = index;
          const path = new Path2D();
          path.moveTo(x(index), y(points[index][key]!));
          while (index + 1 < points.length && points[index + 1][key] != null) {
            const midpoint = (x(index) + x(index + 1)) / 2;
            if (curve === "straight")
              path.lineTo(x(index + 1), y(points[index + 1][key]!));
            else
              path.bezierCurveTo(
                midpoint,
                y(points[index][key]!),
                midpoint,
                y(points[index + 1][key]!),
                x(index + 1),
                y(points[index + 1][key]!),
              );
            index++;
          }
          const fill = new Path2D(path);
          fill.lineTo(x(index), bottom);
          fill.lineTo(x(firstIndex), bottom);
          fill.closePath();
          const gradient = ctx.createLinearGradient(0, top, 0, bottom);
          gradient.addColorStop(0, color(token));
          gradient.addColorStop(1, "transparent");
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = gradient;
          ctx.fill(fill);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = color(token);
          ctx.lineWidth = 1.75;
          ctx.stroke(path);
          for (let dot = firstIndex; dot <= index; dot++) {
            ctx.beginPath();
            ctx.arc(x(dot), y(points[dot][key]!), 2.6, 0, Math.PI * 2);
            ctx.fillStyle = color(token);
            ctx.fill();
            ctx.strokeStyle = color(dark ? "gray-900" : "white");
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
          index++;
        }
      }
      if (hoverIndex !== null && points[hoverIndex]) {
        ctx.strokeStyle = color("gray-400");
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(x(hoverIndex), top);
        ctx.lineTo(x(hoverIndex), bottom);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    },
    [
      points,
      series,
      curve,
      axisSteps,
      compactAxis,
      dateLabel,
      format,
      hoverIndex,
    ],
  );

  const active = hoverIndex === null ? null : points[hoverIndex];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-5 text-theme-xs text-gray-500 dark:text-gray-400">
        {series.map(({ key, token, label }) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full"
              style={{ background: `var(--color-${token})` }}
            />
            {label}
          </span>
        ))}
      </div>
      <div className="relative h-44">
        <p id={hintId} className="sr-only">
          {t("trendKeyboardHint")}
        </p>
        <AnalyticsChartCanvas
          draw={draw}
          className="h-full w-full rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-300 dark:focus-visible:ring-brand-500"
          tabIndex={0}
          aria-label={title}
          aria-describedby={hintId}
          onFocus={() => setHoverIndex(0)}
          onBlur={() => setHoverIndex(null)}
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
              return;
            event.preventDefault();
            const rtl =
              getComputedStyle(event.currentTarget).direction === "rtl";
            const delta =
              (event.key === "ArrowRight" ? 1 : -1) * (rtl ? -1 : 1);
            setHoverIndex((index) =>
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? points.length - 1
                  : Math.max(
                      0,
                      Math.min(points.length - 1, (index ?? 0) + delta),
                    ),
            );
          }}
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const rtl =
              getComputedStyle(event.currentTarget).direction === "rtl";
            const fraction = Math.max(
              0,
              Math.min(
                1,
                (event.clientX - rect.left - (rtl ? 12 : 34)) /
                  (rect.width - 46),
              ),
            );
            const time =
              points[0].timestamp +
              (rtl ? 1 - fraction : fraction) *
                (points[points.length - 1].timestamp - points[0].timestamp);
            const nearest = points.reduce(
              (best, point, index) =>
                Math.abs(point.timestamp - time) <
                Math.abs(points[best].timestamp - time)
                  ? index
                  : best,
              0,
            );
            setHoverIndex(nearest);
          }}
          onPointerLeave={() => setHoverIndex(null)}
        />
        {active && (
          <div
            role="status"
            className="pointer-events-none absolute start-1/2 top-0 z-10 -translate-x-1/2 rounded-lg border border-gray-100 bg-white/95 px-3 py-2 text-theme-xs shadow-theme-sm rtl:translate-x-1/2 dark:border-gray-700 dark:bg-gray-900/95"
          >
            <p className="mb-1 font-semibold text-gray-800 dark:text-gray-200">
              {dateLabel(active.timestamp)}
            </p>
            {series.map(({ key, token, label }) => (
              <p
                key={key}
                className="flex justify-between gap-4 text-gray-600 dark:text-gray-300"
              >
                <span>{label}</span>
                <span
                  className="font-semibold tabular-nums"
                  style={{ color: `var(--color-${token})` }}
                >
                  {active[key] == null ? "—" : format.number(active[key]!)}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
