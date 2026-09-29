"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import { ApiError } from "@/lib/api/client";
import ParameterTag, { parameterNames } from "./ParameterTag";

const MESSAGE_TEXT_FIELDS = [
  { key: "msg_en", label: "English", dir: "ltr" },
  { key: "msg_ur", label: "Urdu", dir: "rtl" },
  { key: "msg_ar", label: "Arabic", dir: "rtl" },
] as const;

type InsertPosition = "cursor" | "start" | "end";

const INSERT_POSITIONS: { value: InsertPosition; label: string }[] = [
  { value: "cursor", label: "Cursor" },
  { value: "start", label: "Start" },
  { value: "end", label: "End" },
];

interface EditMessageModalProps {
  message: Record<string, unknown>;
  onClose: () => void;
  onSave: (values: Record<string, string>) => Promise<void>;
}

export default function EditMessageModal({
  message,
  onClose,
  onSave,
}: EditMessageModalProps) {
  const parameters = parameterNames(message);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      MESSAGE_TEXT_FIELDS.map(({ key }) => {
        const text = message[key];
        return [key, typeof text === "string" ? text : ""];
      }),
    ),
  );
  const [position, setPosition] = useState<InsertPosition>("cursor");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  // A field's caret only means something once the user has placed it there;
  // until then "cursor" inserts at the end.
  const focusedFields = useRef(new Set<string>());

  // Drops {name} into the field at the chosen position (replacing any
  // selection at the caret), then restores focus just after the token.
  const insertParameter = (field: string, name: string) => {
    const token = `{${name}}`;
    const textarea = textareaRefs.current[field];
    const current = values[field] ?? "";
    let start = current.length;
    let end = current.length;
    if (position === "start") {
      start = end = 0;
    } else if (
      position === "cursor" &&
      textarea &&
      focusedFields.current.has(field)
    ) {
      start = textarea.selectionStart;
      end = textarea.selectionEnd;
    }
    // Keep words apart when dropping the token next to existing text.
    const before = current.slice(0, start);
    const after = current.slice(end);
    const prefix = before && !/\s$/.test(before) ? " " : "";
    const suffix = after && !/^\s/.test(after) ? " " : "";
    setValues((prev) => ({
      ...prev,
      [field]: before + prefix + token + suffix + after,
    }));
    const caret = start + prefix.length + token.length;
    requestAnimationFrame(() => {
      const el = textareaRefs.current[field];
      if (!el) return;
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onSave(values);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update message.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-2xl overflow-hidden">
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <div className="border-b border-gray-100 ps-5 pe-16 pt-4 pb-4 sm:ps-6 sm:pe-20 sm:pt-7 sm:pb-5 dark:border-gray-800">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Edit Message
          </h4>
          <p className="mt-1.5 inline-block rounded-md bg-gray-100 px-2 py-0.5 font-mono text-theme-xs break-all text-gray-600 dark:bg-white/5 dark:text-gray-400">
            {String(message.message_key ?? "")}
          </p>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {parameters.length > 0
                ? "Parameters are predefined. Use the chips under each field to insert them."
                : "This message has no parameters."}
            </p>
            {parameters.length > 0 && (
              <div className="flex shrink-0 items-center gap-2">
                <span
                  id="insert-position-label"
                  className="text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Insert at
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="insert-position-label"
                  className="inline-flex rounded-lg bg-gray-100 p-0.5 dark:bg-white/5"
                >
                  {INSERT_POSITIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={position === value}
                      onClick={() => setPosition(value)}
                      className={`rounded-md px-3 py-1.5 text-theme-xs font-medium transition ${
                        position === value
                          ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white"
                          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {MESSAGE_TEXT_FIELDS.map(({ key, label, dir }) => {
            const text = values[key] ?? "";
            const missing = parameters.filter(
              (name) => !text.includes(`{${name}}`),
            );
            return (
              <div key={key}>
                <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <Label htmlFor={`edit-${key}`} className="mb-0">
                    {label}
                  </Label>
                  {missing.length > 0 && (
                    <span className="text-theme-xs text-warning-600 dark:text-warning-400">
                      Missing {missing.map((name) => `{${name}}`).join(", ")}
                    </span>
                  )}
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-300 shadow-theme-xs transition focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:focus-within:border-brand-800">
                  <textarea
                    id={`edit-${key}`}
                    dir={dir}
                    rows={3}
                    ref={(el) => {
                      textareaRefs.current[key] = el;
                    }}
                    onFocus={() => focusedFields.current.add(key)}
                    value={text}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="block w-full resize-y border-0 bg-transparent px-4 py-3 text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:outline-hidden dark:text-white/90"
                  />
                  {parameters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-white/3">
                      <span className="me-1 text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                        Insert
                      </span>
                      {parameters.map((name) => (
                        <ParameterTag
                          key={name}
                          name={name}
                          title={`Insert {${name}} into the ${label} message`}
                          onClick={() => insertParameter(key, name)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-800">
          {error && (
            <div className="mb-3 rounded-lg border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
              {error}
            </div>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={handleSave}
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
