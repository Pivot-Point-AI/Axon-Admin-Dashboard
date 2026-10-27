"use client";

import { valueInfo } from "./analyticsTrends";
import MetricHeader from "@/components/common/MetricHeader";
import CountUpText from "@/components/common/CountUpText";
import AnalyticsSliceHover from "./AnalyticsSliceHover";
import AnalyticsSliceLabels from "./AnalyticsSliceLabels";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
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
  const tInfo = useTranslations("analytics.design.info");
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
      info={valueInfo(value) ?? tInfo("language")}
      actions={<AnalyticsJourneyPeriod />}
      className="flex h-full flex-col"
    >
      {total === 0 ? (
        <AnalyticsEmptyState />
      ) : (
        <div className="flex min-h-80 flex-1 flex-col justify-between">
          <div className="flex flex-wrap items-center justify-center gap-6 py-3 sm:gap-8">
            <div
              key={rows.map((row) => row.count).join(",")}
              aria-hidden="true"
              className="axon-pie-sweep relative size-52 shrink-0 rounded-full"
              style={{ background: `conic-gradient(${gradient})` }}
            >
              <AnalyticsSliceLabels
                rows={rows}
                total={total}
                radius={0.62}
                label={(key) =>
                  key === "unknown"
                    ? t("design.unspecified")
                    : languageName(key, locale)
                }
              />
              <AnalyticsSliceHover
                rows={rows}
                total={total}
                label={(key) =>
                  key === "unknown"
                    ? t("design.unspecified")
                    : languageName(key, locale)
                }
              />
            </div>
            <div className="min-w-40 flex-1 space-y-3">
              <div className="flex items-center justify-between text-theme-xs font-medium text-gray-400 dark:text-gray-500">
                <span>{t("design.language")}</span>
                <span>{t("design.usersAndShare")}</span>
              </div>
              {(expanded ? rows : rows.slice(0, 5)).map((row, index) => (
                <div
                  key={row.key}
                  className="axon-rise-row flex items-center justify-between gap-3 py-1 text-sm"
                  style={{ animationDelay: `${500 + index * 120}ms` }}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${dots[index % dots.length]}`}
                    />
                    <span className="min-w-0 font-medium break-words text-gray-800 dark:text-gray-200">
                      {row.key === "unknown"
                        ? t("design.unspecified")
                        : languageName(row.key, locale)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-2">
                    <span className="font-semibold text-gray-800 tabular-nums dark:text-gray-200">
                      <CountUpText text={format.number(row.count)} />
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
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                label: t("design.languages"),
                value: languageCount,
                icon: <ChatIcon />,
                tone: "bg-brand-50/60 dark:bg-brand-500/10",
              },
              {
                label: t("design.totalUsersLabel"),
                value: total,
                icon: <GroupIcon />,
                tone: "bg-theme-purple-500/5 dark:bg-theme-purple-500/10",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`relative rounded-xl p-3 sm:p-3.5 ${item.tone}`}
              >
                <dt>
                  <MetricHeader label={item.label} icon={item.icon} />
                </dt>
                <dd className="mt-2">
                  <span className="block text-xl font-bold tracking-tight text-gray-950 tabular-nums dark:text-white">
                    <CountUpText text={format.number(item.value)} />
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </ComponentCard>
  );
}
