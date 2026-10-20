"use client";

import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import { FolderIcon, GridIcon } from "@/icons";
import type { FAQItem } from "./faqData";

interface FaqSectionsProps {
  items: FAQItem[];
  selected: string | null;
  onSelect: (section: string | null) => void;
}

export default function FaqSections({
  items,
  selected,
  onSelect,
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
    <ComponentCard title={t("sections")} description={t("sectionsHint")}>
      <nav
        aria-label={t("sectionNavigation")}
        className="custom-scrollbar max-h-96 space-y-1 overflow-y-auto"
      >
        {options.map(({ name, count }) => (
          <button
            key={name === null ? "all" : `section:${name}`}
            type="button"
            aria-pressed={selected === name}
            onClick={() => onSelect(name)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-start text-sm transition-colors focus-visible:outline-2 focus-visible:outline-brand-400 ${selected === name ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"}`}
          >
            {name === null ? (
              <GridIcon aria-hidden="true" className="size-4 shrink-0" />
            ) : (
              <FolderIcon aria-hidden="true" className="size-4 shrink-0" />
            )}
            <span className="min-w-0 flex-1 break-words">
              {name ?? t("allSections")}
            </span>
            <span
              className={`rounded-md px-1.5 py-0.5 text-theme-xs tabular-nums ${selected === name ? "bg-white text-brand-600 dark:bg-brand-900 dark:text-brand-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
            >
              {format.number(count)}
            </span>
          </button>
        ))}
      </nav>
      <p className="mt-5 border-t border-gray-100 pt-4 text-theme-xs leading-5 text-gray-400 dark:border-gray-800 dark:text-gray-500">
        {t("sectionFootnote")}
      </p>
    </ComponentCard>
  );
}
