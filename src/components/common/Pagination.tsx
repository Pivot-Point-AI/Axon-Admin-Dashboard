"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import type { PaginationControls } from "@/hooks/usePagination";
import Button from "@/components/ui/button/Button";

interface PaginationProps {
  pagination: PaginationControls;
  disabled?: boolean;
  variant?: "header" | "footer" | "full";
}

export default function Pagination({
  pagination,
  disabled = false,
  variant = "full",
}: PaginationProps) {
  const t = useTranslations("pagination");
  const id = useId();
  const { page, pageSize, pageCount, total, start, end, setPage, setPageSize } =
    pagination;
  const firstPage = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from(
    { length: Math.min(5, pageCount) },
    (_, i) => firstPage + i,
  );

  return (
    <nav
      aria-label={t(variant === "header" ? "tableControls" : "label")}
      className={
        variant === "header"
          ? "mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-800/30"
          : "mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800"
      }
    >
      {variant === "footer" ? (
        <p className="text-theme-xs text-gray-500 dark:text-gray-400">
          {t("pageCount", { page, total: pageCount })}
        </p>
      ) : (
        <>
          <p
            aria-live="polite"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("range", { start, end, total })}
          </p>
          <label
            htmlFor={id}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
          >
            {t("rowsPerPage")}
            <select
              id={id}
              value={pageSize}
              disabled={disabled}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 focus-visible:outline-2 focus-visible:outline-brand-400 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {[10, 20, 30, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
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
