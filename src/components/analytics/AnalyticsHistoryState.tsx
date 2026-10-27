"use client";

import { useTranslations } from "next-intl";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import Button from "@/components/ui/button/Button";

interface AnalyticsHistoryStateProps {
  loading: boolean;
  failed: boolean;
  message?: string;
  onRetry?: () => void;
}

export default function AnalyticsHistoryState({
  loading,
  failed,
  message,
  onRetry,
}: AnalyticsHistoryStateProps) {
  const t = useTranslations("analytics");
  if (!loading && !failed) return <AnalyticsEmptyState message={message} />;
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/20 dark:text-gray-300">
      <p role={failed ? "alert" : "status"}>
        {t(failed ? "loadFailed" : "loading")}
      </p>
      {failed && onRetry && (
        <Button size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
}
