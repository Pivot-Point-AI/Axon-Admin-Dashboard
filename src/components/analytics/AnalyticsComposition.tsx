"use client";

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
  const total =
    section === "chats"
      ? Math.max(sum, analyticsNumber(data.total_messages) ?? 0)
      : sum;
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
      className="h-full"
    >
      <AnalyticsDonutChart
        rows={rows}
        total={total}
        label={(key) => t(`fields.${key}`)}
      />
    </ComponentCard>
  );
}
