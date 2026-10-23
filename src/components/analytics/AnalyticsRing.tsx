"use client";

import useReveal from "./useReveal";
import CountUpText from "@/components/common/CountUpText";
import AnalyticsSliceHover from "./AnalyticsSliceHover";
import AnalyticsSliceLabels from "./AnalyticsSliceLabels";
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
  size?: "md" | "lg" | "xl";
  nameOf?: (key: string) => string;
}

export default function AnalyticsRing({
  rows,
  total,
  label,
  color: token,
  size = "md",
  nameOf = (key) => key,
}: AnalyticsRingProps) {
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
      const thickness = size * 0.26;
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
      ctx.restore();
    },
    [rows, total, token, reveal],
  );
  return (
    <div
      className={`relative shrink-0 ${size === "xl" ? "size-72" : size === "lg" ? "size-48" : "size-44"}`}
    >
      <AnalyticsChartCanvas
        draw={draw}
        aria-hidden="true"
        className="size-full"
      />
      <AnalyticsSliceLabels rows={rows} total={total} radius={0.74} />
      <AnalyticsSliceHover
        rows={rows}
        total={total}
        label={nameOf}
        hole={0.48}
      />
      <div className="pointer-events-none absolute inset-[26%] flex flex-col items-center justify-center text-center">
        <span
          className={`font-bold ${size === "xl" ? "text-xl" : "text-lg"} text-gray-950 tabular-nums dark:text-white`}
        >
          <CountUpText text={format.number(total)} />
        </span>
        <span className="max-w-full text-[0.6875rem] leading-3 break-words text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
    </div>
  );
}
