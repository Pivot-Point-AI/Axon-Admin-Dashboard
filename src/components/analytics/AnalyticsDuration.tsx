"use client";

import { useFormatter, useTranslations } from "next-intl";

interface AnalyticsDurationProps {
  milliseconds: number;
  prominent?: boolean;
}

export default function AnalyticsDuration({
  milliseconds,
  prominent = false,
}: AnalyticsDurationProps) {
  const format = useFormatter();
  const t = useTranslations("analytics");
  const seconds = milliseconds >= 1000;
  const value = seconds ? milliseconds / 1000 : milliseconds;
  return (
    <span
      className="inline-flex items-baseline gap-1 whitespace-nowrap tabular-nums"
      title={`${format.number(milliseconds, { maximumFractionDigits: 6 })} ${t("design.milliseconds")}`}
    >
      {format.number(value, {
        maximumFractionDigits: value > 0 && value < 0.01 ? 6 : 2,
      })}
      <span
        className={
          prominent
            ? "text-base font-medium text-gray-400 dark:text-gray-500"
            : "text-theme-xs font-normal text-gray-500 dark:text-gray-400"
        }
      >
        {t(seconds ? "latency.seconds" : "design.milliseconds")}
      </span>
    </span>
  );
}
