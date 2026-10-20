"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { GlobeIcon, PencilIcon } from "@/icons";
import useModal from "@/hooks/useModal";
import { ApiError } from "@/lib/api/client";
import { updateFaqHeader, type FAQSettingsModel } from "@/lib/api/faqs";

interface FaqHeaderSettingsProps {
  settings: FAQSettingsModel;
  accessToken: string;
  onSaved: (settings: FAQSettingsModel) => void;
}

export default function FaqHeaderSettings({
  settings,
  accessToken,
  onSaved,
}: FaqHeaderSettingsProps) {
  const t = useTranslations("faqs");
  const modal = useModal();
  const [draft, setDraft] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <section
        aria-label={t("headerSettings")}
        className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3"
      >
        <div className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden="true"
            className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 sm:flex dark:bg-brand-500/15 dark:text-brand-300"
          >
            <GlobeIcon className="size-6" />
          </span>
          <div className="min-w-0 flex-1 basis-0">
            <p className="mb-1 text-theme-xs font-medium text-gray-400 dark:text-gray-500">
              {t("design.clientHeader")}
            </p>
            <h2 className="text-base font-semibold break-words text-gray-800 dark:text-white/90">
              {settings.title || t("design.headerPlaceholder")}
            </h2>
            <p className="mt-1 line-clamp-2 text-sm leading-6 break-words text-gray-500 dark:text-gray-400">
              {settings.subtitle || t("design.subtitlePlaceholder")}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            title={t("design.editHeader")}
            className="h-11 shrink-0 text-brand-600 ring-brand-200 hover:bg-brand-50 dark:text-brand-300 dark:ring-brand-700 dark:hover:bg-brand-500/10"
            startIcon={<PencilIcon className="size-4" />}
            onClick={() => {
              setDraft(settings);
              setError("");
              modal.openModal();
            }}
          >
            <span className="sr-only sm:not-sr-only">
              {t("design.editHeader")}
            </span>
          </Button>
        </div>
      </section>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => {
          if (!busy) modal.closeModal();
        }}
        ariaLabel={t("headerSettings")}
        className="max-w-lg p-6 sm:p-8"
      >
        <h2 className="pe-10 text-xl font-semibold text-gray-900 dark:text-white/90">
          {t("headerSettings")}
        </h2>
        <p className="mt-2 mb-6 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {t("design.headerEditorHint")}
        </p>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            if (!draft.title.trim() || !draft.subtitle.trim()) {
              setError(t("headerRequired"));
              return;
            }
            setBusy(true);
            setError("");
            const body = {
              title: draft.title.trim(),
              subtitle: draft.subtitle.trim(),
            };
            try {
              await updateFaqHeader(body, accessToken);
              modal.closeModal();
              onSaved(body);
            } catch (err) {
              setError(err instanceof ApiError ? err.message : t("saveFailed"));
            } finally {
              setBusy(false);
            }
          }}
        >
          <div>
            <Label htmlFor="faq-header-title">
              {t("title")}{" "}
              <span className="text-error-500 dark:text-error-400">*</span>
            </Label>
            <Input
              id="faq-header-title"
              value={draft.title}
              required
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="faq-header-subtitle">
              {t("subtitle")}{" "}
              <span className="text-error-500 dark:text-error-400">*</span>
            </Label>
            <textarea
              id="faq-header-subtitle"
              value={draft.subtitle}
              required
              rows={4}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  subtitle: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm leading-6 text-gray-800 focus:outline-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          {error && (
            <p
              role="alert"
              className="text-sm text-error-600 dark:text-error-400"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <Button
              size="sm"
              className="h-11"
              variant="outline"
              disabled={busy}
              onClick={modal.closeModal}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-11"
              disabled={
                busy ||
                (draft.title.trim() === settings.title &&
                  draft.subtitle.trim() === settings.subtitle)
              }
            >
              {t(busy ? "saving" : "saveHeader")}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
