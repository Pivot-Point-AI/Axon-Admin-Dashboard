"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import Pagination, { RowsPerPage } from "@/components/common/Pagination";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {
  ChevronDownIcon,
  DocsIcon,
  PlusIcon,
  SearchOutlineIcon,
} from "@/icons";
import usePagination from "@/hooks/usePagination";
import FaqQuestion from "./FaqQuestion";
import type { FAQItem } from "./faqData";
import { toolbarButtonClass } from "@/components/form/toolbarControls";

interface FaqQuestionsPanelProps {
  items: FAQItem[] | null;
  selected: string | null;
  loading: boolean;
  error: string;
  busyId: number | null;
  onCreate: () => void;
  onEdit: (item: FAQItem) => void;
  onDelete: (item: FAQItem) => void;
  onSelectSection: (section: string | null) => void;
  /** Extra toolbar action shown before the Add button, e.g. "Edit header". */
  headerAction?: ReactNode;
}

export default function FaqQuestionsPanel({
  items,
  selected,
  loading,
  error,
  busyId,
  onCreate,
  onEdit,
  onDelete,
  onSelectSection,
  headerAction,
}: FaqQuestionsPanelProps) {
  const t = useTranslations("faqs");
  const statusText = useTranslations("status");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const sections = [
    ...new Set((items ?? []).map((item) => item.section_title)),
  ];
  const filtered = (items ?? []).filter(
    (item) =>
      (selected === null || item.section_title === selected) &&
      (status === "all" ||
        (item.is_active ?? true) === (status === "active")) &&
      `${item.section_title} ${item.question} ${item.answer}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const pagination = usePagination(
    filtered,
    JSON.stringify([query, status, selected]),
  );
  const hasFilters =
    query.trim() !== "" || status !== "all" || selected !== null;
  const selectClass =
    "h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white ps-3 pe-9 text-theme-xs font-medium text-gray-700 shadow-theme-xs transition-colors hover:border-gray-300 focus-visible:outline-2 focus-visible:outline-brand-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600";
  const selectChevron = (
    <ChevronDownIcon
      aria-hidden="true"
      className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
    />
  );
  return (
    <section className="axon-panel min-w-0 p-4 sm:p-5">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 grow basis-60">
          <SearchOutlineIcon
            aria-hidden="true"
            className="pointer-events-none absolute start-3.5 top-1/2 z-1 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <Input
            aria-label={t("search")}
            placeholder={t("design.searchPlaceholder")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9! rounded-lg! ps-10 text-theme-xs"
          />
        </div>
        <div className="relative min-w-0 grow sm:w-44 sm:grow-0">
          <select
            aria-label={t("design.statusFilter")}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={selectClass}
          >
            <option value="all">{t("design.allStatuses")}</option>
            <option value="active">{statusText("active")}</option>
            <option value="inactive">{statusText("inactive")}</option>
          </select>
          {selectChevron}
        </div>
        <div className="relative min-w-0 grow sm:w-52 sm:grow-0 xl:hidden">
          <select
            aria-label={t("design.sectionFilter")}
            value={selected ?? ""}
            onChange={(event) => onSelectSection(event.target.value || null)}
            className={selectClass}
          >
            <option value="">{t("design.allSections")}</option>
            {sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
          {selectChevron}
        </div>
        <RowsPerPage pagination={pagination} disabled={loading} />
        <div className="ms-auto flex flex-wrap items-center gap-2">
          <span className="contents xl:hidden">{headerAction}</span>
          <Button
            size="sm"
            className={toolbarButtonClass}
            disabled={items === null || loading || busyId !== null}
            startIcon={<PlusIcon aria-hidden="true" className="size-4" />}
            onClick={onCreate}
          >
            {t("add")}
          </Button>
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
        >
          {error}
        </p>
      )}
      {items !== null && filtered.length > 0 && (
        <Pagination
          variant="header"
          pagination={pagination}
          disabled={loading}
          showRows={false}
        />
      )}
      <div aria-busy={loading} className="space-y-3">
        {loading && items === null ? (
          <>
            <p role="status" className="sr-only">
              {t("loading")}
            </p>
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="h-40 animate-pulse rounded-xl border border-gray-100 bg-gray-50 p-5 motion-reduce:animate-none dark:border-gray-800 dark:bg-gray-800/50"
              >
                <div className="mb-4 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mb-3 h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </>
        ) : !filtered.length ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-6 text-center dark:border-gray-700">
            <span
              aria-hidden="true"
              className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-300"
            >
              <DocsIcon className="size-6" />
            </span>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              {t(
                error && items === null
                  ? "design.loadError"
                  : hasFilters
                    ? "design.noMatches"
                    : "design.noQuestions",
              )}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
              {t(
                error && items === null
                  ? "design.retryHint"
                  : hasFilters
                    ? "design.noMatchesHint"
                    : "design.noQuestionsHint",
              )}
            </p>
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 h-10"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                  onSelectSection(null);
                }}
              >
                {t("design.clearFilters")}
              </Button>
            )}
          </div>
        ) : (
          pagination.items.map((item, index) => (
            <FaqQuestion
              key={item.id ?? `${item.section_title}:${index}`}
              item={item}
              busy={loading || busyId !== null}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item)}
            />
          ))
        )}
      </div>
      {items !== null && filtered.length > 0 && (
        <Pagination
          variant="footer"
          pagination={pagination}
          disabled={loading}
        />
      )}
    </section>
  );
}
