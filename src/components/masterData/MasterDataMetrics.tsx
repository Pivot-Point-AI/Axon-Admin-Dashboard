"use client";

import { useFormatter, useTranslations } from "next-intl";
import { asBoolean } from "@/utils/boolean";

interface MasterDataMetricsProps {
  items: Record<string, unknown>[];
  loading: boolean;
}

/** Compact record counts for the section header: total, active, inactive. */
export default function MasterDataMetrics({
  items,
  loading,
}: MasterDataMetricsProps) {
  const t = useTranslations("designSystem");
  const format = useFormatter();
  const active = items.filter((item) => asBoolean(item.is_active)).length;
  const stats = [
    {
      key: "total",
      label: t("totalShort"),
      full: t("totalRecords"),
      value: items.length,
      dot: "bg-brand-500",
    },
    {
      key: "active",
      label: t("activeShort"),
      full: t("activeRecords"),
      value: active,
      dot: "bg-success-500",
    },
    {
      key: "inactive",
      label: t("inactiveShort"),
      full: t("inactiveRecords"),
      value: items.length - active,
      dot: "bg-error-500",
    },
  ];
  return (
    <ul aria-busy={loading} className="flex flex-wrap items-center gap-2">
      {stats.map((stat) => (
        <li
          key={stat.key}
          title={stat.full}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-theme-xs text-gray-500 dark:border-gray-800 dark:bg-white/3 dark:text-gray-400"
        >
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${stat.dot}`}
          />
          <span className="font-semibold text-gray-900 tabular-nums dark:text-white/90">
            {loading ? "—" : format.number(stat.value)}
          </span>
          {stat.label}
        </li>
      ))}
    </ul>
  );
}
