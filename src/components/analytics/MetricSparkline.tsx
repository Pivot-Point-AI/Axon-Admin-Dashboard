"use client";

import { useEffect, useRef } from "react";
import { useFormatter, useTranslations } from "next-intl";
import type { MetricTrendPoint } from "./analyticsTrends";

export type SparklineTone =
  "brand" | "secondary" | "success" | "purple" | "warning" | "pink" | "error";
interface MetricSparklineProps {
  points: MetricTrendPoint[];
  tone?: SparklineTone;
  variant?: "line" | "bar";
  size?: "compact" | "card";
}
const colors = {
  brand: "--color-brand-500",
  secondary: "--color-theme-purple-500",
  success: "--color-success-500",
  purple: "--color-theme-purple-500",
  warning: "--color-orange-400",
  pink: "--color-theme-pink-500",
  error: "--color-error-500",
};

export default function MetricSparkline({
  points,
  tone = "brand",
  variant = "line",
  size = "compact",
}: MetricSparklineProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const t = useTranslations("metricTrends");
  const format = useFormatter();
  const available = points.filter((point) => point.value !== null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => {
      const context = canvas.getContext("2d");
      if (!context) return;
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.scale(ratio, ratio);
      const theme = getComputedStyle(document.documentElement),
        color = theme.getPropertyValue(colors[tone]).trim(),
        rtl = theme.direction === "rtl";
      const values = points.flatMap((point) =>
        point.value === null ? [] : [point.value],
      );
      const min =
          variant === "bar" ? Math.min(0, ...values) : Math.min(...values),
        max = Math.max(...values, variant === "bar" ? 0 : -Infinity),
        span = max - min;
      const position = (index: number, value: number) => ({
        x:
          3 +
          (rtl
            ? 1 - index / Math.max(1, points.length - 1)
            : index / Math.max(1, points.length - 1)) *
            (width - 6),
        y:
          span === 0
            ? height / 2
            : 3 + (1 - (value - min) / span) * (height - 6),
      });
      if (variant === "bar") {
        const barWidth = Math.min(
          10,
          ((width - 6) / Math.max(1, points.length)) * 0.55,
        );
        const baseline =
          span === 0 ? height - 3 : 3 + (1 - (0 - min) / span) * (height - 6);
        points.forEach((point, index) => {
          if (point.value === null) return;
          const p = position(index, point.value);
          const slot = (width - 8) / points.length;
          p.x = 4 + slot * (rtl ? points.length - index - 0.5 : index + 0.5);
          context.fillStyle = color;
          context.globalAlpha = 0.25 + (0.6 * (index + 1)) / points.length;
          context.beginPath();
          context.roundRect(
            p.x - barWidth / 2,
            Math.min(p.y, baseline),
            barWidth,
            point.value === 0 ? 0 : Math.max(1, Math.abs(baseline - p.y)),
            2,
          );
          context.fill();
        });
        context.globalAlpha = 1;
      } else {
        let segment: { x: number; y: number }[] = [];
        const paint = () => {
          if (!segment.length) return;
          const path = new Path2D();
          path.moveTo(segment[0].x, segment[0].y);
          segment.slice(1).forEach((p, index) => {
            const previous = segment[index];
            const middle = (previous.x + p.x) / 2;
            path.bezierCurveTo(middle, previous.y, middle, p.y, p.x, p.y);
          });
          if (segment.length > 1) {
            const fill = new Path2D(path);
            fill.lineTo(segment.at(-1)!.x, height);
            fill.lineTo(segment[0].x, height);
            fill.closePath();
            const gradient = context.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, color + "30");
            gradient.addColorStop(1, color + "00");
            context.fillStyle = gradient;
            context.fill(fill);
            context.strokeStyle = color;
            context.lineWidth = 1.5;
            context.lineJoin = "round";
            context.lineCap = "round";
            context.stroke(path);
          } else {
            context.beginPath();
            context.arc(segment[0].x, segment[0].y, 1.5, 0, Math.PI * 2);
            context.fillStyle = color;
            context.fill();
          }
          segment = [];
        };
        points.forEach((point, index) => {
          if (point.value === null) paint();
          else segment.push(position(index, point.value));
        });
        paint();
        const last = points.at(-1);
        if (last?.value !== null && last?.value !== undefined) {
          const end = position(points.length - 1, last.value);
          context.beginPath();
          context.arc(end.x, end.y, 2, 0, Math.PI * 2);
          context.fillStyle = color;
          context.fill();
        }
      }
    };
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
  }, [points, tone, variant]);
  if (
    available.length < 2 ||
    available.every((point) => point.value === available[0].value)
  )
    return null;
  const summary = points
    .map((point) =>
      point.value === null
        ? t("missing")
        : point.label
          ? `${point.label}: ${format.number(point.value)}`
          : format.number(point.value),
    )
    .join(", ");
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={t("history", { values: summary })}
      title={summary}
      className={
        size === "card"
          ? "my-2 block h-16 w-full shrink-0"
          : "block h-7 w-18 shrink-0"
      }
    />
  );
}
