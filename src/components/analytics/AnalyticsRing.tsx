"use client";

import { useCallback } from "react";
import { useFormatter } from "next-intl";
import AnalyticsChartCanvas, {
  type AnalyticsCanvasFrame,
} from "./AnalyticsChartCanvas";

interface AnalyticsRingProps {
  rows: { key: string; count: number }[];
  total: number;
  label: string;
  color: (key: string, index: number) => string;
  size?: "md" | "lg";
}

export default function AnalyticsRing({
  rows,
  total,
  label,
  color: token,
  size = "md",
}: AnalyticsRingProps) {
  const format = useFormatter();
  const draw = useCallback(
    ({ ctx, width, height, color, dark }: AnalyticsCanvasFrame) => {
      const size = Math.min(width, height);
      const thickness = size * 0.17;
      const radius = size / 2 - 2 - thickness / 2;
      let angle = -Math.PI / 2;
      ctx.lineWidth = thickness;
      ctx.strokeStyle = color(dark ? "gray-800" : "gray-100");
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
      rows.forEach((row, index) => {
        const slice = total > 0 ? (row.count / total) * Math.PI * 2 : 0;
        if (!slice) return;
        const gap = Math.min(0.02, slice / 4);
        ctx.beginPath();
        ctx.arc(
          width / 2,
          height / 2,
          radius,
          angle + gap / 2,
          angle + slice - gap / 2,
        );
        ctx.strokeStyle = color(token(row.key, index));
        ctx.stroke();
        angle += slice;
      });
    },
    [rows, total, token],
  );
  return (
    <div
      className={`relative shrink-0 ${size === "lg" ? "size-48" : "size-44"}`}
    >
      <AnalyticsChartCanvas
        draw={draw}
        aria-hidden="true"
        className="size-full"
      />
      <div className="pointer-events-none absolute inset-10 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-gray-950 tabular-nums dark:text-white">
          {format.number(total)}
        </span>
        <span className="text-theme-xs text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
    </div>
  );
}
