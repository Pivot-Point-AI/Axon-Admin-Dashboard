"use client";

import CountUpText from "@/components/common/CountUpText";
import { useFormatter, useTranslations } from "next-intl";

interface AnalyticsValueProps {
  value: string | number | boolean | null | undefined;
  field?: string;
}

export default function AnalyticsValue({
  value,
  field = "",
}: AnalyticsValueProps) {
  const format = useFormatter();
  const status = useTranslations("status");
  if (value == null) return <span>—</span>;
  if (typeof value === "boolean")
    return <span>{status(value ? "yes" : "no")}</span>;
  const percent =
    field.endsWith("_pct") ||
    field === "percentage" ||
    field === "average_intent_confidence";
  if (typeof value === "number")
    return (
      <CountUpText
        text={format.number(
          // Confidence arrives as a 0–1 share in some responses, 0–100 in others.
          field === "average_intent_confidence"
            ? value > 1
              ? value / 100
              : value
            : percent
              ? value / 100
              : value,
          {
            style: percent ? "percent" : "decimal",
            maximumFractionDigits: 2,
          },
        )}
      />
    );
  return <span className="break-words">{String(value)}</span>;
}
