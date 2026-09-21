"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { PlusIcon, TrashBinIcon } from "@/icons/index";
import { ApiError } from "@/lib/api/client";
import {
  createDashboardUser,
  deleteDashboardUser,
  listDashboardUsers,
} from "@/lib/api/adminUsers";
import type { DashboardUserResponse } from "@/lib/api/types";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

export default function UsersManager() {
  const { accessToken } = useAdminAuth();
  const [users, setUsers] = useState<DashboardUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createUsername, setCreateUsername] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState("admin");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listDashboardUsers(accessToken);
      setUsers(data ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setCreateUsername("");
    setCreateEmail("");
    setCreateRole("admin");
    setCreateError(null);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!accessToken) return;
    if (!createUsername.trim() || !createEmail.trim() || !createRole.trim()) {
      setCreateError("Username, email, and role are required.");
      return;
    }
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      await createDashboardUser(
        {
          username: createUsername.trim(),
          email: createEmail.trim(),
          role: createRole.trim(),
        },
        accessToken,
      );
      setCreateOpen(false);
      await load();
    } catch (err) {
      setCreateError(
        err instanceof ApiError ? err.message : "Failed to create user.",
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleDelete = async (user: DashboardUserResponse) => {
    if (!accessToken) return;
    if (!window.confirm(`Remove "${user.username}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(user.user_id);
    try {
      await deleteDashboardUser(user.user_id, accessToken);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-7">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Dashboard Users
        </h3>
        <Button size="sm" startIcon={<PlusIcon />} onClick={openCreate}>
          New User
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
                Username
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Email
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Role
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Created
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
                  Loading users…
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  No dashboard users yet.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                    {user.username}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-theme-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <button
                      className="text-gray-500 hover:text-error-500 dark:text-gray-400 disabled:opacity-40"
                      title="Remove user"
                      disabled={deletingId === user.user_id}
                      onClick={() => handleDelete(user)}
                    >
                      <TrashBinIcon />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} className="max-w-md p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          New Dashboard User
        </h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="create-username">Username</Label>
            <Input
              id="create-username"
              value={createUsername}
              onChange={(e) => setCreateUsername(e.target.value)}
              placeholder="e.g. jane.doe"
            />
          </div>
          <div>
            <Label htmlFor="create-email">Email</Label>
            <Input
              id="create-email"
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <Label htmlFor="create-role">Role</Label>
            <Input
              id="create-role"
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value)}
              placeholder="e.g. admin"
            />
          </div>
          {createError && (
            <p className="text-sm text-error-500">{createError}</p>
          )}
          <Button
            className="w-full"
            onClick={submitCreate}
            disabled={createSubmitting}
          >
            {createSubmitting ? "Creating…" : "Create User"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
