"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import StatusBadge from "@/components/common/StatusBadge";
import Switch from "@/components/form/input/Switch";
import Button from "@/components/ui/button/Button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ApiError } from "@/lib/api/client";
import ParameterTag, { parameterNames } from "./ParameterTag";
import MessageTextField from "./MessageTextField";
import {
  MESSAGE_TEXT_FIELDS,
  draftText,
  fieldLanguageLabel,
  messageChanged,
  type MessageDraft,
  type MessageTextFieldDefinition,
} from "./messageFields";

interface MessageRowProps {
  message: Record<string, unknown>;
  draft: MessageDraft;
  fields?: readonly MessageTextFieldDefinition[];
  editing: boolean;
  saving: boolean;
  busy: boolean;
  onChange: (draft: MessageDraft) => void;
  onSave: (
    message: Record<string, unknown>,
    draft: MessageDraft,
  ) => Promise<void>;
}

export default function MessageRow({
  message,
  draft,
  fields = MESSAGE_TEXT_FIELDS,
  editing,
  saving,
  busy,
  onChange,
  onSave,
}: MessageRowProps) {
  const t = useTranslations("messageEditor");
  const status = useTranslations("status");
  const [error, setError] = useState<string | null>(null);
  const messageKey = String(message.message_key ?? "");
  const parameters = parameterNames(message);
  const changed = messageChanged(message, draft, fields);
  const change = (next: MessageDraft) => {
    setError(null);
    onChange(next);
  };
  const save = async () => {
    if (!messageKey || !changed || busy) return;
    setError(null);
    try {
      await onSave(message, draft);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("saveFailed"));
    }
  };

  const rowSpan = fields.length;

  return (
    <>
      {fields.map((field, fieldIndex) => {
        const value = draftText(draft, field.key);
        const languageLabel = fieldLanguageLabel(field, t);
        const rowBorder =
          fieldIndex === 0
            ? "border-t border-gray-200 first:border-t-0 dark:border-gray-800"
            : "border-t border-gray-100 dark:border-gray-800/60";
        return (
          <TableRow
            key={field.key}
            className={`${rowBorder} transition-colors hover:bg-gray-50/70 dark:hover:bg-white/2`}
          >
            {fieldIndex === 0 && (
              <>
                <TableCell
                  rowSpan={rowSpan}
                  className="font-mono max-w-60 min-w-44 px-4 py-3.5 align-top text-sm font-medium break-words text-gray-800 dark:text-gray-100"
                >
                  <span className="inline-block rounded-md bg-gray-100 px-2.5 py-1 text-theme-xs font-medium text-gray-800 dark:bg-white/5 dark:text-gray-200">
                    {messageKey || "\u2014"}
                  </span>
                </TableCell>
                <TableCell
                  rowSpan={rowSpan}
                  className="px-4 py-3.5 align-top text-sm text-gray-500 dark:text-gray-400"
                >
                  {parameters.length ? (
                    <div className="flex min-w-28 flex-wrap gap-1.5">
                      {parameters.map((name) => (
                        <ParameterTag key={name} name={name} />
                      ))}
                    </div>
                  ) : (
                    "\u2014"
                  )}
                </TableCell>
              </>
            )}
            <TableCell className="w-36 border-s border-gray-100 px-4 py-3.5 align-top text-sm whitespace-nowrap dark:border-gray-800/60">
              <span className="text-theme-xs font-medium text-brand-700 dark:text-brand-300">
                {languageLabel}
              </span>
            </TableCell>
            <TableCell className="min-w-64 px-4 py-3.5 align-top text-sm">
              {editing ? (
                <MessageTextField
                  field={field}
                  messageKey={messageKey}
                  value={value}
                  parameters={parameters}
                  disabled={saving || !messageKey}
                  onChange={(nextValue) =>
                    change({ ...draft, [field.key]: nextValue })
                  }
                />
              ) : (
                <p
                  dir={field.dir}
                  className="max-w-2xl leading-relaxed break-words whitespace-pre-wrap text-gray-700 dark:text-gray-300"
                >
                  {value || "\u2014"}
                </p>
              )}
            </TableCell>
            {fieldIndex === 0 && (
              <>
                <TableCell
                  rowSpan={rowSpan}
                  className="border-s border-gray-100 px-4 py-3.5 align-top text-sm dark:border-gray-800/60"
                >
                  {editing ? (
                    <Switch
                      id={`message-status-${encodeURIComponent(messageKey)}`}
                      label={status(draft.is_active ? "active" : "inactive")}
                      checked={draft.is_active}
                      disabled={saving || !messageKey}
                      onChange={(checked) =>
                        change({ ...draft, is_active: checked })
                      }
                    />
                  ) : (
                    <StatusBadge active={draft.is_active} />
                  )}
                </TableCell>
                {editing && (
                  <TableCell
                    rowSpan={rowSpan}
                    className="px-4 py-3.5 text-end align-top text-sm"
                  >
                    <Button
                      size="sm"
                      title={t("saveMessage", { key: messageKey })}
                      onClick={save}
                      disabled={busy || !changed || !messageKey}
                    >
                      {t(saving ? "saving" : "save")}
                    </Button>
                    {error && (
                      <p
                        role="alert"
                        className="mt-2 max-w-52 text-start text-theme-xs text-error-600 dark:text-error-400"
                      >
                        {error}
                      </p>
                    )}
                  </TableCell>
                )}
              </>
            )}
          </TableRow>
        );
      })}
    </>
  );
}
