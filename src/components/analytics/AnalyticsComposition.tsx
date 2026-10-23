"use client";

import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import { useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { ChatIcon, CheckCircleIcon } from "@/icons";
import type { AnalyticsSection } from "@/lib/api/analytics";
import AnalyticsDonutChart from "./AnalyticsDonutChart";
import { analyticsNumber } from "./analyticsData";

interface AnalyticsCompositionProps {
  section: AnalyticsSection;
  data: Record<string, unknown>;
}

export default function AnalyticsComposition({
  section,
  data,
}: AnalyticsCompositionProps) {
  const t = useTranslations("analytics");
  if (section !== "chats" && section !== "logs") return null;
  const fields =
    section === "chats"
      ? ["total_user_messages", "total_assistant_messages"]
      : ["turn_success_count", "turn_failed_count"];
  const values = fields.flatMap((key) => {
    const count = analyticsNumber(data[key]);
    return count !== null && count >= 0 ? [{ key, count }] : [];
  });
  if (!values.length) return null;
  const sum = values.reduce((value, row) => value + row.count, 0);
  // The ring splits only the two groups shown, so it always adds up to 100%.
  const total = sum;
  const rows = values.map((row) => ({
    ...row,
    percentage: total > 0 ? (row.count / total) * 100 : null,
  }));
  return (
    <ComponentCard
      title={t(
        section === "chats" ? "design.messageMix" : "design.turnOutcomes",
      )}
      description={t(
        section === "chats"
          ? "design.messageMixDescription"
          : "design.turnOutcomesDescription",
      )}
      icon={section === "chats" ? <ChatIcon /> : <CheckCircleIcon />}
      actions={<AnalyticsJourneyPeriod />}
      className="h-full"
    >
      <AnalyticsDonutChart
        rows={rows}
        variant="donut"
        total={total}
        label={(key) => t(`fields.${key}`)}
        color={(key, index) =>
          key === "turn_failed_count"
            ? "var(--color-error-500)"
            : section === "chats"
              ? ["var(--color-brand-600)", "var(--color-blue-light-400)"][
                  index % 2
                ]
              : "var(--color-success-500)"
        }
      />
    </ComponentCard>
  );
}
