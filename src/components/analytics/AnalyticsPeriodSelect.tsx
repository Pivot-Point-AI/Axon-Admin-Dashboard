"use client";

import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFormatter, useTranslations } from "next-intl";
import DateField from "@/components/form/DateField";
import Button from "@/components/ui/button/Button";
import { CalenderIcon, CheckLineIcon, ChevronDownIcon } from "@/icons";
import { useClickOutside } from "@/hooks/useClickOutside";
import { analyticsPeriods, type AnalyticsPeriod } from "./analyticsPeriods";
import { localDateTimeValue } from "@/utils/dateTime";

interface AnalyticsPeriodSelectProps {
  value?: AnalyticsPeriod;
  options?: readonly AnalyticsPeriod[];
  start?: string;
  end?: string;
  onChange: (period: AnalyticsPeriod) => void;
  onCustomChange?: (start: string, end: string) => void;
  customMode?: "day" | "range";
  size?: "sm" | "md";
}

export default function AnalyticsPeriodSelect({
  value,
  options = analyticsPeriods,
  start = "",
  end = "",
  onChange,
  onCustomChange,
  customMode = "range",
  size = "sm",
}: AnalyticsPeriodSelectProps) {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(end);
  const today = localDateTimeValue().split("T")[0];
  useClickOutside(container, () => setOpen(false));
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const displayDate = (date: string) =>
    format.dateTime(new Date(`${date}T00:00:00`), {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const label = value
    ? t(`design.${value}`)
    : start && end && start !== end
      ? t("design.dateRange", {
          from: displayDate(start),
          to: displayDate(end),
        })
      : start
        ? displayDate(start)
        : t("design.customRange");
  const invalid =
    !from ||
    (customMode === "range" && (!to || from > to)) ||
    from > today ||
    (to && to > today);

  return (
    <div
      ref={container}
      className={`relative inline-flex max-w-full min-w-0 ${open ? "z-99999" : ""} ${size === "md" ? "w-full sm:w-auto" : ""}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          if ((event.target as HTMLElement).tagName !== "BUTTON") return;
          event.preventDefault();
          if (!open) {
            setOpen(true);
            return;
          }
          const buttons = Array.from(
            container.current?.querySelectorAll<HTMLButtonElement>(
              "[data-period-option]",
            ) ?? [],
          );
          const index = buttons.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          buttons[
            (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) %
              buttons.length
          ]?.focus();
        }
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget as Node)
        )
          setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-label={t("design.reportingPeriod") + ": " + label}
        onClick={() => {
          setOpen(!open);
          setCustom(!value);
          setFrom(start);
          setTo(end);
        }}
        className={`inline-flex max-w-full items-center justify-between gap-3 rounded-xl border shadow-theme-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 ${size === "md" ? "min-h-12 w-full px-4 py-3 text-sm font-semibold sm:min-w-48" : "min-h-10 px-3 py-2 text-theme-xs font-medium"} ${open ? "border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-600 dark:bg-brand-500/10 dark:text-brand-300" : "border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-brand-600 dark:hover:bg-gray-800"}`}
      >
        <CalenderIcon
          aria-hidden="true"
          className={`shrink-0 text-blue-light-500 dark:text-blue-light-300 ${size === "md" ? "size-5" : "size-4"}`}
        />
        <span
          className={`min-w-0 break-words whitespace-normal ${size === "md" ? "flex-1 text-start" : ""}`}
        >
          {label}
        </span>
        <span
          className={`shrink-0 ${size === "md" ? "ms-2 border-s border-gray-100 ps-3 dark:border-gray-700" : ""}`}
        >
          <ChevronDownIcon
            aria-hidden="true"
            className={`size-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            aria-hidden="true"
            onClick={close}
            className="axon-fade-in fixed inset-0 z-9999 bg-gray-950/10 backdrop-blur-[1.5px] dark:bg-gray-950/30"
          />,
          document.body,
        )}
      {open && (
        <div
          id={`${id}-panel`}
          role="dialog"
          aria-label={t("design.reportingPeriod")}
          className="axon-pop absolute end-0 top-full z-999 mt-3 w-[min(23rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xl ring-1 ring-gray-950/5 dark:border-gray-700 dark:bg-gray-900 dark:ring-white/10"
        >
          <div className="mb-4 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300"
            >
              <CalenderIcon className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm leading-5 font-bold text-gray-900 dark:text-gray-100">
                {t("design.quickRanges")}
              </p>
              <p className="text-theme-xs leading-4 text-gray-500 dark:text-gray-400">
                {label}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {options.map((option) => (
              <button
                key={option}
                data-period-option
                type="button"
                aria-pressed={value === option}
                onClick={() => {
                  onChange(option);
                  close();
                }}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-start text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-400 ${value === option ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/15 dark:text-brand-200" : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"}`}
              >
                {t(`design.${option}`)}
                {value === option && (
                  <CheckLineIcon
                    aria-hidden="true"
                    className="size-4 shrink-0"
                  />
                )}
              </button>
            ))}
          </div>
          {onCustomChange && (
            <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
              <button
                data-period-option
                type="button"
                aria-expanded={custom}
                onClick={() => setCustom(!custom)}
                className="flex w-full items-center justify-between rounded-xl border border-dashed border-gray-300 px-3.5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-300 hover:bg-brand-25 focus-visible:outline-2 focus-visible:outline-brand-400 dark:border-gray-600 dark:text-gray-200 dark:hover:border-brand-600 dark:hover:bg-brand-500/10"
              >
                {t(
                  customMode === "day"
                    ? "design.chooseDate"
                    : "design.customRange",
                )}
                <ChevronDownIcon
                  aria-hidden="true"
                  className={`size-4 text-gray-400 dark:text-gray-500 ${custom ? "rotate-180" : ""}`}
                />
              </button>
              {custom && (
                <form
                  className="space-y-3 p-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!invalid) {
                      onCustomChange(from, customMode === "day" ? from : to);
                      close();
                    }
                  }}
                >
                  <DateField
                    id={`${id}-from`}
                    label={t(customMode === "day" ? "date" : "from")}
                    value={from}
                    onChange={setFrom}
                    max={customMode === "range" ? to || today : today}
                    required
                  />
                  {customMode === "range" && (
                    <DateField
                      id={`${id}-to`}
                      label={t("to")}
                      value={to}
                      onChange={setTo}
                      min={from || undefined}
                      max={today}
                      required
                    />
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={Boolean(invalid)}
                    className="w-full !text-white"
                  >
                    {t("apply")}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
