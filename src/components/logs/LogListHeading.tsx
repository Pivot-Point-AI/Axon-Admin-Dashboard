"use client";
import { useTranslations } from "next-intl";
export default function LogListHeading() {
  const t = useTranslations("managementDesign");
  return (
    <div
      aria-hidden="true"
      className="axon-log-list-heading hidden gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 text-theme-xs font-medium text-gray-500 lg:grid dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"
    >
      <span>{t("timestamp")}</span>
      <span>{t("level")}</span>
      <span>{t("event")}</span>
      <span>{t("context")}</span>
      <span />
    </div>
  );
}
