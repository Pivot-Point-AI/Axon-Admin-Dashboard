"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { CheckCircleIcon, CloseIcon, AlertIcon } from "@/icons";
import type { FeedbackDetail } from "@/lib/feedback";

const FeedbackContext = createContext<
  ((message: string) => Promise<boolean>) | null
>(null);

function Notification({
  detail,
  onClose,
}: {
  detail: FeedbackDetail;
  onClose: () => void;
}) {
  const t = useTranslations("fixes");
  useEffect(() => {
    const timer = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timer);
  }, [onClose]);
  return (
    <div
      role={detail.kind === "error" ? "alert" : "status"}
      className={`axon-notification relative overflow-hidden rounded-xl border bg-white p-4 shadow-theme-lg dark:bg-gray-900 ${detail.kind === "error" ? "border-error-200 dark:border-error-500/40" : "border-success-200 dark:border-success-500/40"}`}
    >
      <div className="flex items-start gap-3">
        {detail.kind === "success" ? (
          <CheckCircleIcon className="size-6 shrink-0 text-success-500 dark:text-success-400" />
        ) : (
          <AlertIcon className="size-6 shrink-0 text-error-500 dark:text-error-400" />
        )}
        <p className="flex-1 text-sm text-gray-800 dark:text-gray-100">
          {detail.message ??
            t(
              detail.messageKey ?? (detail.kind === "error"
                ? "actionFailed"
                : detail.operation === "DELETE"
                  ? "deleted"
                  : detail.operation === "POST"
                    ? "created"
                    : "saved"),
            )}
        </p>
        <button
          type="button"
          aria-label={t("dismiss")}
          onClick={onClose}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <CloseIcon className="size-4" />
        </button>
      </div>
      <div
        className={`axon-notification-timer absolute inset-x-0 bottom-0 h-1 ${detail.kind === "error" ? "bg-error-500 dark:bg-error-400" : "bg-success-500 dark:bg-success-400"}`}
      />
    </div>
  );
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("fixes");
  const [notification, setNotification] = useState<
    (FeedbackDetail & { id: number }) | null
  >(null);
  const [message, setMessage] = useState<string | null>(null);
  const resolver = useRef<((result: boolean) => void) | null>(null);
  const closeNotification = useCallback(() => setNotification(null), []);
  const confirm = useCallback(
    (text: string) =>
      new Promise<boolean>((resolve) => {
        resolver.current?.(false);
        resolver.current = resolve;
        setMessage(text);
      }),
    [],
  );
  const settle = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setMessage(null);
  }, []);
  useEffect(() => {
    let id = 0;
    const listener = (event: Event) =>
      setNotification({
        ...(event as CustomEvent<FeedbackDetail>).detail,
        id: ++id,
      });
    window.addEventListener("axon:feedback", listener);
    return () => {
      window.removeEventListener("axon:feedback", listener);
      resolver.current?.(false);
    };
  }, []);
  return (
    <FeedbackContext.Provider value={confirm}>
      {children}
      <div className="pointer-events-none fixed end-4 top-4 z-999999 w-80 max-w-full sm:end-6 sm:top-6">
        <div className="pointer-events-auto">
          {notification && (
            <Notification
              key={notification.id}
              detail={notification}
              onClose={closeNotification}
            />
          )}
        </div>
      </div>
      <Modal
        isOpen={message !== null}
        onClose={() => settle(false)}
        className="max-w-md p-6"
        ariaLabel={t("confirmTitle")}
      >
        <h2 className="pe-12 text-lg font-semibold text-gray-900 dark:text-white">
          {t("confirmTitle")}
        </h2>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => settle(false)}>
            {t("cancel")}
          </Button>
          <Button
            className="bg-error-500 hover:bg-error-600 dark:bg-error-500 dark:hover:bg-error-600"
            onClick={() => settle(true)}
          >
            {t("confirm")}
          </Button>
        </div>
      </Modal>
    </FeedbackContext.Provider>
  );
}

export function useConfirm() {
  const confirm = useContext(FeedbackContext);
  if (!confirm) throw new Error("useConfirm requires FeedbackProvider");
  return confirm;
}
