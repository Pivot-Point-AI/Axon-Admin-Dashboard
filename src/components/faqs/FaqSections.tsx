"use client";

import type { ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { FolderIcon, GridIcon } from "@/icons";
import type { FAQItem } from "./faqData";

interface FaqSectionsProps {
  items: FAQItem[];
  selected: string | null;
  onSelect: (section: string | null) => void;
  /** Shown beside the heading, e.g. "Edit header". */
  headerAction?: ReactNode;
}

export default function FaqSections({
  items,
  selected,
  onSelect,
  headerAction,
}: FaqSectionsProps) {
  const t = useTranslations("faqs.design");
  const format = useFormatter();
  const sections = [...new Set(items.map((item) => item.section_title))];
  const options = [
    { name: null, count: items.length },
    ...sections.map((name) => ({
      name,
      count: items.filter((item) => item.section_title === name).length,
    })),
  ];
  return (
    <ComponentCard
      title={t("sections")}
      description={t("sectionsHint")}
      actions={headerAction}
      className="rounded-none border-0 bg-transparent shadow-none dark:bg-transparent"
    >
      <nav aria-label={t("sectionNavigation")} className="space-y-1">
        {options.map(({ name, count }) => (
          <button
            key={name === null ? "all" : `section:${name}`}
            type="button"
            aria-pressed={selected === name}
            onClick={() => onSelect(name)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-theme-sm transition-colors focus-visible:outline-2 focus-visible:outline-brand-400 ${selected === name ? "bg-brand-50 font-semibold text-brand-700 shadow-theme-xs dark:bg-brand-500/15 dark:text-brand-300" : "font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"}`}
          >
            <span
              aria-hidden="true"
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${selected === name ? "bg-white text-brand-600 dark:bg-brand-900 dark:text-brand-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
            >
              {name === null ? (
                <GridIcon className="size-4" />
              ) : (
                <FolderIcon className="size-4" />
              )}
            </span>
            <span className="min-w-0 flex-1 text-theme-xs tracking-wide break-words">
              {name ?? t("allSections")}
            </span>
            <span
              className={`min-w-7 rounded-full px-2 py-0.5 text-center text-theme-xs font-semibold tabular-nums ${selected === name ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
            >
              {format.number(count)}
            </span>
          </button>
        ))}
      </nav>
      <p className="mt-4 rounded-xl bg-brand-25 p-3 text-theme-xs leading-5 text-gray-500 dark:bg-brand-500/10 dark:text-gray-400">
        {t("sectionFootnote")}
      </p>
    </ComponentCard>
  );
}
