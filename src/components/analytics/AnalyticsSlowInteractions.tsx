"use client";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";
import AnalyticsCardActions from "./AnalyticsCardActions";
import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDownIcon, TableIcon } from "@/icons";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import { analyticsTableRows } from "./analyticsData";
import { telemetryNumber } from "./analyticsTelemetryData";

interface AnalyticsSlowInteractionsProps {
  value: unknown;
}
export default function AnalyticsSlowInteractions({
  value,
}: AnalyticsSlowInteractionsProps) {
  const t = useTranslations("analytics.telemetry");
  const common = useTranslations("analytics.design");
  const format = useFormatter();
  const [expanded, setExpanded] = useState(false);
  const rows = analyticsTableRows(value);
  const visible = expanded ? rows : rows.slice(0, 5);
  const text = (value: unknown) =>
    typeof value === "string" || typeof value === "number"
      ? String(value)
      : "—";
  return (
    <ComponentCard
      compact
      title={t("slowTitle")}
      icon={<TableIcon />}
      actions={
        <AnalyticsCardActions>
          <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-theme-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {t("recordCount", { count: rows.length })}
          </span>
          <AnalyticsJourneyPeriod />
        </AnalyticsCardActions>
      }
    >
      {!rows.length ? (
        <AnalyticsEmptyState />
      ) : (
        <>
          <div className="custom-scrollbar overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  {["requestId", "latencyMs", "intent", "time", "status"].map(
                    (key) => (
                      <TableCell
                        key={key}
                        isHeader
                        className="px-4 py-3 text-start text-theme-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
                      >
                        {t(key)}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {visible.map((row, index) => {
                  const duration = telemetryNumber(
                    row.latency_ms,
                    row.response_time_ms,
                    row.end_to_end_latency_ms,
                    row.end_to_end_ms,
                    row.duration_ms,
                  );
                  return (
                    <TableRow key={index}>
                      <TableCell className="px-4 py-3 text-theme-xs whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {text(
                          row.request_id ?? row.req_id ?? row.turn_id ?? row.id,
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-end text-theme-xs whitespace-nowrap text-gray-600 tabular-nums dark:text-gray-300">
                        {duration === null
                          ? "—"
                          : format.number(duration, {
                              maximumFractionDigits: 2,
                            })}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-theme-xs whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {text(row.intent ?? row.intent_name)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-theme-xs whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {text(row.timestamp ?? row.time ?? row.created_at)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-theme-xs">
                        {duration === null ? (
                          "—"
                        ) : (
                          <Badge
                            variant="text"
                            size="sm"
                            color={duration > 1500 ? "error" : "success"}
                          >
                            {t(duration > 1500 ? "slow" : "withinThreshold")}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {rows.length > 5 && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <p
                role="status"
                className="text-theme-xs text-gray-500 dark:text-gray-400"
              >
                {common("visibleRecords", {
                  visible: visible.length,
                  total: rows.length,
                })}
              </p>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpanded(!expanded)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-theme-xs font-medium text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-brand-300"
              >
                {common(expanded ? "showLess" : "showAll")}
                <ChevronDownIcon
                  aria-hidden="true"
                  className={`size-3.5 ${expanded ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          )}
        </>
      )}
    </ComponentCard>
  );
}
