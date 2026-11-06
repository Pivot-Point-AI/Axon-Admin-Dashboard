"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import ActionIconButton from "@/components/ui/button/ActionIconButton";
import { ChevronDownIcon, PencilIcon, TrashBinIcon } from "@/icons";
import type { FAQItem } from "./faqData";

interface FaqQuestionProps {
  item: FAQItem;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function FaqQuestion({
  item,
  busy,
  onEdit,
  onDelete,
}: FaqQuestionProps) {
  const t = useTranslations("faqs.design");
  const status = useTranslations("status");
  const answerId = useId();
  const [expanded, setExpanded] = useState(false);
  const active = item.is_active ?? true;
  return (
    <article
      className={`group relative rounded-xl border bg-white p-5 shadow-theme-xs transition-all hover:shadow-theme-sm dark:bg-gray-900 ${expanded ? "border-brand-200 ring-1 ring-brand-100 dark:border-brand-700 dark:ring-brand-500/20" : "border-gray-200 hover:border-brand-200 dark:border-gray-800 dark:hover:border-gray-700"}`}
    >
      <div className="mb-3 flex min-h-8 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2 pe-24">
          <span className="rounded-md bg-brand-50 px-2.5 py-1 text-theme-xs font-medium tracking-wide break-words text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            {item.section_title}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-theme-xs font-medium ${active ? "text-success-600 dark:text-success-400" : "text-gray-500 dark:text-gray-400"}`}
          >
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${active ? "bg-success-500" : "bg-gray-400"}`}
            />
            {status(active ? "active" : "inactive")}
          </span>
        </div>
        <div className="absolute end-5 top-5 flex items-center gap-2">
          <ActionIconButton
            tone="edit"
            title={t("editQuestion", { question: item.question })}
            disabled={busy || item.id == null}
            onClick={onEdit}
          >
            <PencilIcon className="size-4" />
          </ActionIconButton>
          <ActionIconButton
            tone="delete"
            title={t("deleteQuestion", { question: item.question })}
            disabled={busy || item.id == null}
            onClick={onDelete}
          >
            <TrashBinIcon className="size-4" />
          </ActionIconButton>
        </div>
      </div>
      <h3>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={answerId}
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-start justify-between gap-4 text-start text-base font-semibold text-gray-950 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-white/90"
        >
          <span className="min-w-0 break-words">{item.question}</span>
          <ChevronDownIcon
            aria-hidden="true"
            className={`mt-0.5 size-5 shrink-0 text-gray-400 transition-transform group-hover:text-brand-500 dark:text-gray-500 ${expanded ? "rotate-180 text-brand-500" : ""}`}
          />
        </button>
      </h3>
      {!expanded && (
        <p
          aria-hidden="true"
          className="mt-2 line-clamp-2 text-sm leading-6 break-words text-gray-500 dark:text-gray-400"
        >
          {item.answer}
        </p>
      )}
      <div
        id={answerId}
        hidden={!expanded}
        className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50"
      >
        <p className="text-sm leading-7 break-words whitespace-pre-wrap text-gray-600 dark:text-gray-300">
          {item.answer}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-theme-xs">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={answerId}
          onClick={() => setExpanded(!expanded)}
          className="font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-brand-300 dark:hover:text-brand-200"
        >
          {t(expanded ? "hideAnswer" : "viewAnswer")}
        </button>
      </div>
    </article>
  );
}
