"use client";

import { useTranslations } from "next-intl";
import { PieChartIcon } from "@/icons";

interface AnalyticsEmptyStateProps {
  message?: string;
}

export default function AnalyticsEmptyState({
  message,
}: AnalyticsEmptyStateProps) {
  const t = useTranslations("analytics");
  return (
    <div className="flex min-h-40 flex-col items-center justify-center px-4 py-8 text-center">
      <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
        <PieChartIcon className="size-5" />
      </span>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {message ?? t("empty")}
      </p>
      <p className="mt-1 max-w-sm text-theme-xs leading-5 text-gray-400 dark:text-gray-500">
        {t("design.emptyHint")}
      </p>
    </div>
  );
}
