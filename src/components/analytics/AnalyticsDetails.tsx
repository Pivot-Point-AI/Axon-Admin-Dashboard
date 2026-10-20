"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronDownIcon, TableIcon } from "@/icons";

interface AnalyticsDetailsProps {
  children: ReactNode;
}

export default function AnalyticsDetails({ children }: AnalyticsDetailsProps) {
  const t = useTranslations("analytics");
  return (
    <details className="group mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-lg px-2 text-theme-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-300 [&::-webkit-details-marker]:hidden">
        <TableIcon
          aria-hidden="true"
          className="size-4 text-gray-400 dark:text-gray-500"
        />
        {t("design.viewData")}
        <ChevronDownIcon
          aria-hidden="true"
          className="ms-auto size-4 shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="mt-3 min-w-0">{children}</div>
    </details>
  );
}
