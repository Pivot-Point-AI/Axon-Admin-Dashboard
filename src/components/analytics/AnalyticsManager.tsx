"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  BoltIcon,
  ChatIcon,
  GroupIcon,
  ShootingStarIcon,
  TableIcon,
  TimeIcon,
} from "@/icons";
import {
  analyticsEndpoints,
  type AnalyticsSection,
  type AnalyticsFilters as Filters,
} from "@/lib/api/analytics";
import AnalyticsFilters from "./AnalyticsFilters";
import AnalyticsSummary from "./AnalyticsSummary";

const sectionIcons = {
  users: GroupIcon,
  chats: ChatIcon,
  flows: BoltIcon,
  nlp: ShootingStarIcon,
  performance: TimeIcon,
  logs: TableIcon,
};

export default function AnalyticsManager() {
  const t = useTranslations("analytics");
  const { accessToken } = useAdminAuth();
  const [section, setSection] = useState<AnalyticsSection>("users");
  const [telemetryDate, setTelemetryDate] = useState("today");
  const [rangeFilters, setRangeFilters] = useState<Filters>({});
  const dated = ["nlp", "performance", "logs"].includes(section);
  const filters: Filters = dated
    ? { date: telemetryDate }
    : section === "chats"
      ? rangeFilters
      : {};
  return (
    <div className="space-y-6">
      <nav
        aria-label={t("sectionsLabel")}
        className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1.5 dark:border-gray-800 dark:bg-white/3"
      >
        {(Object.keys(analyticsEndpoints) as AnalyticsSection[]).map((key) => {
          const Icon = sectionIcons[key];
          return (
            <button
              type="button"
              key={key}
              aria-current={section === key ? "page" : undefined}
              onClick={() => setSection(key)}
              className={`flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-brand-400 sm:grow ${section === key ? "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"}`}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              {t(`sections.${key}`)}
            </button>
          );
        })}
      </nav>
      {accessToken && (
        <AnalyticsSummary
          key={`${section}:${JSON.stringify(filters)}`}
          section={section}
          filters={filters}
          accessToken={accessToken}
          filterControls={
            dated || section === "chats" ? (
              <AnalyticsFilters
                key={`${dated}:${JSON.stringify(filters)}`}
                dated={dated}
                filters={filters}
                onApply={(next) =>
                  dated
                    ? setTelemetryDate(next.date || "today")
                    : setRangeFilters(next)
                }
              />
            ) : undefined
          }
        />
      )}
    </div>
  );
}
