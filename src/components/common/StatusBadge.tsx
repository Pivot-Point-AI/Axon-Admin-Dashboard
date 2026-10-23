"use client";

import { useTranslations } from "next-intl";

interface StatusBadgeProps {
  active: boolean;
  kind?: "active" | "enabled" | "yesNo";
}

export default function StatusBadge({
  active,
  kind = "active",
}: StatusBadgeProps) {
  const t = useTranslations("status");
  const labels = {
    active: ["inactive", "active"],
    enabled: ["disabled", "enabled"],
    yesNo: ["no", "yes"],
  } as const;
  return (
    <span
      className={`text-theme-xs font-medium whitespace-nowrap ${active ? "text-success-700 dark:text-success-400" : "text-error-600 dark:text-error-400"}`}
    >
      {t(labels[kind][active ? 1 : 0])}
    </span>
  );
}
