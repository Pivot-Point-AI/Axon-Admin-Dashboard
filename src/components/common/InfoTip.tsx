"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const open = pinned || hovered;
  useClickOutside(ref, () => setPinned(false));

  // The pop-up is fixed to the viewport, below the button: right-aligned with
  // it, pulled back inside the screen when that would overflow either edge.
  const measure = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(320, window.innerWidth - 32);
    const left = Math.min(
      Math.max(rect.right - width, 16),
      window.innerWidth - width - 16,
    );
    setPosition({ top: rect.bottom, left });
  };

  // A fixed pop-up would drift from its button, so it closes on scroll.
  useEffect(() => {
    if (!open) return;
    const close = () => {
      setPinned(false);
      setHovered(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => {
        measure();
        setHovered(true);
      }}
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
        onClick={() => {
          measure();
          setPinned((value) => !value);
        }}
        onFocus={() => {
          measure();
          setHovered(true);
        }}
        onBlur={() => setHovered(false)}
        className={`flex size-6 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-brand-400 ${
          open
            ? "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300"
            : "text-gray-400 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-brand-300"
        }`}
      >
        <InfoIcon aria-hidden="true" className="size-[18px]" />
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              aria-hidden="true"
              className="axon-fade-in pointer-events-none fixed inset-0 z-9999 bg-gray-950/10 backdrop-blur-[1.5px] dark:bg-gray-950/30"
            />
            <div
              className="fixed z-99999 pt-3"
              style={{ top: position.top, left: position.left }}
              onMouseDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
            >
              <span
                id={id}
                role="tooltip"
                className="axon-pop block max-h-[70vh] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white text-start shadow-theme-xl ring-1 ring-gray-950/5 dark:border-gray-700 dark:bg-gray-900 dark:ring-white/10"
              >
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
            </div>
          </>,
          document.body,
        )}
    </span>
  );
}
