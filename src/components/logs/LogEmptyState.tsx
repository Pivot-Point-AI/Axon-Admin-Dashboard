import { useTranslations } from "next-intl";
import { TableIcon } from "@/icons";

export default function LogEmptyState() {
  const t = useTranslations("logViewer");

  return (
    <div
      role="status"
      className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center"
    >
      <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
        <TableIcon aria-hidden="true" className="size-7" />
      </span>
      <p className="text-base font-semibold text-gray-800 dark:text-white/90">
        {t("emptyTitle")}
      </p>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {t("emptyDescription")}
      </p>
    </div>
  );
}
