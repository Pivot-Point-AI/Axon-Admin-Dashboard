"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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

interface AnalyticsManagerProps {
  heading?: ReactNode;
}

export default function AnalyticsManager({ heading }: AnalyticsManagerProps) {
  const t = useTranslations("analytics");
  const { accessToken } = useAdminAuth();
  const [section, setSection] = useState<AnalyticsSection>("users");
  const [telemetryDate, setTelemetryDate] = useState("today");
  const [rangeFilters, setRangeFilters] = useState<Filters>({});
  const navigationRef = useRef<HTMLElement>(null);
  const previousSection = useRef(section);
  useEffect(() => {
    const navigation = navigationRef.current;
    const tab = navigation?.querySelector<HTMLButtonElement>(
      'button[aria-current="page"]',
    );
    if (!navigation || !tab) return;
    if (previousSection.current !== section) tab.focus({ preventScroll: true });
    previousSection.current = section;
    const bounds = tab.getBoundingClientRect();
    const container = navigation.getBoundingClientRect();
    if (bounds.left < container.left || bounds.right > container.right)
      tab.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [section, telemetryDate, rangeFilters]);
  const dated = ["nlp", "performance", "logs"].includes(section);
  const filters: Filters = dated
    ? { date: telemetryDate }
    : section === "chats"
      ? rangeFilters
      : {};
  const navigation = (
    <nav
      ref={navigationRef}
      aria-label={t("sectionsLabel")}
      className="axon-tabs no-scrollbar"
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
  );
  return (
    <div className="space-y-5">
      {accessToken && (
        <AnalyticsSummary
          key={`${section}:${JSON.stringify(filters)}`}
          section={section}
          filters={filters}
          accessToken={accessToken}
          navigation={navigation}
          heading={heading}
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
