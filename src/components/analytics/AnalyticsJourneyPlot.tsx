import type { ReactNode } from "react";

interface AnalyticsJourneyPlotProps {
  ticks: number[];
  label: (tick: number) => string;
  tall?: boolean;
  children: ReactNode;
}

export default function AnalyticsJourneyPlot({
  ticks,
  label,
  tall = false,
  children,
}: AnalyticsJourneyPlotProps) {
  return (
    <div className={`flex w-full pt-4 ${tall ? "h-96" : "h-48"}`}>
      <div
        aria-hidden="true"
        className="relative w-11 shrink-0 pe-3 text-end text-theme-xs text-gray-500 dark:text-gray-400"
      >
        {ticks.map((tick, index) => (
          <span
            key={tick}
            className="absolute end-3 -translate-y-1/2 leading-none"
            style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}
          >
            {label(tick)}
          </span>
        ))}
      </div>
      <div className="relative min-w-0 flex-1 border-s border-gray-200 dark:border-gray-700">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex flex-col justify-between"
        >
          {ticks.map((tick) => (
            <div
              key={tick}
              className="w-full border-t border-gray-100 dark:border-gray-800"
            />
          ))}
        </div>
        <div className="axon-reveal-up h-full">{children}</div>
      </div>
    </div>
  );
}
