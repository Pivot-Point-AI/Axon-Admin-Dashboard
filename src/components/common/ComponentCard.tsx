"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/utils";
import InfoTip from "./InfoTip";

// A description that does not fit on one row is cut there, with the rest one
// click away at the end of that row.
function Description({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const t = useTranslations("common");
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const line = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = line.current;
    if (!element) return;
    const measure = () =>
      setOverflowing(element.scrollWidth > element.clientWidth + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text, expanded]);
  const toggle = (overflowing || expanded) && (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={() => setExpanded((value) => !value)}
      className="shrink-0 rounded-sm font-medium text-brand-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 dark:text-brand-300"
    >
      {t(expanded ? "showLess" : "showMore")}
    </button>
  );
  const base = `text-theme-xs leading-5 text-gray-500 dark:text-gray-400 ${className ?? ""}`;
  return expanded ? (
    <p className={base}>
      {text} {toggle}
    </p>
  ) : (
    <p className={`flex items-baseline gap-1.5 ${base}`}>
      <span ref={line} className="min-w-0 flex-1 truncate">
        {text}
      </span>
      {toggle}
    </p>
  );
}

interface ComponentCardProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  description?: string;
  className?: string;
  icon?: ReactNode;
  compact?: boolean;
  iconClassName?: string;
  info?: string | null;
}

export default function ComponentCard({
  title,
  children,
  actions,
  description,
  className,
  icon,
  compact = false,
  iconClassName,
  info,
}: ComponentCardProps) {
  return (
    <section
      className={cn(
        "axon-panel min-w-0 rounded-xl border border-brand-100/70 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900",
        !compact && "sm:p-5",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap",
          !description && (compact ? "mb-3" : "mb-4"),
        )}
      >
        {icon && (
          <span
            aria-hidden="true"
            className={cn(
              "flex shrink-0 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300 [&>svg]:size-5",
              compact ? "size-9" : "size-10",
              iconClassName,
            )}
          >
            {icon}
          </span>
        )}
        <div className="flex min-w-0 flex-1 basis-40 items-center gap-1.5 sm:basis-auto">
          <h2
            className={cn(
              "leading-6 font-bold text-gray-950 dark:text-white/90",
              compact ? "text-sm" : "text-base",
            )}
          >
            {title}
          </h2>
          {info && <InfoTip text={info} title={title} />}
        </div>
        {actions && <div className="ms-auto shrink-0">{actions}</div>}
      </div>
      {description && (
        <Description
          text={description}
          className={cn("mt-2", compact ? "mb-3" : "mb-4")}
        />
      )}
      {children}
    </section>
  );
}
