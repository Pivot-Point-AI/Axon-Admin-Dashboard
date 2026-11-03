"use client";

import { useState } from "react";
import { useFormatter } from "next-intl";

export interface AnalyticsRoseItem {
  key: string;
  label: string;
  value: number;
}

interface AnalyticsRoseProps {
  items: AnalyticsRoseItem[];
  /** The whole the shares are taken of; defaults to the sum of the items. */
  total?: number;
  /** Color tokens (without the prefix) the slices cycle through. */
  colors?: string[];
  /** Fill the width of a large view; the default suits a card. */
  large?: boolean;
}

// Drawn in a fixed box and scaled to the container, so text scales with it.
const WIDTH = 600;
const HEIGHT = 380;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const RADIUS = 150;
const LABEL = RADIUS + 18;
const MIN_NAME = 22;

const defaults = [
  "brand-500",
  "blue-light-400",
  "theme-purple-500",
  "success-500",
  "orange-400",
  "theme-pink-500",
  "warning-500",
  "gray-400",
];

const clip = (text: string) =>
  text.length > MIN_NAME ? `${text.slice(0, MIN_NAME - 1)}…` : text;

/** Polar area chart: equal slices, each reaching out in proportion to its value. */
export default function AnalyticsRose({
  items,
  total,
  colors = defaults,
  large = false,
}: AnalyticsRoseProps) {
  const format = useFormatter();
  const [hover, setHover] = useState<number | null>(null);
  const rows = items.filter((item) => item.value > 0);
  const count = rows.length;
  if (!count) return null;
  const whole = total ?? rows.reduce((sum, item) => sum + item.value, 0);
  const maximum = Math.max(...rows.map((item) => item.value));
  const slice = (Math.PI * 2) / count;
  const gap = Math.min(0.04, slice / 6);
  const number = (value: number) =>
    format.number(value, { maximumFractionDigits: 2 });
  const share = (value: number) =>
    format.number(whole > 0 ? value / whole : 0, {
      style: "percent",
      maximumFractionDigits: 1,
    });
  const at = (radius: number, angle: number) => ({
    x: CX + Math.cos(angle) * radius,
    y: CY + Math.sin(angle) * radius,
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={rows
        .map((item) => `${item.label}: ${number(item.value)}`)
        .join(", ")}
      className={`mx-auto block h-auto w-full overflow-visible text-gray-950 dark:text-white ${large ? "max-h-[58vh] max-w-4xl" : "max-w-xl"}`}
      onPointerLeave={() => setHover(null)}
    >
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <circle
          key={ratio}
          cx={CX}
          cy={CY}
          r={RADIUS * Math.sqrt(ratio)}
          fill="none"
          strokeDasharray={ratio === 1 ? undefined : "3 4"}
          className="stroke-gray-300 dark:stroke-gray-600"
        />
      ))}
      {rows.map((item, index) => {
        // Area follows value, so the reach follows its square root.
        const reach = Math.max(10, RADIUS * Math.sqrt(item.value / maximum));
        const from = -Math.PI / 2 + index * slice + gap;
        const to = -Math.PI / 2 + (index + 1) * slice - gap;
        const start = at(reach, from);
        const end = at(reach, to);
        const middle = (from + to) / 2;
        const label = at(LABEL, middle);
        const cos = Math.cos(middle);
        const anchor = cos > 0.25 ? "start" : cos < -0.25 ? "end" : "middle";
        const active = hover === index;
        const dimmed = hover !== null && !active;
        return (
          <g
            key={item.key}
            onPointerEnter={() => setHover(index)}
            className={`transition-opacity ${dimmed ? "opacity-35" : ""}`}
          >
            <title>{`${item.label}: ${number(item.value)} (${share(item.value)})`}</title>
            <path
              d={`M${CX},${CY} L${start.x},${start.y} A${reach},${reach} 0 0 1 ${end.x},${end.y} Z`}
              fill={`var(--color-${colors[index % colors.length]})`}
              fillOpacity={active ? 1 : 0.88}
              className="stroke-white dark:stroke-gray-900"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <text
              x={label.x}
              y={label.y}
              textAnchor={anchor}
              className="text-theme-sm"
            >
              <tspan
                x={label.x}
                className={
                  active
                    ? "fill-gray-950 font-medium dark:fill-white"
                    : "fill-gray-600 dark:fill-gray-400"
                }
              >
                {clip(item.label)}
              </tspan>
              <tspan
                x={label.x}
                dy="1.25em"
                fill="currentColor"
                className="font-bold tabular-nums"
              >
                {number(item.value)}
              </tspan>
            </text>
          </g>
        );
      })}
    </svg>
  );
}
