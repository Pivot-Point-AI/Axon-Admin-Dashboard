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
  messageChanged,
  type MessageDraft,
} from "./messageFields";

interface MessageRowProps {
  message: Record<string, unknown>;
  draft: MessageDraft;
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
  const changed = messageChanged(message, draft);
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

  const rowSpan = MESSAGE_TEXT_FIELDS.length;

  return (
    <>
      {MESSAGE_TEXT_FIELDS.map((field, fieldIndex) => (
        <TableRow
          key={field.key}
          className="transition-colors hover:bg-gray-50 dark:hover:bg-white/3"
        >
          {fieldIndex === 0 && (
            <>
              <TableCell
                rowSpan={rowSpan}
                className="font-mono max-w-60 min-w-44 px-4 py-3 align-top text-sm font-medium break-words text-gray-800 dark:text-gray-100"
              >
                {messageKey || "\u2014"}
              </TableCell>
              <TableCell
                rowSpan={rowSpan}
                className="px-4 py-3 align-top text-sm text-gray-500 dark:text-gray-400"
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
          <TableCell className="w-28 px-4 py-3 align-top text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-300">
            {t(field.label)}
          </TableCell>
          <TableCell className="min-w-64 px-4 py-3 align-top text-sm">
            {editing ? (
              <MessageTextField
                field={field}
                messageKey={messageKey}
                value={draft[field.key]}
                parameters={parameters}
                disabled={saving || !messageKey}
                onChange={(value) => change({ ...draft, [field.key]: value })}
              />
            ) : (
              <p
                dir={field.dir}
                className="max-w-xl leading-6 break-words whitespace-pre-wrap text-gray-600 dark:text-gray-300"
              >
                {draft[field.key] || "\u2014"}
              </p>
            )}
          </TableCell>
          {fieldIndex === 0 && (
            <>
              <TableCell
                rowSpan={rowSpan}
                className="px-4 py-3 align-top text-sm"
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
                  className="px-4 py-3 text-end align-top text-sm"
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
      ))}
    </>
  );
}
