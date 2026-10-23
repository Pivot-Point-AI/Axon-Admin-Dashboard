"use client";

import { useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import Pagination from "@/components/common/Pagination";
import usePagination from "@/hooks/usePagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsValue from "./AnalyticsValue";
import { analyticsTableRows } from "./analyticsData";
import { ChevronDownIcon, TableIcon } from "@/icons";

interface AnalyticsDataTableProps {
  field: string;
  value: unknown;
  visualization?: ReactNode;
  embedded?: boolean;
  paginated?: boolean;
  query?: string;
}

export default function AnalyticsDataTable({
  field,
  value,
  visualization,
  embedded = false,
  paginated = false,
  query = "",
}: AnalyticsDataTableProps) {
  const t = useTranslations("analytics");
  const [expanded, setExpanded] = useState(false);
  const tableId = useId();
  const needle = query.trim().toLowerCase();
  const rows = analyticsTableRows(value).filter(
    (row) =>
      !needle ||
      Object.values(row).some(
        (cell) =>
          (typeof cell === "string" || typeof cell === "number") &&
          String(cell).replaceAll("_", " ").toLowerCase().includes(needle),
      ),
  );
  const pagination = usePagination(rows, `${field}:${needle}`, 5);
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const numericColumns = new Set(
    columns.filter(
      (column) =>
        rows.some((row) => typeof row[column] === "number") &&
        rows.every(
          (row) => row[column] == null || typeof row[column] === "number",
        ),
    ),
  );
  const label = (key: string) =>
    key
      .split(".")
      .map((part) =>
        t.has(`columns.${part}`)
          ? t(`columns.${part}`)
          : t.has(`fields.${part}`)
            ? t(`fields.${part}`)
            : part.replaceAll("_", " "),
      )
      .join(" / ");
  const content = (
    <>
      {!rows.length ? (
        <AnalyticsEmptyState
          message={needle ? t("design.noMatches") : undefined}
        />
      ) : (
        <div
          id={tableId}
          role="region"
          aria-label={t(`fields.${field}`)}
          tabIndex={0}
          className="custom-scrollbar max-h-96 overflow-auto rounded-lg border border-gray-100 focus-visible:outline-2 focus-visible:outline-brand-400 dark:border-gray-800"
        >
          <Table>
            <TableHeader className="border-y border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/3">
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    isHeader
                    key={column}
                    className={`sticky top-0 z-1 bg-gray-50 px-4 py-3 text-theme-xs font-medium whitespace-nowrap text-gray-500 capitalize dark:bg-gray-800 dark:text-gray-400 ${numericColumns.has(column) ? "text-end" : "text-start"}`}
                  >
                    {label(column)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {(paginated
                ? pagination.items
                : expanded
                  ? rows
                  : rows.slice(0, 5)
              ).map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => {
                    const value = row[column];
                    const scalar =
                      typeof value === "string" ||
                      typeof value === "number" ||
                      typeof value === "boolean"
                        ? value
                        : null;
                    return (
                      <TableCell
                        key={column}
                        className={`max-w-sm px-4 py-3 align-top text-theme-xs leading-5 break-words text-gray-700 dark:text-gray-300 ${numericColumns.has(column) ? "text-end font-medium tabular-nums" : "text-start"}`}
                      >
                        {typeof scalar === "string" && scalar.length > 150 ? (
                          <details>
                            <summary className="cursor-pointer list-none rounded text-start focus-visible:outline-2 focus-visible:outline-brand-400 [&::-webkit-details-marker]:hidden">
                              <span className="mb-1 line-clamp-2 block text-gray-600 dark:text-gray-400">
                                {scalar.slice(0, 150)}…
                              </span>
                              <span className="font-medium text-brand-600 dark:text-brand-300">
                                {t("design.viewDetails")}
                              </span>
                            </summary>
                            <p className="mt-2 break-words whitespace-pre-wrap">
                              {scalar}
                            </p>
                          </details>
                        ) : (
                          <AnalyticsValue
                            value={
                              column === "name" && typeof scalar === "string"
                                ? label(scalar)
                                : scalar
                            }
                            field={column.split(".").at(-1)}
                          />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {paginated && rows.length > 0 && (
        <Pagination pagination={pagination} variant="footer" />
      )}
      {!paginated && rows.length > 5 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p
            role="status"
            className="text-theme-xs text-gray-500 dark:text-gray-400"
          >
            {t("design.visibleRecords", {
              visible: expanded ? rows.length : 5,
              total: rows.length,
            })}
          </p>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={tableId}
            onClick={() => setExpanded(!expanded)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-theme-xs font-medium text-brand-600 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-brand-300 dark:hover:bg-brand-500/10"
          >
            {t(expanded ? "design.showLess" : "design.showAll")}
            <ChevronDownIcon
              aria-hidden="true"
              className={`size-3.5 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      )}
    </>
  );
  if (embedded) return content;
  return (
    <ComponentCard
      title={t(`fields.${field}`)}
      icon={visualization ? undefined : <TableIcon />}
      actions={
        rows.length > 0 ? (
          <span className="rounded-md bg-gray-100 px-2 py-1 text-theme-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {t("design.recordsCount", { count: rows.length })}
          </span>
        ) : undefined
      }
    >
      {visualization}
      {content}
    </ComponentCard>
  );
}
