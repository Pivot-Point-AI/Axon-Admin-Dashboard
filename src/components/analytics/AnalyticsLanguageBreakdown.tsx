"use client";

import { useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { GlobeIcon } from "@/icons";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import { languageName, languageRows } from "./analyticsData";

const colors = [
  "var(--color-brand-500)",
  "var(--color-blue-light-400)",
  "var(--color-theme-purple-500)",
  "var(--color-success-500)",
  "var(--color-orange-400)",
  "var(--color-gray-400)",
];
const bars = [
  "bg-brand-500 dark:bg-brand-400",
  "bg-blue-light-400 dark:bg-blue-light-400",
  "bg-theme-purple-500 dark:bg-theme-purple-500",
  "bg-success-500 dark:bg-success-400",
  "bg-orange-400 dark:bg-orange-400",
  "bg-gray-400 dark:bg-gray-500",
];

interface AnalyticsLanguageBreakdownProps {
  value: unknown;
}

export default function AnalyticsLanguageBreakdown({
  value,
}: AnalyticsLanguageBreakdownProps) {
  const t = useTranslations("analytics");
  const locale = useLocale();
  const format = useFormatter();
  const [expanded, setExpanded] = useState(false);
  const { rows, total } = languageRows(value);
  const gradient = rows
    .map((row, index) => {
      const previous = rows
        .slice(0, index)
        .reduce((sum, entry) => sum + entry.count, 0);
      const start = total > 0 ? (previous / total) * 360 : 0;
      const end = total > 0 ? ((previous + row.count) / total) * 360 : 0;
      return `${colors[index % colors.length]} ${start}deg ${end}deg`;
    })
    .join(", ");
  return (
    <ComponentCard
      title={t("design.languageTitle")}
      description={t("design.languageDescription")}
      icon={<GlobeIcon />}
      className="h-full"
    >
      {total === 0 ? (
        <AnalyticsEmptyState />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-center gap-6 py-3 sm:gap-8">
            <div
              aria-hidden="true"
              className="relative flex size-44 shrink-0 items-center justify-center rounded-full 2xl:size-48"
              style={{ background: `conic-gradient(${gradient})` }}
            >
              <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white dark:bg-gray-900">
                <span className="text-title-sm font-semibold tracking-tight text-gray-900 tabular-nums dark:text-white">
                  {format.number(total)}
                </span>
                <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                  {t("design.users")}
                </span>
              </div>
            </div>
            <div className="min-w-40 flex-1 space-y-4">
              <div className="flex items-center justify-between text-theme-xs font-medium text-gray-400 dark:text-gray-500">
                <span>{t("design.language")}</span>
                <span>{t("design.usersAndShare")}</span>
              </div>
              {(expanded ? rows : rows.slice(0, 5)).map((row, index) => (
                <div key={row.key}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`size-2 shrink-0 rounded-full ${bars[index % bars.length]}`}
                      />
                      <span className="truncate font-medium text-gray-800 dark:text-gray-200">
                        {row.key === "unknown"
                          ? t("design.unspecified")
                          : languageName(row.key, locale)}
                      </span>
                    </div>
                    <span className="shrink-0 text-gray-700 tabular-nums dark:text-gray-300">
                      {format.number(row.count)}{" "}
                      <span className="ms-2 text-theme-xs text-gray-400 dark:text-gray-500">
                        {format.number((row.percentage ?? 0) / 100, {
                          style: "percent",
                          maximumFractionDigits: 1,
                        })}
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-full rounded-full ${bars[index % bars.length]}`}
                      style={{
                        width: `${Math.min(100, Math.max(0, row.percentage ?? 0))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-theme-purple-500/5 p-4 text-sm text-gray-500 dark:bg-theme-purple-500/10 dark:text-gray-400">
            <span>
              {t("design.languagesCount", {
                count: rows.filter((row) => row.key !== "unknown").length,
              })}
            </span>
            <span>
              {t("design.totalUsers", { count: format.number(total) })}
            </span>
            {rows.length > 5 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-brand-300 dark:hover:text-brand-200"
              >
                {t(expanded ? "design.showLess" : "design.showAll")}
              </button>
            )}
          </div>
        </>
      )}
    </ComponentCard>
  );
}
