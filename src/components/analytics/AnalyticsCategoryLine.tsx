"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useFormatter } from "next-intl";

export interface AnalyticsCategoryPoint {
  key: string;
  label: string;
  value: number;
}

interface AnalyticsCategoryLineProps {
  points: AnalyticsCategoryPoint[];
  /** CSS color token without the prefix, e.g. "brand-500". */
  token?: string;
  axisSteps?: number;
}

const HEIGHT = 260;
const PAD = { left: 52, right: 20, top: 30, bottom: 64 };
// Each category keeps at least this much room so its name stays readable.
const MIN_SLOT = 92;

/** A smooth line over named categories, with the value on every point. */
export default function AnalyticsCategoryLine({
  points,
  token = "brand-500",
  axisSteps = 4,
}: AnalyticsCategoryLineProps) {
  const format = useFormatter();
  const gradient = useId();
  const box = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setAvailable(entry.contentRect.width),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const width = Math.max(
    available,
    available > 0 ? PAD.left + PAD.right + points.length * MIN_SLOT : 0,
  );
  const maximum = Math.max(1, ...points.map((point) => point.value)) * 1.1;
  const magnitude = 10 ** Math.floor(Math.log10(maximum / axisSteps));
  const step =
    [1, 2, 2.5, 5, 10]
      .map((value) => value * magnitude)
      .find((value) => value >= maximum / axisSteps) ?? magnitude * 10;
  const limit = step * axisSteps;
  const plotWidth = Math.max(0, width - PAD.left - PAD.right);
  const plotBottom = HEIGHT - PAD.bottom;
  const slot = points.length ? plotWidth / points.length : 0;
  const x = (index: number) => PAD.left + slot * (index + 0.5);
  const y = (value: number) =>
    plotBottom - (value / limit) * (plotBottom - PAD.top);

  let line = "";
  points.forEach((point, index) => {
    if (index === 0) {
      line = `M${x(0)},${y(point.value)}`;
      return;
    }
    const middle = (x(index - 1) + x(index)) / 2;
    line += ` C${middle},${y(points[index - 1].value)} ${middle},${y(point.value)} ${x(index)},${y(point.value)}`;
  });
  const area = points.length
    ? `${line} L${x(points.length - 1)},${plotBottom} L${x(0)},${plotBottom} Z`
    : "";
  const compact = (value: number) =>
    format.number(value, { notation: "compact", maximumFractionDigits: 1 });
  const color = `var(--color-${token})`;

  return (
    <div ref={box} className="custom-scrollbar w-full overflow-x-auto pb-2">
      <div
        className="relative"
        style={{ height: HEIGHT, width: width || undefined }}
        onPointerLeave={() => setHover(null)}
      >
        {width > 0 && (
          <>
            <svg
              width={width}
              height={HEIGHT}
              role="img"
              aria-label={points
                .map(
                  (point) =>
                    `${point.label}: ${format.number(point.value, { maximumFractionDigits: 2 })}`,
                )
                .join(", ")}
              className="block overflow-visible text-gray-950 dark:text-white"
            >
              <defs>
                <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {Array.from({ length: axisSteps + 1 }, (_, tick) => (
                <g key={tick}>
                  <line
                    x1={PAD.left}
                    x2={width - PAD.right}
                    y1={y(tick * step)}
                    y2={y(tick * step)}
                    className="stroke-gray-100 dark:stroke-gray-800"
                  />
                  <text
                    x={PAD.left - 10}
                    y={y(tick * step)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-gray-500 text-theme-xs dark:fill-gray-400"
                  >
                    {compact(tick * step)}
                  </text>
                </g>
              ))}
              {hover !== null && (
                <line
                  x1={x(hover)}
                  x2={x(hover)}
                  y1={PAD.top}
                  y2={plotBottom}
                  strokeDasharray="3 4"
                  className="stroke-gray-300 dark:stroke-gray-600"
                />
              )}
              <path d={area} fill={`url(#${gradient})`} />
              <path
                d={line}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((point, index) => (
                <g key={point.key}>
                  <circle
                    cx={x(index)}
                    cy={y(point.value)}
                    r={hover === index ? 6 : 4.5}
                    fill={color}
                    className="stroke-white dark:stroke-gray-900"
                    strokeWidth="2"
                  />
                  <text
                    x={x(index)}
                    y={y(point.value) - 12}
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-theme-xs font-semibold tabular-nums"
                  >
                    {format.number(point.value, { maximumFractionDigits: 2 })}
                  </text>
                  <rect
                    x={x(index) - slot / 2}
                    y={PAD.top}
                    width={slot}
                    height={plotBottom - PAD.top}
                    fill="transparent"
                    onPointerEnter={() => setHover(index)}
                  />
                </g>
              ))}
            </svg>
            {points.map((point, index) => (
              <span
                key={point.key}
                className={`absolute text-center text-theme-xs leading-4 break-words ${
                  hover === index
                    ? "font-medium text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400"
                }`}
                style={{
                  left: x(index) - slot / 2,
                  width: slot,
                  top: plotBottom + 12,
                }}
              >
                {point.label}
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
