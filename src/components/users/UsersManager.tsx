"use client";

import { RowsPerPage } from "@/components/common/Pagination";
import PageRefresh from "@/components/common/PageRefresh";
import Pagination from "@/components/common/Pagination";
import usePagination from "@/hooks/usePagination";
import useModal from "@/hooks/useModal";
import EditUserModal from "./EditUserModal";
import { useConfirm } from "@/context/FeedbackContext";
import useRequiredFields from "@/hooks/useRequiredFields";
import { useFormatter, useTranslations } from "next-intl";
import ManagementMetrics from "@/components/common/ManagementMetrics";
import { GroupIcon, UserCircleIcon, UserIcon, CheckCircleIcon } from "@/icons";
import { useCallback, useEffect, useState } from "react";
import ActionIconButton from "@/components/ui/button/ActionIconButton";
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
import { PencilIcon, PlusIcon, TrashBinIcon } from "@/icons/index";
import { ApiError } from "@/lib/api/client";
import {
  createDashboardUser,
  deleteDashboardUser,
  listDashboardUsers,
} from "@/lib/api/adminUsers";
import type { DashboardUserResponse } from "@/lib/api/types";

const USER_ROLES = ["MANAGER", "VIEWER"];

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

export default function UsersManager() {
  const f = useTranslations("fixes");
  const confirm = useConfirm();
  const t = useTranslations("managementDesign");
  const c = useTranslations("metricCards");
  const format = useFormatter();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const { accessToken } = useAdminAuth();
  const [users, setUsers] = useState<DashboardUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createUsername, setCreateUsername] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState("MANAGER");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const editModal = useModal();
  const [editTarget, setEditTarget] = useState<DashboardUserResponse | null>(
    null,
  );

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

  const createRequired = useRequiredFields();

  const openCreate = () => {
    createRequired.reset();
    setCreateUsername("");
    setCreateEmail("");
    setCreateRole("MANAGER");
    setCreateError(null);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!accessToken) return;
    if (!USER_ROLES.includes(createRole)) {
      setCreateError(f("editRoleInvalid"));
      return;
    }
    setCreateError(null);
    if (!createRequired.validate([createUsername, createEmail, createRole]))
      return;
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
    if (!(await confirm(`Remove "${user.username}"? This cannot be undone.`))) {
      return;
    }
    setDeletingId(user.user_id);
    try {
      await deleteDashboardUser(user.user_id, accessToken);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to delete user.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const visibleUsers = users.filter(
    (user) =>
      (!roleFilter || user.role === roleFilter) &&
      `${user.username} ${user.email} ${user.role}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const roleCount = (role: string) =>
    users.filter((user) => user.role.toUpperCase() === role).length;
  const roleShare = (role: string) =>
    c("ofTotal", {
      percent: format.number(
        users.length ? roleCount(role) / users.length : 0,
        { style: "percent", maximumFractionDigits: 1 },
      ),
    });

  const pagination = usePagination(
    visibleUsers,
    JSON.stringify([query, roleFilter]),
  );

  return (
    <div className="space-y-5">
      <PageRefresh loading={loading} error={!!error} onRefresh={load} />
      <ManagementMetrics
        loading={loading || !!error}
        items={[
          {
            label: t("totalUsers"),
            value: users.length,
            icon: <GroupIcon />,
            tone: "brand",
            description: c("usersHint"),
          },
          {
            label: t("administrators"),
            value: roleCount("SUPER_ADMIN"),
            icon: <CheckCircleIcon />,
            tone: "purple",
            description: roleShare("SUPER_ADMIN"),
          },
          {
            label: t("managers"),
            value: roleCount("MANAGER"),
            icon: <UserCircleIcon />,
            tone: "warning",
            description: roleShare("MANAGER"),
          },
          {
            label: t("viewers"),
            value: roleCount("VIEWER"),
            icon: <UserIcon />,
            tone: "success",
            description: roleShare("VIEWER"),
          },
        ]}
      />
      <div className="axon-management-panel rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-7">
          <div className="flex flex-1 flex-wrap gap-3">
            <Input
              type="search"
              aria-label={t("searchUsers")}
              placeholder={t("searchUsers")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-60 bg-gray-50 dark:bg-gray-900"
            />
            <select
              aria-label={t("allRoles")}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="">{t("allRoles")}</option>
              {Array.from(
                new Set([...USER_ROLES, ...users.map((user) => user.role)]),
              ).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <RowsPerPage pagination={pagination} disabled={loading} />
            <Button
              size="sm"
              startIcon={
                <PlusIcon className="size-5 text-success-200 dark:text-success-200" />
              }
              onClick={openCreate}
            >
              New User
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
            {error}
          </div>
        )}

        <Pagination
          variant="header"
          pagination={pagination}
          disabled={loading}
          showRows={false}
        />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Username
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Created
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
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
              ) : visibleUsers.length === 0 ? (
                <TableRow>
                  <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {users.length ? t("noMatches") : "No dashboard users yet."}
                  </TableCell>
                </TableRow>
              ) : (
                pagination.items.map((user, index) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                      <div className="flex items-center gap-3">
                        <span
                          className={`axon-user-avatar axon-user-avatar-${index % 4} flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white dark:text-white`}
                        >
                          {user.username.slice(0, 1).toUpperCase()}
                        </span>
                        {user.username}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      <span
                        className={`text-theme-xs font-medium ${user.role === "SUPER_ADMIN" ? "text-theme-purple-500 dark:text-theme-purple-500" : user.role === "MANAGER" ? "text-orange-600 dark:text-orange-400" : "text-brand-600 dark:text-brand-300"}`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <ActionIconButton
                          tone="edit"
                          title={f("editUser")}
                          onClick={() => {
                            setEditTarget(user);
                            editModal.openModal();
                          }}
                        >
                          <PencilIcon />
                        </ActionIconButton>
                        <ActionIconButton
                          tone="delete"
                          title="Remove user"
                          disabled={deletingId === user.user_id}
                          onClick={() => handleDelete(user)}
                        >
                          <TrashBinIcon />
                        </ActionIconButton>
                      </div>
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
        {editModal.isOpen && editTarget && accessToken && (
          <EditUserModal
            key={editTarget.user_id}
            user={editTarget}
            accessToken={accessToken}
            onClose={editModal.closeModal}
            onSaved={load}
          />
        )}
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          className="max-w-md p-6"
        >
          <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            New Dashboard User
          </h4>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submitCreate();
            }}
          >
            <div>
              <Label htmlFor="create-username">
                Username <span className="text-error-500">*</span>
              </Label>
              <Input
                id="create-username"
                error={createRequired.invalid(createUsername)}
                required
                value={createUsername}
                onChange={(e) => setCreateUsername(e.target.value)}
                placeholder="e.g. jane.doe"
              />
            </div>
            <div>
              <Label htmlFor="create-email">
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                id="create-email"
                error={createRequired.invalid(createEmail)}
                required
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <Label htmlFor="create-role">
                Role <span className="text-error-500">*</span>
              </Label>
              <select
                id="create-role"
                required
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent py-2.5 ps-4 pe-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            {createError && (
              <p className="text-sm text-error-500">{createError}</p>
            )}
            <Button
              className="w-full"
              type="submit"
              disabled={createSubmitting}
            >
              {createSubmitting ? "Creating…" : "Create User"}
            </Button>
          </form>
        </Modal>
      </div>
    </div>
  );
}
