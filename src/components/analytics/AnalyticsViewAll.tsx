"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import Input from "@/components/form/input/InputField";
import { Modal } from "@/components/ui/modal";
import { ChartBarsIcon, ChevronDownIcon, CloseIcon } from "@/icons";
import AnalyticsJourneyPeriod from "./AnalyticsJourneyPeriod";

export interface ViewAllEntry {
  key: string;
  label: string;
  /** Theme color token for the legend dot and share bar, e.g. "brand-500". */
  color?: string;
  values: string[];
  /** Share of the whole, 0–1, drawn as a bar under the row. */
  bar?: number | null;
}

interface AnalyticsViewAllProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Column headings: the first names the entry, the rest its values. */
  columns?: string[];
  entries?: ViewAllEntry[];
  /** Hide the period filter in the window header. */
  hidePeriod?: boolean;
  /** What the entries are called in the count badge. */
  countNoun?: "records" | "categories";
  children: ReactNode;
}

const searchThreshold = 8;
const previewCount = 6;

function EntriesPanel({
  columns,
  entries,
}: {
  columns: string[];
  entries: ViewAllEntry[];
}) {
  const t = useTranslations("analytics.design");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const needle = query.trim().toLowerCase();
  const matches = needle
    ? entries.filter((entry) => entry.label.toLowerCase().includes(needle))
    : entries;
  const collapsible = !needle && entries.length > previewCount;
  const visible =
    collapsible && !expanded ? matches.slice(0, previewCount) : matches;
  // Header and rows share one proportional layout, so every column lines up
  // and the table fits its panel without scrolling.
  const valueColumns = columns.length - 1;
  const grid = {
    gridTemplateColumns: `minmax(0, 1.7fr) repeat(${valueColumns}, minmax(0, 1fr))`,
  };
  return (
    <section
      aria-label={t("allEntries")}
      className="flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white shadow-theme-xs md:min-h-0 dark:border-gray-800 dark:bg-gray-900"
    >
      {entries.length > searchThreshold && (
        <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchEntries")}
            aria-label={t("searchEntries")}
          />
        </div>
      )}
      <>
        <div
          style={grid}
          className="grid gap-x-3 border-b border-gray-100 bg-gray-50 px-5 py-2.5 text-theme-xs font-medium text-gray-500 dark:border-gray-800 dark:bg-white/3 dark:text-gray-400"
        >
          {columns.map((column, index) => (
            <span key={column} className={index ? "text-end" : "text-start"}>
              {column}
            </span>
          ))}
        </div>
        {/* Beside the chart only this list scrolls; stacked, the whole dialog does. */}
        <ul className="custom-scrollbar flex-1 divide-y divide-gray-100 md:min-h-0 md:overflow-y-auto dark:divide-gray-800">
          {visible.map((entry) => (
            <li key={entry.key} className="px-5 py-3">
              <div
                style={grid}
                className="grid items-center gap-x-3 text-theme-xs"
              >
                <span className="flex min-w-0 items-center gap-2.5 text-gray-700 dark:text-gray-300">
                  {entry.color && (
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: `var(--color-${entry.color})` }}
                    />
                  )}
                  <span className="break-words">{entry.label}</span>
                </span>
                {entry.values.map((value, index) => (
                  <span
                    key={index}
                    className={`min-w-0 text-end break-words tabular-nums ${index ? "text-gray-500 dark:text-gray-400" : "font-semibold text-gray-950 dark:text-white/90"}`}
                  >
                    {value}
                  </span>
                ))}
              </div>
              {entry.bar != null && (
                <div
                  aria-hidden="true"
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                >
                  <div
                    className="axon-grow-x h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(0, entry.bar * 100))}%`,
                      background: `var(--color-${entry.color ?? "blue-light-500"})`,
                    }}
                  />
                </div>
              )}
            </li>
          ))}
          {!visible.length && (
            <li className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              {t("noEntriesMatch")}
            </li>
          )}
        </ul>
      </>
      {collapsible && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-1.5 rounded-b-2xl border-t border-gray-100 px-5 py-3 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-25 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-400 dark:border-gray-800 dark:text-brand-300 dark:hover:bg-brand-500/10"
        >
          {expanded
            ? t("showLess")
            : t("viewMore", { count: entries.length - previewCount })}
          <ChevronDownIcon
            aria-hidden="true"
            className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </section>
  );
}

