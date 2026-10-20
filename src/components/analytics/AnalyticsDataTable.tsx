"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
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

interface AnalyticsDataTableProps {
  field: string;
  value: unknown;
}

export default function AnalyticsDataTable({
  field,
  value,
}: AnalyticsDataTableProps) {
  const t = useTranslations("analytics");
  const [expanded, setExpanded] = useState(false);
  const rows = analyticsTableRows(value);
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
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
  return (
    <ComponentCard
      title={t(`fields.${field}`)}
      actions={
        rows.length > 0 ? (
          <span className="rounded-md bg-gray-100 px-2 py-1 text-theme-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {t("design.recordsCount", { count: rows.length })}
          </span>
        ) : undefined
      }
    >
      {!rows.length ? (
        <AnalyticsEmptyState />
      ) : (
        <div className="custom-scrollbar overflow-x-auto">
          <Table>
            <TableHeader className="border-y border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/3">
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    isHeader
                    key={column}
                    className="px-4 py-3 text-start text-theme-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
                  >
                    {label(column)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {(expanded ? rows : rows.slice(0, 5)).map((row, index) => (
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
                        className="max-w-sm px-4 py-3.5 align-top text-sm break-words text-gray-700 dark:text-gray-300"
                      >
                        {typeof scalar === "string" && scalar.length > 150 ? (
                          <details>
                            <summary className="cursor-pointer text-brand-600 dark:text-brand-300">
                              {t("design.viewDetails")}
                            </summary>
                            <p className="mt-2 break-words whitespace-pre-wrap">
                              {scalar}
                            </p>
                          </details>
                        ) : (
                          <AnalyticsValue
                            value={scalar}
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
      {rows.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-theme-xs font-semibold text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-brand-300"
        >
          {t(expanded ? "design.showLess" : "design.showAll")}
        </button>
      )}
    </ComponentCard>
  );
}
