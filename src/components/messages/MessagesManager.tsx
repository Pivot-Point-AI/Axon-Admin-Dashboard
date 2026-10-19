"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/context/AdminAuthContext";
import usePagination from "@/hooks/usePagination";
import { PencilIcon, RefreshIcon } from "@/icons";
import { ApiError } from "@/lib/api/client";
import { getLanguages } from "@/lib/api/languages";
import { getMessages, updateMessage } from "@/lib/api/messages";
import { asRecordArray } from "@/lib/api/normalize";
import type { MessageModel } from "@/lib/api/types";
import MessageRow from "./MessageRow";
import {
  messageDraft,
  messageChanged,
  messageTextFields,
  messageUpdate,
  type MessageDraft,
} from "./messageFields";

export default function MessagesManager() {
  const t = useTranslations("messageEditor");
  const { accessToken } = useAdminAuth();
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);
  const [languages, setLanguages] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, MessageDraft>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editSession, setEditSession] = useState(0);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      setMessages(asRecordArray(await getMessages(accessToken)));
      void getLanguages(accessToken)
        .then((data) => setLanguages(asRecordArray(data)))
        .catch(() => {});
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const fields = messageTextFields(languages);

  const toggleEditing = () => {
    if (savingKey !== null) return;
    setDrafts({});
    setEditSession((session) => session + 1);
    setEditing((previous) => !previous);
  };

  const saveMessage = async (
    message: Record<string, unknown>,
    draft: MessageDraft,
  ) => {
    const messageKey = String(message.message_key ?? "");
    if (
      !accessToken ||
      !editing ||
      savingKey !== null ||
      !messageKey ||
      !messageChanged(message, draft, fields)
    )
      return;
    setSavingKey(messageKey);
    try {
      const updated = {
        ...messageUpdate(message, draft, fields),
        message_key: messageKey,
      };
      await updateMessage(updated as MessageModel, accessToken);
      // Update the saved record without reloading the other rows' drafts.
      setMessages((previous) =>
        previous.map((item) =>
          item.message_key === messageKey ? updated : item,
        ),
      );
      setDrafts((previous) => {
        const next = { ...previous };
        delete next[messageKey];
        return next;
      });
    } finally {
      setSavingKey(null);
    }
  };

  const pagination = usePagination(messages);
  const headings = [
    t("messageKey"),
    t("parameters"),
    t("language"),
    t("message"),
    t("status"),
    ...(editing ? [t("actions")] : []),
  ];

  return (
    <div className="axon-management-panel rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h3>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant={editing ? "outline" : "primary"}
            onClick={toggleEditing}
            disabled={loading || savingKey !== null || messages.length === 0}
            startIcon={<PencilIcon className="size-4" />}
          >
            {t(editing ? "cancelEditing" : "edit")}
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={load}
            disabled={loading || editing}
            startIcon={
              <RefreshIcon
                className={`size-4 ${loading ? "motion-safe:animate-spin" : ""}`}
              />
            }
          >
            {t(loading ? "refreshing" : "refresh")}
          </Button>
        </div>
      </div>
      {editing && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {t("editingHint")}
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
        >
          {error}
        </div>
      )}
      <Pagination variant="header" pagination={pagination} disabled={loading} />
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
        <Table>
          <TableHeader className="border-b border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-white/2">
            <TableRow>
              {headings.map((heading) => (
                <TableCell
                  key={heading}
                  isHeader
                  className="px-4 py-3 text-start text-theme-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400"
                >
                  {heading}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || messages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={headings.length}
                  className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400"
                >
                  {t(loading ? "loading" : "empty")}
                </TableCell>
              </TableRow>
            ) : (
              pagination.items.map((message, index) => {
                const messageKey = String(message.message_key ?? "");
                return (
                  <MessageRow
                    key={`${messageKey || index}:${editSession}`}
                    message={message}
                    fields={fields}
                    draft={
                      editing
                        ? (drafts[messageKey] ?? messageDraft(message, fields))
                        : messageDraft(message, fields)
                    }
                    editing={editing}
                    saving={savingKey === messageKey}
                    busy={savingKey !== null}
                    onChange={(draft) =>
                      setDrafts((previous) => ({
                        ...previous,
                        [messageKey]: draft,
                      }))
                    }
                    onSave={saveMessage}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination variant="footer" pagination={pagination} disabled={loading} />
    </div>
  );
}
