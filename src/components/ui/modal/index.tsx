"use client";

import { useTranslations } from "next-intl";
import { CloseIcon } from "@/icons";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";

const modalStack: symbol[] = [];
let previousOverflow = "";

interface ModalProps {
  ariaLabel?: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean; // New prop to control close button visibility
  isFullscreen?: boolean; // Default to false for backwards compatibility
}

export const Modal: React.FC<ModalProps> = ({
  ariaLabel,
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true, // Default to true for backwards compatibility
  isFullscreen = false,
}) => {
  const t = useTranslations("fixes");
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const token = Symbol("modal");
    const previousFocus = document.activeElement as HTMLElement | null;
    if (!modalStack.length) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    modalStack.push(token);
    const focusable = () =>
      Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
        ) ?? [],
      ).filter((el) => el.getClientRects().length > 0);
    const frame = requestAnimationFrame(() =>
      (focusable()[0] ?? modalRef.current)?.focus(),
    );
    const handleKeyDown = (event: KeyboardEvent) => {
      if (modalStack.at(-1) !== token) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      }
      if (event.key === "Tab") {
        const elements = focusable();
        const first = elements[0];
        const last = elements.at(-1);
        if (!first) {
          event.preventDefault();
          modalRef.current?.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      const index = modalStack.indexOf(token);
      if (index >= 0) modalStack.splice(index, 1);
      if (!modalStack.length) document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : "relative my-4 w-[calc(100%-2rem)] rounded-3xl bg-white dark:bg-gray-900 sm:w-full";

  return createPortal(
    <div className="modal fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto">
      {!isFullscreen && (
        <div
          className="fixed inset-0 h-full w-full bg-gray-950/50 backdrop-blur-sm dark:bg-gray-950/70"
          onClick={onClose}
        ></div>
      )}
      <div
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        ref={modalRef}
        className={`${contentClasses} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            className="absolute end-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:end-6 sm:top-6 sm:h-11 sm:w-11 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <CloseIcon className="block size-5 shrink-0" />
          </button>
        )}
        <div>{children}</div>
      </div>
    </div>,
    document.body,
  );
};
