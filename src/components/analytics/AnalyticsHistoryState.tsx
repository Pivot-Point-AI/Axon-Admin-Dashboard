"use client";

import { useTranslations } from "next-intl";
import AnalyticsEmptyState from "./AnalyticsEmptyState";

interface AnalyticsHistoryStateProps {
  loading: boolean;
  failed: boolean;
  message?: string;
}

export default function AnalyticsHistoryState({
  loading,
  failed,
}: AnalyticsHistoryStateProps) {
  const t = useTranslations("analytics");
  if (!loading && !failed) return <AnalyticsEmptyState />;
  return (
    <p
      role={failed ? "alert" : "status"}
      className="flex min-h-40 items-center justify-center rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/20 dark:text-gray-300"
    >
      {t(failed ? "loadFailed" : "loading")}
    </p>
  );
}
