"use client";

import { useCallback } from "react";
import { useFormatter } from "next-intl";
import CountUpText from "@/components/common/CountUpText";
import AnalyticsChartCanvas, {
  type AnalyticsCanvasFrame,
} from "./AnalyticsChartCanvas";
import useReveal from "./useReveal";

interface AnalyticsGaugeProps {
  /** Share of the good outcome, 0–1. */
  rate: number;
  caption: string;
  good: string;
  bad: string;
}

// Half-circle gauge with rounded ends: the good share sweeps in from the left
// and any remainder is drawn in the "bad" color.
export default function AnalyticsGauge({
  rate,
  caption,
  good,
  bad,
}: AnalyticsGaugeProps) {
  const format = useFormatter();
  const reveal = useReveal(String(rate));
  const draw = useCallback(
    ({ ctx, width, height, color, dark }: AnalyticsCanvasFrame) => {
      const thickness = 16;
      // Leave room above the arc for its stroke so the top is never cut off.
      const radius = Math.min(width / 2 - thickness, height - thickness - 8);
      const cx = width / 2;
      const cy = height - thickness / 2 - 2;
      const arc = (
        from: number,
        to: number,
        token: string,
        cap: CanvasLineCap,
      ) => {
        if (to <= from) return;
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          radius,
          Math.PI + from * Math.PI,
          Math.PI + to * Math.PI,
        );
        ctx.lineWidth = thickness;
        ctx.lineCap = cap;
        ctx.strokeStyle = color(token);
        ctx.stroke();
      };
      arc(0, 1, dark ? "gray-800" : "gray-100", "round");
      const goodEnd = rate * reveal;
      if (rate < 1) {
        // The remainder first, so the rounded end of the good arc overlaps it.
        arc(Math.max(goodEnd, 0), reveal, bad, "round");
      }
      arc(0, goodEnd || 0.0001, good, "round");
    },
    [rate, reveal, good, bad],
  );
  return (
    <div className="relative h-40 w-80 max-w-full">
      <AnalyticsChartCanvas
        draw={draw}
        aria-hidden="true"
        className="size-full"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className="text-4xl leading-10 font-bold tracking-tight text-gray-950 tabular-nums dark:text-white">
          <CountUpText
            text={format.number(rate, {
              style: "percent",
              maximumFractionDigits: 1,
            })}
          />
        </span>
        <span className="mt-0.5 text-theme-xs font-medium text-gray-500 dark:text-gray-400">
          {caption}
        </span>
      </div>
      <span
        aria-hidden="true"
        className="absolute start-1 -bottom-5 text-theme-xs text-gray-400 tabular-nums dark:text-gray-500"
      >
        0%
      </span>
      <span
        aria-hidden="true"
        className="absolute end-0 -bottom-5 text-theme-xs text-gray-400 tabular-nums dark:text-gray-500"
      >
        100%
      </span>
    </div>
  );
}
