"use client";

import { useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { ChatIcon, GlobeIcon, GroupIcon } from "@/icons";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import { languageName, languageRows } from "./analyticsData";

const colors = [
  "var(--color-brand-600)",
  "var(--color-blue-light-400)",
  "var(--color-theme-purple-500)",
  "var(--color-success-500)",
  "var(--color-orange-400)",
  "var(--color-gray-400)",
];
const dots = [
  "bg-brand-600 dark:bg-brand-400",
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
  const languageCount = rows.filter((row) => row.key !== "unknown").length;
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
              <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white shadow-xs dark:bg-gray-900">
                <span className="text-2xl font-bold tracking-tight text-gray-900 tabular-nums dark:text-white">
                  {format.number(total)}
                </span>
                <span className="mt-0.5 text-theme-xs font-normal text-gray-500 dark:text-gray-400">
                  Total Users
                </span>
              </div>
            </div>
            <div className="min-w-40 flex-1 space-y-3">
              <div className="flex items-center justify-between text-theme-xs font-medium text-gray-400 dark:text-gray-500">
                <span>{t("design.language")}</span>
                <span>{t("design.usersAndShare")}</span>
              </div>
              {(expanded ? rows : rows.slice(0, 5)).map((row, index) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between gap-3 text-sm py-1"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${dots[index % dots.length]}`}
                    />
                    <span className="truncate font-medium text-gray-800 dark:text-gray-200">
                      {row.key === "unknown"
                        ? t("design.unspecified")
                        : languageName(row.key, locale)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-2">
                    <span className="font-semibold text-gray-800 tabular-nums dark:text-gray-200">
                      {format.number(row.count)}
                    </span>
                    <span className="text-theme-xs text-gray-400 tabular-nums dark:text-gray-500">
                      {format.number((row.percentage ?? 0) / 100, {
                        style: "percent",
                        maximumFractionDigits: 1,
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {rows.length > 5 && (
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="pt-1 text-theme-xs font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-brand-300 dark:hover:text-brand-200"
                >
                  {t(expanded ? "design.showLess" : "design.showAll")}
                </button>
              )}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-theme-purple-500/5 p-3.5 dark:bg-theme-purple-500/10">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-theme-purple-500/15 text-theme-purple-500 dark:bg-theme-purple-500/20 dark:text-theme-purple-400"
              >
                <ChatIcon className="size-4.5" />
              </span>
              <div>
                <span className="block text-xl font-bold tracking-tight text-gray-950 tabular-nums dark:text-white">
                  {languageCount}
                </span>
                <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                  {t("design.languages")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-brand-50/60 p-3.5 dark:bg-brand-500/10">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300"
              >
                <GroupIcon className="size-4.5" />
              </span>
              <div>
                <span className="block text-xl font-bold tracking-tight text-gray-950 tabular-nums dark:text-white">
                  {format.number(total)}
                </span>
                <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                  {t("design.totalUsersLabel")}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </ComponentCard>
  );
}