export default function AnalyticsViewAll({
  title,
  description,
  icon,
  columns,
  entries,
  hidePeriod = false,
  countNoun = "records",
  children,
}: AnalyticsViewAllProps) {
  const t = useTranslations("analytics.design");
  const [open, setOpen] = useState(false);
  const panel = columns && entries && entries.length > 0;
  // A little roomier on wide screens with several value columns; the chart keeps the rest.
  const panelWidth = 20 + Math.max(0, (columns?.length ?? 1) - 2) * 3;
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[0.6875rem] font-medium whitespace-nowrap text-gray-700 shadow-theme-xs transition-colors hover:border-brand-300 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-brand-600 dark:hover:bg-gray-800"
      >
        <ChartBarsIcon
          aria-hidden="true"
          className="size-3.5 text-blue-light-500 dark:text-blue-light-300"
        />
        {t("viewAll")}
      </button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        ariaLabel={title}
        isFullscreen
        showCloseButton={false}
        className="bg-transparent"
      >
        <div
          onClick={() => setOpen(false)}
          className="axon-fade-in fixed inset-0 flex items-center justify-center bg-gray-950/25 p-3 backdrop-blur-[3px] sm:p-6 lg:p-10 dark:bg-gray-950/50"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className={`axon-pop flex max-h-full w-full max-w-7xl flex-col rounded-3xl border border-gray-200 bg-white shadow-theme-xl dark:border-gray-800 dark:bg-gray-900 ${panel ? "md:h-full" : ""}`}
          >
            <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-3 border-b border-gray-100 px-5 py-4 sm:px-7 dark:border-gray-800">
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300 [&>svg]:size-5"
              >
                {icon ?? <ChartBarsIcon />}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-gray-950 sm:text-xl dark:text-white/90">
                  {title}
                </h2>
                {description && (
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!hidePeriod && <AnalyticsJourneyPeriod />}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("close")}
                  title={`${t("close")} (Esc)`}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <CloseIcon aria-hidden="true" className="size-5" />
                </button>
              </div>
            </header>
            <div
              className={`no-scrollbar min-h-0 flex-1 overflow-y-auto rounded-b-3xl bg-gray-50/60 px-5 py-5 sm:px-7 sm:py-6 dark:bg-gray-950/40 ${panel ? "md:flex md:flex-col md:overflow-hidden" : ""}`}
            >
              <div
                style={{ "--panel-width": `${panelWidth}rem` } as CSSProperties}
                className={`grid items-stretch gap-5 ${panel ? "md:min-h-0 md:flex-1 md:grid-cols-[minmax(0,1fr)_20rem] md:grid-rows-[minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_var(--panel-width)]" : ""}`}
              >
                <section
                  aria-label={title}
                  className={`relative no-scrollbar flex min-h-80 min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:p-6 md:min-h-0 md:overflow-y-auto dark:border-gray-800 dark:bg-gray-900`}
                >
                  {panel && (
                    <span className="absolute end-5 top-5 rounded-full bg-blue-light-50 px-2.5 py-1 text-theme-xs font-medium text-blue-light-600 tabular-nums sm:end-6 sm:top-6 dark:bg-blue-light-500/15 dark:text-blue-light-300">
                      {t(
                        countNoun === "categories"
                          ? "categoryTotal"
                          : "recordsCount",
                        {
                          count: entries.length,
                        },
                      )}
                    </span>
                  )}
                  {/* The chart stays put; only the list beside it scrolls. */}
                  <div className="my-auto">{children}</div>
                </section>
                {panel && <EntriesPanel columns={columns} entries={entries} />}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
