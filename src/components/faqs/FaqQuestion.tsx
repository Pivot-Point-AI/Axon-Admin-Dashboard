"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import ActionIconButton from "@/components/ui/button/ActionIconButton";
import Badge from "@/components/ui/badge/Badge";
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
      className={`relative rounded-lg border bg-white p-4 transition-colors sm:ps-16 dark:bg-gray-900 ${expanded ? "border-brand-200 dark:border-brand-700" : "border-brand-100 dark:border-gray-800"}`}
    >
      {item.item_order != null && (
        <span
          aria-hidden="true"
          className="absolute start-4 top-5 hidden size-7 items-center justify-center rounded-lg bg-gray-50 text-sm font-medium text-gray-700 sm:flex dark:bg-gray-800 dark:text-gray-300"
        >
          {item.item_order}
        </span>
      )}
      <div className="mb-2 flex min-h-8 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2 pe-20">
          <span className="rounded-md bg-brand-50 px-2 py-0.5 text-theme-xs font-medium break-words text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            {item.section_title}
          </span>
          <Badge variant="text" size="sm" color={active ? "success" : "light"}>
            {status(active ? "active" : "inactive")}
          </Badge>
        </div>
        <div className="absolute end-4 top-4 flex items-center gap-2">
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
          className="flex w-full items-start justify-between gap-4 text-start text-sm font-semibold text-gray-950 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-white/90"
        >
          <span className="min-w-0 break-words">{item.question}</span>
          <ChevronDownIcon
            aria-hidden="true"
            className={`mt-0.5 size-5 shrink-0 text-gray-400 transition-transform dark:text-gray-500 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      {!expanded && (
        <p
          aria-hidden="true"
          className="mt-1.5 line-clamp-1 text-theme-xs leading-5 break-words text-gray-500 dark:text-gray-400"
        >
          {item.answer}
        </p>
      )}
      <div
        id={answerId}
        hidden={!expanded}
        className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800"
      >
        <p className="text-sm leading-7 break-words whitespace-pre-wrap text-gray-600 dark:text-gray-300">
          {item.answer}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-theme-xs">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={answerId}
          onClick={() => setExpanded(!expanded)}
          className="font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-brand-300 dark:hover:text-brand-200"
        >
          {t(expanded ? "hideAnswer" : "viewAnswer")}
        </button>
        <span className="text-gray-400 dark:text-gray-500">
          {t("questionOrder", { order: item.item_order ?? 0 })}
        </span>
      </div>
    </article>
  );
}
