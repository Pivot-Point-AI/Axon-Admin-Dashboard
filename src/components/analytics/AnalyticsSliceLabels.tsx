"use client";

import { useFormatter } from "next-intl";

interface AnalyticsSliceLabelsProps {
  rows: { key: string; count: number }[];
  total: number;
  /** Distance from the centre as a fraction of the radius (0–1). */
  radius: number;
  /** Omit to show only the percentage. */
  label?: (key: string) => string;
  minShare?: number;
}

// Writes each slice's name and share on a pie/donut. Slices too small to hold
// text are left to the legend.
export default function AnalyticsSliceLabels({
  rows,
  total,
  radius,
  label,
  minShare,
}: AnalyticsSliceLabelsProps) {
  const format = useFormatter();
  if (total <= 0) return null;
  const inside = minShare ?? (label ? 0.08 : 0.045);
  // Slices too small to hold text get their percentage just outside the ring,
  // skipping any that would sit on top of the previous outside label.
  const placed = rows.reduce<{
    items: { key: string; share: number; middle: number; outside: boolean }[];
    before: number;
    lastOutside: number;
  }>(
    (state, row) => {
      const share = row.count / total;
      const middle = ((state.before + row.count / 2) / total) * Math.PI * 2;
      const outside = share < inside;
      const show =
        share >= 0.005 && (!outside || middle - state.lastOutside >= 0.16);
      return {
        items: show
          ? [...state.items, { key: row.key, share, middle, outside }]
          : state.items,
        before: state.before + row.count,
        lastOutside: show && outside ? middle : state.lastOutside,
      };
    },
    { items: [], before: 0, lastOutside: -Infinity },
  ).items;
  return (
    <>
      {placed.map(({ key, share, middle, outside }) => {
        const at = outside ? 1.1 : radius;
        const percent = format.number(share, {
          style: "percent",
          maximumFractionDigits: share < 0.1 ? 1 : 0,
        });
        return (
          <span
            key={key}
            aria-hidden="true"
            className={`axon-label-in pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-center break-words ${outside ? "text-[0.625rem] leading-3 font-semibold whitespace-nowrap text-gray-600 dark:text-gray-300" : "max-w-20 text-[0.6875rem] leading-3 font-semibold text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.35)] dark:text-white"}`}
            style={{
              insetInlineStart: `${50 + at * 50 * Math.sin(middle)}%`,
              top: `${50 - at * 50 * Math.cos(middle)}%`,
            }}
          >
            {!outside && label?.(key)}
            <span className={!outside && label ? "block font-normal" : "block"}>
              {percent}
            </span>
          </span>
        );
      })}
    </>
  );
}
