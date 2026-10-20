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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-theme-xs font-medium whitespace-nowrap ${active ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400" : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400"}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {t(labels[kind][active ? 1 : 0])}
    </span>
  );
}
