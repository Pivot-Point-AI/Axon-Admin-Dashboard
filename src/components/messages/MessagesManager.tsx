"use client";

import { RowsPerPage } from "@/components/common/Pagination";
import PageRefresh from "@/components/common/PageRefresh";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Pagination from "@/components/common/Pagination";
import Input from "@/components/form/input/InputField";
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
import { PencilIcon } from "@/icons";
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
  const [kind, setKind] = useState("");
  const [query, setQuery] = useState("");

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

  // Keys read "group.type.state" (action_status.activate_card.completed); the
  // second part is what the type filter lists.
  const part = (message: Record<string, unknown>, index: number) =>
    String(message.message_key ?? "").split(".")[index] ?? "";
  const unique = (values: string[]) =>
    [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const kinds = unique(messages.map((message) => part(message, 1)));
  const needle = query.trim().toLowerCase();
  const visible = messages.filter(
    (message) =>
      (!kind || part(message, 1) === kind) &&
      (!needle || JSON.stringify(message).toLowerCase().includes(needle)),
  );
  const pagination = usePagination(visible, `${kind}|${needle}`);
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
      <PageRefresh
        loading={loading}
        error={!!error}
        onRefresh={load}
        disabled={editing}
      />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h3>
        <div className="flex flex-1 flex-wrap gap-3">
          <Input
            type="search"
            aria-label={t("search")}
            placeholder={t("search")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-60 bg-gray-50 dark:bg-gray-900"
          />
          {[
            {
              id: "kind",
              label: t("allTypes"),
              value: kind,
              options: kinds,
              change: setKind,
            },
          ].map((filter) => (
            <select
              key={filter.id}
              aria-label={filter.label}
              value={filter.value}
              onChange={(event) => filter.change(event.target.value)}
              disabled={loading || messages.length === 0}
              className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {option.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <RowsPerPage pagination={pagination} disabled={loading} />
          <Button
            size="sm"
            variant={editing ? "outline" : "primary"}
            onClick={toggleEditing}
            disabled={loading || savingKey !== null || messages.length === 0}
            startIcon={<PencilIcon className="size-4" />}
          >
            {t(editing ? "cancelEditing" : "edit")}
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
      <Pagination
        variant="header"
        pagination={pagination}
        disabled={loading}
        showRows={false}
      />
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
            {loading || visible.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={headings.length}
                  className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400"
                >
                  {t(
                    loading
                      ? "loading"
                      : messages.length === 0
                        ? "empty"
                        : "noMatch",
                  )}
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
