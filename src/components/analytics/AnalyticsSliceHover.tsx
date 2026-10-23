"use client";

import { useState } from "react";
import { useFormatter } from "next-intl";

interface AnalyticsSliceHoverProps {
  rows: { key: string; count: number }[];
  total: number;
  label: (key: string) => string;
  /** Hole radius as a fraction of the outer radius (0 for a full pie). */
  hole?: number;
}

// Transparent layer over a pie/donut: hovering a slice names it.
export default function AnalyticsSliceHover({
  rows,
  total,
  label,
  hole = 0,
}: AnalyticsSliceHoverProps) {
  const format = useFormatter();
  const [hover, setHover] = useState<{
    key: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);
  const locate = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    const dx = x - box.width / 2;
    const dy = y - box.height / 2;
    const distance = Math.hypot(dx, dy) / (box.width / 2);
    if (total <= 0 || distance > 1 || distance < hole) return setHover(null);
    const turn =
      ((Math.atan2(dx, -dy) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
    let before = 0;
    for (const row of rows) {
      before += row.count / total;
      if (turn <= before)
        return setHover({ key: row.key, count: row.count, x, y });
    }
    setHover(null);
  };
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 rounded-full"
      onPointerMove={locate}
      onPointerLeave={() => setHover(null)}
    >
      {hover && (
        <span
          className="axon-fade-in pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-gray-900 px-2.5 py-1.5 text-center text-theme-xs font-medium whitespace-nowrap text-white shadow-theme-md dark:bg-gray-700 dark:text-white"
          style={{ left: hover.x, top: hover.y - 10 }}
        >
          {label(hover.key)}
          <span className="block font-normal tabular-nums">
            {format.number(hover.count)} ·{" "}
            {format.number(total > 0 ? hover.count / total : 0, {
              style: "percent",
              maximumFractionDigits: 1,
            })}
          </span>
        </span>
      )}
    </div>
  );
}
