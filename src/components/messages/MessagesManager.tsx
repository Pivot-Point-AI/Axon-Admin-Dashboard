"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
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
    setEditError(null);
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
                const parameters = Array.isArray(message.parameters)
                  ? message.parameters.join(", ")
                  : "—";
                return (
                  <TableRow key={messageKey}>
                    <TableCell className="px-4 py-3 text-sm font-mono font-medium text-gray-800 dark:text-white/90">
                      {messageKey}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {parameters}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      <Checkbox
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
        className="max-w-md p-6"
      >
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Edit Message
        </h4>
        {editMessage && (
          <div className="space-y-4">
            <p className="font-mono text-sm text-gray-500 dark:text-gray-400">
              {String(editMessage.message_key ?? "")}
            </p>
            {MESSAGE_TEXT_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <Label htmlFor={`edit-${key}`}>{label}</Label>
                <textarea
                  id={`edit-${key}`}
                  rows={3}
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
