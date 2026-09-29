"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/ui/button/Button";
import Switch from "@/components/form/input/Switch";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ApiError } from "@/lib/api/client";
import { getMessages, updateMessage } from "@/lib/api/messages";
import { asRecordArray } from "@/lib/api/normalize";
import type { MessageModel } from "@/lib/api/types";

const MESSAGE_TEXT_FIELDS: { key: string; label: string }[] = [
  { key: "msg_en", label: "English" },
  { key: "msg_ur", label: "Urdu" },
  { key: "msg_ar", label: "Arabic" },
];

// Parameters may be stored bare ("amount") or already braced ("{amount}");
// normalise to the bare name and render/insert them as {name}.
function parameterNames(message: Record<string, unknown>): string[] {
  if (!Array.isArray(message.parameters)) return [];
  return message.parameters
    .filter((p): p is string => typeof p === "string")
    .map((p) => p.trim().replace(/^\{+|\}+$/g, ""))
    .filter(Boolean);
}

const selectClasses =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800";

function ParameterTag({
  name,
  onClick,
  active = false,
  title,
}: {
  name: string;
  onClick?: () => void;
  active?: boolean;
  title?: string;
}) {
  const classes = `inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-theme-xs font-medium ${
    active
      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
      : "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300"
  }`;
  if (!onClick) return <span className={classes}>{`{${name}}`}</span>;
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`${classes} transition hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/15 dark:hover:text-brand-400`}
    >
      {`{${name}}`}
    </button>
  );
}

