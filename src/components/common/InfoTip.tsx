"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { InfoIcon } from "@/icons";
import { useClickOutside } from "@/hooks/useClickOutside";

interface InfoTipProps {
  text: string;
  /** Heading of the pop-up, normally the title of the card it explains. */
  title?: string;
  label?: string;
}

// "Label: explanation" lines render as a definition list; anything else as a paragraph.
const entries = (text: string) =>
  text
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const split = line.indexOf(": ");
      return split > 0 && split < 40
        ? { term: line.slice(0, split), detail: line.slice(split + 2) }
        : { term: null, detail: line };
    });

export default function InfoTip({ text, title, label }: InfoTipProps) {
  const t = useTranslations("common");
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const open = pinned || hovered;
  useClickOutside(ref, () => setPinned(false));

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setPinned(false);
          setHovered(false);
        }
      }}
    >
      <button
        type="button"
        aria-label={label ?? t("moreInfo")}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setPinned((value) => !value)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className={`flex size-6 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-brand-400 ${
          open
            ? "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300"
            : "text-gray-400 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-brand-300"
        }`}
      >
        <InfoIcon aria-hidden="true" className="size-[18px]" />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute end-0 top-full z-99 mt-3 block w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white text-start shadow-theme-lg dark:border-gray-700 dark:bg-gray-900"
        >
          <span
            aria-hidden="true"
            className="absolute end-2.5 -top-1.5 size-3 rotate-45 rounded-ss-sm border-s border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
          />
          {title && (
            <span className="flex items-center gap-2.5 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
              >
                <InfoIcon className="size-4" />
              </span>
              <span className="text-sm font-semibold text-gray-950 dark:text-white">
                {title}
              </span>
            </span>
          )}
          <span className="block space-y-3 px-4 py-3.5">
            {entries(text).map((entry, index) => (
              <span
                key={index}
                className="block text-theme-xs leading-5 text-gray-600 dark:text-gray-400"
              >
                {entry.term && (
                  <span className="mb-0.5 block text-theme-sm font-medium text-gray-900 dark:text-gray-100">
                    {entry.term}
                  </span>
                )}
                {entry.detail}
              </span>
            ))}
          </span>
        </span>
      )}
    </span>
  );
}
