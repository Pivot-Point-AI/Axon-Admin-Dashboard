"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import type { PaginationControls } from "@/hooks/usePagination";
import Button from "@/components/ui/button/Button";

interface PaginationProps {
  pagination: PaginationControls;
  disabled?: boolean;
  variant?: "header" | "footer" | "full";
  /** Hide the rows-per-page select when a toolbar renders <RowsPerPage />. */
  showRows?: boolean;
}

export function RowsPerPage({
  pagination,
  disabled = false,
}: Pick<PaginationProps, "pagination" | "disabled">) {
  const t = useTranslations("pagination");
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="flex shrink-0 items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
    >
      {t("rowsPerPage")}
      <select
        id={id}
        value={pagination.pageSize}
        disabled={disabled}
        onChange={(event) => pagination.setPageSize(Number(event.target.value))}
        className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus-visible:outline-2 focus-visible:outline-brand-400 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
      >
        {[10, 20, 30, 50, 100].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Pagination({
  pagination,
  disabled = false,
  variant = "full",
  showRows = true,
}: PaginationProps) {
  const t = useTranslations("pagination");
  const { page, pageCount, setPage } = pagination;
  const firstPage = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from(
    { length: Math.min(5, pageCount) },
    (_, i) => firstPage + i,
  );

  // The toolbar owns the page-size control, so the summary bar is not needed.
  if (variant === "header" && !showRows) return null;

  return (
    <nav
      aria-label={t(variant === "header" ? "tableControls" : "label")}
      className={
        variant === "header"
          ? "mb-3 flex flex-wrap items-center justify-end gap-3"
          : "mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800"
      }
    >
      {variant === "footer" ? (
        <p className="text-theme-xs text-gray-500 dark:text-gray-400">
          {t("pageCount", { page, total: pageCount })}
        </p>
      ) : (
        <>
          {showRows && (
            <RowsPerPage pagination={pagination} disabled={disabled} />
          )}
        </>
      )}
      {variant !== "header" && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 px-3 py-0"
            disabled={disabled || page <= 1}
            onClick={() => setPage(page - 1)}
          >
            {t("previous")}
          </Button>
          {pages.map((number) => (
            <button
              key={number}
              type="button"
              aria-label={t("goToPage", { page: number })}
              aria-current={number === page ? "page" : undefined}
              disabled={disabled}
              onClick={() => setPage(number)}
              className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:opacity-50 ${number === page ? "bg-brand-500 text-white dark:bg-brand-500 dark:text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
            >
              {number}
            </button>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 px-3 py-0"
            disabled={disabled || page >= pageCount}
            onClick={() => setPage(page + 1)}
          >
            {t("next")}
          </Button>
        </div>
      )}
    </nav>
  );
}
