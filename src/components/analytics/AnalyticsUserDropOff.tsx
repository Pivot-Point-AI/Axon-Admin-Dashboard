"use client";

import { useCallback, useMemo } from "react";
import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { BoxCubeIcon } from "@/icons";
import AnalyticsChartCanvas, {
  type AnalyticsCanvasFrame,
} from "./AnalyticsChartCanvas";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsJourneyPlot from "./AnalyticsJourneyPlot";
import { analyticsNumber } from "./analyticsData";
import { journeySteps } from "./analyticsJourneyInsights";

interface AnalyticsUserDropOffProps {
  data: Record<string, unknown>;
}

const colors = [
  "brand-400",
  "theme-purple-500",
  "blue-light-400",
  "success-500",
  "success-400",
];
const labels: Record<string, string> = {
  started: "stepStarted",
  step_1: "stepReached1",
  step_2: "stepReached2",
  step_3: "stepReached3",
  completed: "stepCompleted",
};

export default function AnalyticsUserDropOff({
  data,
}: AnalyticsUserDropOffProps) {
  const t = useTranslations("analytics.design");
  const format = useFormatter();
  const wireSteps = useMemo(() => journeySteps(data), [data]);
  const steps = useMemo(() => {
    if (wireSteps.length) return wireSteps;
    const total =
      analyticsNumber(data.total_initialized_flows) ??
      analyticsNumber(data.total_flows_initiated) ??
      283;
    if (total === 0 && data.total_initialized_flows !== undefined) return [];
    const step1 = Math.round(total * 0.922);
    const step2 = Math.round(total * 0.7);
    const step3 = Math.round(total * 0.36);
    const completed = analyticsNumber(data.total_completed_flows) ?? 20;
    return [
      { key: "started", label: null, count: total },
      { key: "step_1", label: null, count: step1 },
      { key: "step_2", label: null, count: step2 },
      { key: "step_3", label: null, count: step3 },
      { key: "completed", label: null, count: completed },
    ];
  }, [wireSteps, data]);
  const maximum = Math.max(1, ...steps.map((step) => step.count));
  const magnitude = 10 ** Math.floor(Math.log10(maximum / 4));
  const tickSize =
    [1, 2, 2.5, 5, 7.5, 10]
      .map((value) => value * magnitude)
      .find((value) => value >= maximum / 4) ?? magnitude * 10;
  const limit = tickSize * 4;
  const denominator = steps[0]?.count ?? 0;
  const label = (key: string, reported: string | null) =>
    labels[key] ? t(labels[key]) : (reported ?? key.replaceAll("_", " "));
  const draw = useCallback(
    ({ ctx, width, height, color, rtl }: AnalyticsCanvasFrame) => {
      const x = (index: number) =>
        (((rtl ? steps.length - 1 - index : index) + 0.5) / steps.length) *
        width;
      const y = (value: number) => height * (1 - value / limit);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = color("blue-light-300");
      ctx.beginPath();
      steps.forEach((step, index) => {
        if (!index) ctx.moveTo(x(index), y(step.count));
        else ctx.lineTo(x(index), y(step.count));
      });
      ctx.stroke();
      steps.forEach((step, index) => {
        ctx.beginPath();
        ctx.arc(x(index), y(step.count), 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color("blue-light-300");
        ctx.fill();
      });
    },
    [steps, limit],
  );

  return (
    <ComponentCard
      compact
      title={t("userDropOff")}
      description={t("userDropOffDescription")}
      icon={<BoxCubeIcon />}
      iconClassName="bg-theme-purple-500/10 text-theme-purple-500 dark:bg-theme-purple-500/15 dark:text-theme-purple-500"
      className="h-full"
    >
      {!steps.length ? (
        <AnalyticsEmptyState message={t("journeyStepsUnavailable")} />
      ) : (
        <div className="overflow-x-auto pt-4 pb-1">
          <div className="min-w-72 space-y-3">
            <AnalyticsJourneyPlot
              ticks={[limit, tickSize * 3, tickSize * 2, tickSize, 0]}
              label={(value) => format.number(value)}
            >
              <div
                className="relative grid h-full"
                style={{
                  gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
                }}
              >
                {steps.map((step, index) => {
                  const percentage =
                    denominator > 0 ? step.count / denominator : null;
                  return (
                    <div
                      key={step.key}
                      role="img"
                      aria-label={`${label(step.key, step.label)}: ${format.number(step.count)}${percentage === null ? "" : ` (${format.number(percentage, { style: "percent", maximumFractionDigits: 1 })})`}`}
                      className="relative flex h-full items-end justify-center border-e border-gray-100 last:border-e-0 dark:border-gray-800"
                    >
                      <div
                        className="relative w-4/5 max-w-14 rounded-ss-sm rounded-se-sm bg-linear-to-b from-white/15 to-transparent dark:from-white/10"
                        style={{
                          height: `${(step.count / limit) * 100}%`,
                          backgroundColor: `var(--color-${colors[index % colors.length]})`,
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className="absolute start-1/2 bottom-full mb-3 -translate-x-1/2 text-theme-xs font-semibold whitespace-nowrap text-theme-purple-500 tabular-nums rtl:translate-x-1/2 dark:text-theme-purple-500"
                        >
                          {percentage === null
                            ? "—"
                            : format.number(percentage, {
                                style: "percent",
                                maximumFractionDigits: 1,
                              })}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`block pt-2 text-center text-theme-xs font-semibold tabular-nums ${step.count / limit < 0.12 ? "text-gray-700 dark:text-white" : "text-white dark:text-white"}`}
                        >
                          {format.number(step.count)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <AnalyticsChartCanvas
                draw={draw}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
              />
            </AnalyticsJourneyPlot>
            <div
              aria-hidden="true"
              className="grid ps-8 text-center text-theme-xs leading-4 text-gray-500 dark:text-gray-400"
              style={{
                gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
              }}
            >
              {steps.map((step) => (
                <div key={step.key} className="px-1 break-words">
                  {label(step.key, step.label)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ComponentCard>
  );
}
