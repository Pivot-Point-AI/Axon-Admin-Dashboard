"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { ChartBarsIcon } from "@/icons";
import type { MetricTrendData } from "./analyticsTrends";

export interface AnalyticsPeriodPoint {
  label: string;
  value: number | null;
  trend?: MetricTrendData | null;
}

interface AnalyticsPeriodChartProps {
  points: AnalyticsPeriodPoint[];
  variant?: "area" | "bar";
  color?: "brand" | "purple";
  fillHeight?: boolean;
  tall?: boolean;
}

const CHART_ANIMATION_MS = 700;

// Plot only the reported aggregate windows. No daily history is interpolated.
export default function AnalyticsPeriodChart({
  points,
  variant = "area",
  color: accent = "brand",
  fillHeight = false,
  tall = false,
}: AnalyticsPeriodChartProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const coordinates = useRef<{ x: number; y: number; value: number | null }[]>(
    [],
  );
  const progressRef = useRef(1);
  const drawRef = useRef<(() => void) | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const format = useFormatter();
  const t = useTranslations("analytics");
  const tooltipId = useId();
  const activePoint = activeIndex === null ? null : points[activeIndex];
  // Nothing recorded for this period: say so instead of drawing an empty plot.
  const empty = points.every((point) => !point.value);
  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => {
      const progress = progressRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;
      const { width, height } = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.scale(ratio, ratio);
      const styles = getComputedStyle(canvas);
      const theme = getComputedStyle(document.documentElement);
      const color = theme
        .getPropertyValue(
          accent === "purple"
            ? "--color-theme-purple-500"
            : "--color-brand-500",
        )
        .trim();
      const dark = document.documentElement.classList.contains("dark");
      const grid = theme
        .getPropertyValue(dark ? "--color-gray-800" : "--color-gray-100")
        .trim();
      const muted = theme.getPropertyValue("--color-gray-500").trim();
      const rtl = document.documentElement.dir === "rtl";
      context.font = `11px ${styles.fontFamily}`;
      context.lineWidth = 1;
      const maximum = Math.max(
        5,
        Math.ceil(Math.max(0, ...points.map((p) => p.value ?? 0)) / 5) * 5,
      );
      let maxLabelWidth = 0;
      for (let tick = 0; tick <= 5; tick++) {
        const text = String(Math.round((maximum * tick) / 5));
        maxLabelWidth = Math.max(
          maxLabelWidth,
          context.measureText(text).width,
        );
      }
      const startPadding = Math.max(48, Math.ceil(maxLabelWidth) + 16);
      const padding = { start: startPadding, end: 14, top: 18, bottom: 30 };
      const chartWidth = width - padding.start - padding.end;
      const chartHeight = height - padding.top - padding.bottom;
      for (let tick = 0; tick <= 5; tick++) {
        const y = padding.top + chartHeight * (1 - tick / 5);
        context.strokeStyle = grid;
        context.beginPath();
        context.moveTo(padding.start, y);
        context.lineTo(width - padding.end, y);
        context.stroke();
        context.fillStyle = muted;
        context.textAlign = "end";
        context.fillText(
          String(Math.round((maximum * tick) / 5)),
          padding.start - 8,
          y + 4,
        );
      }
      // Drop a label that would collide with the final one.
      const labelStep = Math.ceil(points.length / 7);
      const positions = points.map((point, index) => {
        const fraction =
          variant === "bar"
            ? (index + 0.5) / points.length
            : index / Math.max(1, points.length - 1);
        const x = padding.start + chartWidth * (rtl ? 1 - fraction : fraction);
        context.fillStyle = muted;
        context.textAlign =
          index === 0 && variant === "area"
            ? rtl
              ? "end"
              : "start"
            : index === points.length - 1 && variant === "area"
              ? rtl
                ? "start"
                : "end"
              : "center";
        const last = points.length - 1;
        if (
          points.length <= 8 ||
          (index % labelStep === 0 && last - index >= labelStep / 2) ||
          index === last
        )
          context.fillText(point.label, x, height - 8);
        return {
          x,
          y:
            padding.top +
            chartHeight *
              (1 -
                (Math.max(0, point.value ?? 0) / maximum) *
                  (variant === "bar" ? progress : 1)),
          value: point.value,
        };
      });
      coordinates.current = positions;
      if (variant === "bar") {
        const barWidth = Math.min(32, chartWidth / points.length / 3);
        positions.forEach(({ x, y, value }) => {
          if (value === null) return;
          const fill = context.createLinearGradient(
            0,
            y,
            0,
            padding.top + chartHeight,
          );
          fill.addColorStop(
            0,
            theme.getPropertyValue("--color-brand-400").trim(),
          );
          fill.addColorStop(1, color);
          context.fillStyle = fill;
          context.beginPath();
          context.roundRect(
            x - barWidth / 2,
            y,
            barWidth,
            chartHeight + padding.top - y,
            [3, 3, 0, 0],
          );
          context.fill();
        });
      } else {
        // Wipe the line in from its starting edge.
        context.save();
        context.beginPath();
        if (rtl)
          context.rect(width * (1 - progress), 0, width * progress, height);
        else context.rect(0, 0, width * progress, height);
        context.clip();
        const line = new Path2D();
        let previous: { x: number; y: number; value: number | null } | null =
          null;
        positions.forEach((point) => {
          if (point.value === null) {
            previous = null;
            return;
          }
          if (previous === null) line.moveTo(point.x, point.y);
          else {
            const middle = (previous.x + point.x) / 2;
            line.bezierCurveTo(
              middle,
              previous.y,
              middle,
              point.y,
              point.x,
              point.y,
            );
          }
          previous = point;
        });
        if (positions.every((p) => p.value !== null)) {
          const fillPath = new Path2D(line);
          fillPath.lineTo(
            positions[positions.length - 1].x,
            padding.top + chartHeight,
          );
          fillPath.lineTo(positions[0].x, padding.top + chartHeight);
          fillPath.closePath();
          const fill = context.createLinearGradient(
            0,
            padding.top,
            0,
            padding.top + chartHeight,
          );
          fill.addColorStop(0, color + "40");
          fill.addColorStop(1, color + "04");
          context.fillStyle = fill;
          context.fill(fillPath);
        }
        context.strokeStyle = color;
        context.lineWidth = 2.5;
        context.stroke(line);
        positions.forEach(({ x, y, value }) => {
          if (value === null) return;
          context.beginPath();
          context.arc(x, y, 4.5, 0, 2 * Math.PI);
          context.fillStyle = color;
          context.fill();
          context.strokeStyle = theme
            .getPropertyValue(dark ? "--color-gray-900" : "--color-white")
            .trim();
          context.lineWidth = 2;
          context.stroke();
        });
        context.restore();
      }
      const selected = activeIndex === null ? null : positions[activeIndex];
      if (selected && selected.value !== null) {
        context.save();
        context.beginPath();
        context.setLineDash([3, 4]);
        context.strokeStyle = color;
        context.globalAlpha = 0.4;
        context.lineWidth = 1;
        context.moveTo(selected.x, padding.top);
        context.lineTo(selected.x, padding.top + chartHeight);
        context.stroke();
        context.restore();
        context.beginPath();
        context.arc(selected.x, selected.y, 6, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
        context.strokeStyle = theme
          .getPropertyValue(dark ? "--color-gray-900" : "--color-white")
          .trim();
        context.lineWidth = 2;
        context.stroke();
      }
    };
    drawRef.current = draw;
    const resize = new ResizeObserver(draw);
    resize.observe(canvas);
    const appearance = new MutationObserver(draw);
    appearance.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "dir"],
    });
    draw();
    return () => {
      resize.disconnect();
      appearance.disconnect();
    };
  }, [points, variant, accent, activeIndex]);
  // Grow the plot in whenever the data changes; hovering must not replay it.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      progressRef.current = 1;
      drawRef.current?.();
      return;
    }
    progressRef.current = 0;
    drawRef.current?.();
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const elapsed = Math.min(1, (now - start) / CHART_ANIMATION_MS);
      progressRef.current = 1 - (1 - elapsed) ** 3;
      drawRef.current?.();
      if (elapsed < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [points, variant]);
  // The same reported values are available through pointer, touch, and keyboard input.
  return (
    <div className={`relative ${fillHeight ? "h-full min-h-64" : ""}`}>
      <canvas
        ref={ref}
        tabIndex={0}
        role="img"
        aria-label={t("design.chartNavigation")}
        aria-describedby={activePoint ? tooltipId : undefined}
        aria-keyshortcuts="ArrowLeft ArrowRight Home End Escape"
        onFocus={() =>
          setActiveIndex(points.findIndex((point) => point.value !== null))
        }
        onBlur={() => setActiveIndex(null)}
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - bounds.left;
          let nearest: number | null = null;
          let distance = Infinity;
          coordinates.current.forEach((point, index) => {
            if (point.value !== null && Math.abs(point.x - x) < distance) {
              nearest = index;
              distance = Math.abs(point.x - x);
            }
          });
          setActiveIndex(nearest);
        }}
        onPointerLeave={() => {
          if (document.activeElement !== ref.current) setActiveIndex(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setActiveIndex(null);
            return;
          }
          const indexes = points.flatMap((point, index) =>
            point.value === null ? [] : [index],
          );
          if (
            !indexes.length ||
            !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
          )
            return;
          event.preventDefault();
          const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
          const position = Math.max(
            0,
            indexes.indexOf(activeIndex ?? indexes[0]),
          );
          const step = (event.key === "ArrowRight" ? 1 : -1) * (rtl ? -1 : 1);
          setActiveIndex(
            event.key === "Home"
              ? indexes[0]
              : event.key === "End"
                ? indexes.at(-1)!
                : indexes[
                    Math.min(indexes.length - 1, Math.max(0, position + step))
                  ],
          );
        }}
        className={`block w-full rounded-lg font-outfit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 ${fillHeight ? "absolute inset-0 h-full" : tall ? "h-72" : "h-52"} ${empty ? "opacity-40" : ""}`}
      />
      {empty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="axon-fade-in inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-gray-600 shadow-theme-xs backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-300">
            <ChartBarsIcon
              aria-hidden="true"
              className="size-4 text-gray-400 dark:text-gray-500"
            />
            {t("empty")}
          </span>
        </div>
      )}
      {activePoint && (
        <div
          id={tooltipId}
          role="status"
          className="pointer-events-none absolute end-3 top-1 z-9 max-w-48 rounded-lg border border-gray-100 bg-white px-3 py-2 text-theme-xs shadow-theme-md dark:border-gray-700 dark:bg-gray-800"
        >
          <p className="text-gray-500 dark:text-gray-400">
            {activePoint.label}
          </p>
          <p className="mt-0.5 font-semibold text-gray-950 tabular-nums dark:text-gray-100">
            {activePoint.value === null
              ? "—"
              : format.number(activePoint.value)}
          </p>
        </div>
      )}
    </div>
  );
}