export default function MessagesManager() {
  const { accessToken } = useAdminAuth();
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [editMessage, setEditMessage] = useState<Record<string, unknown> | null>(
    null,
  );
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState(MESSAGE_TEXT_FIELDS[0].key);
  const [insertParam, setInsertParam] = useState("");
  const [insertPosition, setInsertPosition] = useState<
    "cursor" | "start" | "end"
  >("cursor");
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMessages(accessToken);
      setMessages(asRecordArray(data));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load messages.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (
    message: Record<string, unknown>,
    active: boolean,
  ) => {
    if (!accessToken) return;
    const messageKey = String(message.message_key ?? "");
    if (!messageKey) return;
    setBusyKey(messageKey);
    try {
      // Preserve every other field on the record — PUT looks like a full
      // replace keyed by message_key, not a partial patch.
      await updateMessage(
        { ...message, message_key: messageKey, is_active: active } as MessageModel,
        accessToken,
      );
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update message.",
      );
    } finally {
      setBusyKey(null);
    }
  };

  const openEdit = (message: Record<string, unknown>) => {
    const values: Record<string, string> = {};
    for (const { key } of MESSAGE_TEXT_FIELDS) {
      values[key] = typeof message[key] === "string" ? (message[key] as string) : "";
    }
    setEditMessage(message);
    setEditValues(values);
    setFocusedField(MESSAGE_TEXT_FIELDS[0].key);
    setInsertParam(parameterNames(message)[0] ?? "");
    setInsertPosition("cursor");
    setEditError(null);
  };

  // Drops {name} into the focused text field at the caret (replacing any
  // selection), then restores focus just after the inserted token.
  const insertParameter = (name: string) => {
    const token = `{${name}}`;
    const textarea = textareaRefs.current[focusedField];
    const current = editValues[focusedField] ?? "";
    let start = textarea?.selectionStart ?? current.length;
    let end = textarea?.selectionEnd ?? current.length;
    if (insertPosition === "start") {
      start = end = 0;
    } else if (insertPosition === "end") {
      start = end = current.length;
    }
    // Keep words apart when dropping the token next to existing text.
    const before = current.slice(0, start);
    const after = current.slice(end);
    const prefix = before && !/\s$/.test(before) ? " " : "";
    const suffix = after && !/^\s/.test(after) ? " " : "";
    const inserted = prefix + token + suffix;
    setEditValues((prev) => ({
      ...prev,
      [focusedField]: before + inserted + after,
    }));
    start += prefix.length;
    requestAnimationFrame(() => {
      const el = textareaRefs.current[focusedField];
      if (!el) return;
      el.focus();
      const caret = start + token.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const submitEdit = async () => {
    if (!accessToken || !editMessage) return;
    const messageKey = String(editMessage.message_key ?? "");
    if (!messageKey) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      // Preserve every other field on the record — PUT looks like a full
      // replace keyed by message_key, not a partial patch. Only the message
      // text fields are user-editable here.
      await updateMessage(
        { ...editMessage, message_key: messageKey, ...editValues } as MessageModel,
        accessToken,
      );
      setEditMessage(null);
      await load();
    } catch (err) {
      setEditError(
        err instanceof ApiError ? err.message : "Failed to update message.",
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-7">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Messages
        </h3>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Message Key
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Parameters
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Active
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  Loading messages…
                </TableCell>
              </TableRow>
            ) : messages.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  No messages found.
                </TableCell>
              </TableRow>
            ) : (
              messages.map((message, index) => {
                const messageKey = String(message.message_key ?? index);
                const parameters = parameterNames(message);
                return (
                  <TableRow key={messageKey}>
                    <TableCell className="px-4 py-3 text-sm font-mono font-medium text-gray-800 dark:text-white/90">
                      {messageKey}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {parameters.length === 0 ? (
                        "—"
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {parameters.map((name) => (
                            <ParameterTag key={name} name={name} />
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      <Switch
                        checked={Boolean(message.is_active ?? true)}
                        disabled={busyKey === messageKey}
                        onChange={(checked) => handleToggle(message, checked)}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(message)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={editMessage !== null}
        onClose={() => setEditMessage(null)}
        className="max-w-lg p-6"
      >
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Edit Message
        </h4>
        {editMessage && (
          <div className="space-y-4">
            <p className="font-mono text-sm text-gray-500 dark:text-gray-400">
              {String(editMessage.message_key ?? "")}
            </p>
            <div>
              <Label>Parameters</Label>
              {parameterNames(editMessage).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This message has no parameters.
                </p>
              ) : (
                <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {parameterNames(editMessage).map((name) => (
                      <ParameterTag
                        key={name}
                        name={name}
                        active={(editValues[focusedField] ?? "").includes(`{${name}}`)}
                      />
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="insert-param">Parameter</Label>
                      <select
                        id="insert-param"
                        value={insertParam}
                        onChange={(e) => setInsertParam(e.target.value)}
                        className={selectClasses}
                      >
                        {parameterNames(editMessage).map((name) => (
                          <option key={name} value={name}>{`{${name}}`}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="insert-lang">Add to</Label>
                      <select
                        id="insert-lang"
                        value={focusedField}
                        onChange={(e) => setFocusedField(e.target.value)}
                        className={selectClasses}
                      >
                        {MESSAGE_TEXT_FIELDS.map(({ key, label }) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="insert-position">Position</Label>
                      <select
                        id="insert-position"
                        value={insertPosition}
                        onChange={(e) =>
                          setInsertPosition(
                            e.target.value as "cursor" | "start" | "end",
                          )
                        }
                        className={selectClasses}
                      >
                        <option value="cursor">At cursor</option>
                        <option value="start">Start of message</option>
                        <option value="end">End of message</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full sm:w-auto"
                    disabled={!insertParam}
                    onClick={() => insertParameter(insertParam)}
                  >
                    Insert parameter
                  </Button>
                  <p className="mt-2 text-theme-xs text-gray-500 dark:text-gray-400">
                    Only the message&apos;s predefined parameters can be added;
                    the parameter list itself can&apos;t be changed.
                  </p>
                </div>
              )}
            </div>
            {MESSAGE_TEXT_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <Label htmlFor={`edit-${key}`}>{label}</Label>
                <textarea
                  id={`edit-${key}`}
                  rows={3}
                  ref={(el) => {
                    textareaRefs.current[key] = el;
                  }}
                  onFocus={() => setFocusedField(key)}
                  value={editValues[key] ?? ""}
                  onChange={(e) =>
                    setEditValues((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="h-auto w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:focus:border-brand-800"
                />
              </div>
            ))}
            {editError && <p className="text-sm text-error-500">{editError}</p>}
            <Button
              className="w-full"
              onClick={submitEdit}
              disabled={editSubmitting}
            >
              {editSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
