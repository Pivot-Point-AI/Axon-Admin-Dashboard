"use client";

import Pagination from "@/components/common/Pagination";
import usePagination from "@/hooks/usePagination";
import useRequiredFields from "@/hooks/useRequiredFields";
import { useConfirm } from "@/context/FeedbackContext";
import { useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAccessToken } from "@/hooks/useAccessToken";
import { ApiError } from "@/lib/api/client";
import { deleteChatHistory, getChatHistory } from "@/lib/api/chatHistory";
import type { ChatHistoryMessage } from "@/lib/api/types";

function defaultDateRange() {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 7);
  return {
    from: from.toISOString().slice(0, 16),
    to: now.toISOString().slice(0, 16),
  };
}

export default function ChatHistoryExplorer() {
  const confirm = useConfirm();
  const { token, setToken } = useAccessToken();
  const [userId, setUserId] = useState("");
  const [dateFrom, setDateFrom] = useState(defaultDateRange().from);
  const [dateTo, setDateTo] = useState(defaultDateRange().to);

  const [messages, setMessages] = useState<ChatHistoryMessage[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const required = useRequiredFields();

  const runSearch = async () => {
    setError(null);
    if (!required.validate([userId, dateFrom, dateTo, token])) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const response = await getChatHistory(
        {
          userId: userId.trim(),
          dateFrom: new Date(dateFrom).toISOString(),
          dateTo: new Date(dateTo).toISOString(),
        },
        token,
      );
      setMessages(response.messages);
      pagination.setPage(1);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load chat history.",
      );
      setMessages(null);
    } finally {
      setLoading(false);
    }
  };

  const runDelete = async () => {
    if (!userId.trim()) return;
    if (
      !(await confirm(
        `Delete all chat history for user "${userId.trim()}"? This cannot be undone.`,
      ))
    ) {
      return;
    }
    setDeleting(true);
    setError(null);
    setNotice(null);
    try {
      const response = await deleteChatHistory(userId.trim(), token);
      setNotice(`Deleted ${response.deleted_messages} message(s).`);
      setMessages(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to delete chat history.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const pagination = usePagination(messages ?? [], "");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Access Token
        </h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Chat history is bearer-protected. Until an admin login endpoint is
          available, paste a token obtained from{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-800">
            /start-session
          </code>{" "}
          here. It is kept only in this browser.
        </p>
        <Label htmlFor="access-token">Bearer Token</Label>
        <Input
          id="access-token"
          error={required.invalid(token)}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste access_token here"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Search Chat History
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="user-id">User ID</Label>
            <Input
              id="user-id"
              error={required.invalid(userId)}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. user-123"
            />
          </div>
          <div>
            <Label htmlFor="date-from">From</Label>
            <Input
              id="date-from"
              error={required.invalid(dateFrom)}
              type="datetime-local"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="date-to">To</Label>
            <Input
              id="date-to"
              error={required.invalid(dateTo)}
              type="datetime-local"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={runSearch} disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </Button>
          <Button
            variant="danger"
            onClick={runDelete}
            disabled={!userId.trim() || !token || deleting}
          >
            {deleting ? "Deleting…" : "Delete History for User"}
          </Button>
        </div>

        {error && <p className="mt-3 text-sm text-error-500">{error}</p>}
        {notice && <p className="mt-3 text-sm text-success-500">{notice}</p>}
      </div>

      {messages && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Messages ({messages.length})
          </h3>
          <Pagination
            variant="header"
            pagination={pagination}
            disabled={loading}
          />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Time
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Type
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Content
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {messages.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      No messages in this range.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagination.items.map((message, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-4 py-3 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {new Date(message.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {message.type}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                        {typeof message.content === "string"
                          ? message.content
                          : JSON.stringify(message.content)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination
            variant="footer"
            pagination={pagination}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}
