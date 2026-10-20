"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/input/Switch";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/api/client";
import { createFaq, updateFaq } from "@/lib/api/faqs";
import type { FAQItem } from "./faqData";

interface FaqEditorProps {
  item: FAQItem | null;
  accessToken: string;
  onClose: () => void;
  onSaved: () => void;
  sections?: string[];
  initialSection?: string;
}

export default function FaqEditor({
  item,
  accessToken,
  onClose,
  onSaved,
  sections = [],
  initialSection = "",
}: FaqEditorProps) {
  const t = useTranslations("faqs");
  const status = useTranslations("status");
  const sectionListId = useId();
  const [draft, setDraft] = useState(
    item ?? {
      section_title: initialSection,
      question: "",
      answer: "",
      section_order: 0,
      item_order: 0,
      is_active: true,
    },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal
      isOpen
      onClose={() => {
        if (!busy) onClose();
      }}
      ariaLabel={t(item ? "edit" : "add")}
      className="max-w-2xl p-6 sm:p-8"
    >
      <h2 className="pe-10 text-xl font-semibold text-gray-900 dark:text-white/90">
        {t(item ? "edit" : "add")}
      </h2>
      <p className="mt-2 mb-6 text-sm leading-6 text-gray-500 dark:text-gray-400">
        {t("design.editorHint")}
      </p>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          const body = {
            section_title: draft.section_title.trim(),
            question: draft.question.trim(),
            answer: draft.answer.trim(),
            section_order: draft.section_order ?? 0,
            item_order: draft.item_order ?? 0,
            is_active: draft.is_active ?? true,
          };
          if (!body.section_title || !body.question || !body.answer) {
            setError(t("required"));
            return;
          }
          setBusy(true);
          setError("");
          try {
            if (item?.id != null) await updateFaq(item.id, body, accessToken);
            else await createFaq(body, accessToken);
            onSaved();
          } catch (err) {
            setError(err instanceof ApiError ? err.message : t("saveFailed"));
          } finally {
            setBusy(false);
          }
        }}
      >
        {(["section_title", "question", "answer"] as const).map((field) => (
          <div key={field}>
            <Label htmlFor={`faq-${field}`}>
              {t(field)}{" "}
              <span className="text-error-500 dark:text-error-400">*</span>
            </Label>
            {field === "answer" ? (
              <textarea
                id={`faq-${field}`}
                required
                rows={5}
                value={draft[field]}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [field]: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 bg-transparent p-3 text-sm text-gray-800 focus:outline-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            ) : (
              <Input
                id={`faq-${field}`}
                required
                list={field === "section_title" ? sectionListId : undefined}
                value={draft[field]}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [field]: event.target.value,
                  }))
                }
              />
            )}
            {field === "section_title" && (
              <>
                <datalist id={sectionListId}>
                  {sections.map((section) => (
                    <option key={section} value={section} />
                  ))}
                </datalist>
                <p className="mt-1.5 text-theme-xs text-gray-400 dark:text-gray-500">
                  {t("design.sectionInputHint")}
                </p>
              </>
            )}
          </div>
        ))}
        <details className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-300">
            {t("design.displayOrder")}
          </summary>
          <p className="mt-2 mb-4 text-theme-xs leading-5 text-gray-400 dark:text-gray-500">
            {t("design.displayOrderHint")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["section_order", "item_order"] as const).map((field) => (
              <div key={field}>
                <Label htmlFor={`faq-${field}`}>{t(field)}</Label>
                <Input
                  id={`faq-${field}`}
                  type="number"
                  step={1}
                  required
                  value={draft[field] ?? 0}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [field]:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </details>
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
          <Switch
            id="faq-active"
            label={status(draft.is_active ? "active" : "inactive")}
            checked={draft.is_active ?? true}
            onChange={(is_active) =>
              setDraft((current) => ({ ...current, is_active }))
            }
          />
          <p className="mt-2 text-theme-xs leading-5 text-gray-500 dark:text-gray-400">
            {t(draft.is_active ? "design.activeHint" : "design.inactiveHint")}
          </p>
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
            onClick={onClose}
            disabled={busy}
          >
            {t("cancel")}
          </Button>
          <Button size="sm" className="h-11" type="submit" disabled={busy}>
            {t(busy ? "saving" : "save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
