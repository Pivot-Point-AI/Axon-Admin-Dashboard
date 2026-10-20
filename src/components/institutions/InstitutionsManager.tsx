"use client";

import Pagination from "@/components/common/Pagination";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import usePagination from "@/hooks/usePagination";
import useRequiredFields from "@/hooks/useRequiredFields";
import { useTranslations } from "next-intl";
import { notify } from "@/lib/feedback";
import DateTimeField from "@/components/form/DateTimeField";
import Switch from "@/components/form/input/Switch";
import StatusBadge from "@/components/common/StatusBadge";
import { isFutureDateTime } from "@/utils/dateTime";
import { CopyIcon } from "@/icons";
import { useConfirm } from "@/context/FeedbackContext";
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
import { PencilIcon, PlusIcon, TimeIcon, TrashBinIcon } from "@/icons/index";
import { ApiError } from "@/lib/api/client";
import {
  createInstitution,
  getAllInstitutions,
  removeInstitution,
  renewInstitutionLicense,
  updateInstitution,
} from "@/lib/api/institutions";
import type { InstitutionItem } from "@/lib/api/types";

function toDateTimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

function isExpired(iso: string | null): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
}

export default function InstitutionsManager() {
  const createRequired = useRequiredFields();
  const editRequired = useRequiredFields();
  const renewRequired = useRequiredFields();
  const t = useTranslations("fixes");
  const m = useTranslations("managementDesign");
  const status = useTranslations("status");
  const [credentialsCopied, setCredentialsCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const confirm = useConfirm();
  const { accessToken } = useAdminAuth();
  const [institutions, setInstitutions] = useState<InstitutionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createExpiry, setCreateExpiry] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createResult, setCreateResult] = useState<{
    institutionId: string;
    licenseKey: string;
  } | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<InstitutionItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const editChanged =
    !!editTarget &&
    (editName.trim() !== editTarget.institution_name.trim() ||
      editActive !== (editTarget.is_active ?? true));

  const [renewTarget, setRenewTarget] = useState<InstitutionItem | null>(null);
  const [renewExpiry, setRenewExpiry] = useState("");
  const [renewActive, setRenewActive] = useState(true);
  const [renewSubmitting, setRenewSubmitting] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadInstitutions = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAllInstitutions(accessToken);
      setInstitutions(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load institutions.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadInstitutions();
  }, [loadInstitutions]);

  const openCreate = () => {
    createRequired.reset();
    setCreateName("");
    setCreateExpiry("");
    setCreateError(null);
    setCreateResult(null);
    setCredentialsCopied(false);
    setCreateOpen(true);
  };

  const closeCreate = () => {
    if (createSubmitting || copying) return;
    if (createResult && !credentialsCopied) {
      notify({ kind: "error", message: t("copyRequired") });
      return;
    }
    setCreateOpen(false);
  };
  const copyCredentials = async () => {
    if (!createResult) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(
        `Institution ID: ${createResult.institutionId}\nLicense Key: ${createResult.licenseKey}`,
      );
      setCredentialsCopied(true);
      notify({ kind: "success", message: t("copied") });
    } catch {
      notify({ kind: "error", message: t("copyFailed") });
    } finally {
      setCopying(false);
    }
  };

  const submitCreate = async () => {
    setCreateError(null);
    if (!createRequired.validate([createName, createExpiry]) || !accessToken)
      return;
    if (!isFutureDateTime(createExpiry)) {
      setCreateError(t("futureDateRequired"));
      return;
    }
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      const response = await createInstitution(
        {
          institution_name: createName.trim(),
          license_expires_at: new Date(createExpiry).toISOString(),
        },
        accessToken,
      );
      setCreateResult({
        institutionId: response.institution_id,
        licenseKey: response.license_key,
      });
      await loadInstitutions();
    } catch (err) {
      setCreateError(
        err instanceof ApiError ? err.message : "Failed to create institution.",
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEdit = (institution: InstitutionItem) => {
    editRequired.reset();
    setEditTarget(institution);
    setEditName(institution.institution_name);
    setEditActive(institution.is_active ?? true);
    setEditError(null);
  };

  const submitEdit = async () => {
    if (!editTarget || !accessToken || editSubmitting || !editChanged) return;
    setEditError(null);
    if (!editRequired.validate([editName])) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateInstitution(
        editTarget.institution_id,
        { institution_name: editName.trim(), is_active: editActive },
        accessToken,
      );
      setEditTarget(null);
      await loadInstitutions();
    } catch (err) {
      setEditError(
        err instanceof ApiError ? err.message : "Failed to update institution.",
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const openRenew = (institution: InstitutionItem) => {
    renewRequired.reset();
    setRenewTarget(institution);
    setRenewExpiry(toDateTimeLocalValue(institution.license_expires_at));
    setRenewActive(institution.is_active ?? true);
    setRenewError(null);
  };

  const submitRenew = async () => {
    if (!renewTarget || !accessToken) return;
    setRenewError(null);
    if (!renewRequired.validate([renewExpiry])) return;
    if (!isFutureDateTime(renewExpiry)) {
      setRenewError(t("futureDateRequired"));
      return;
    }
    setRenewSubmitting(true);
    setRenewError(null);
    try {
      await renewInstitutionLicense(
        renewTarget.institution_id,
        { license_expires_at: new Date(renewExpiry).toISOString() },
        accessToken,
      );
      if (renewActive !== (renewTarget.is_active ?? true)) {
        try {
          await updateInstitution(
            renewTarget.institution_id,
            { is_active: renewActive },
            accessToken,
          );
        } catch (err) {
          setRenewError(
            `${t("licenseStatusFailed")}${err instanceof ApiError ? ` ${err.message}` : ""}`,
          );
          await loadInstitutions();
          return;
        }
      }
      setRenewTarget(null);
      await loadInstitutions();
    } catch (err) {
      setRenewError(
        err instanceof ApiError ? err.message : "Failed to renew license.",
      );
    } finally {
      setRenewSubmitting(false);
    }
  };

  const handleDelete = async (institution: InstitutionItem) => {
    if (!accessToken) return;
    if (
      !(await confirm(
        `Remove "${institution.institution_name}"? This cannot be undone.`,
      ))
    ) {
      return;
    }
    setDeletingId(institution.institution_id);
    try {
      await removeInstitution(institution.institution_id, accessToken);
      await loadInstitutions();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to delete institution.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const pagination = usePagination(institutions, "");

  return (
    <>
      <PageBreadcrumb
        pageTitle="Institutions"
        description={m("institutionsSubtitle")}
      >
        <Button
          size="sm"
          startIcon={
            <PlusIcon className="size-5 text-success-200 dark:text-success-200" />
          }
          onClick={openCreate}
        >
          New Institution
        </Button>
      </PageBreadcrumb>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        {error && (
          <div className="mb-4 rounded-lg border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
            {error}
          </div>
        )}

      <Pagination variant="header" pagination={pagination} disabled={loading} />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Institution
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Institution ID
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                License Expiry
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {status("title")}
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
                  Loading institutions…
                </TableCell>
              </TableRow>
            ) : institutions.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  No institutions yet.
                </TableCell>
              </TableRow>
            ) : (
              pagination.items.map((institution) => (
                <TableRow key={institution.institution_id}>
                  <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                    {institution.institution_name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="break-all">
                        {institution.institution_id}
                      </span>
                      <ActionIconButton
                        type="button"
                        aria-label={t("copy")}
                        title={t("copy")}
                        tone="copy"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              institution.institution_id,
                            );
                            notify({ kind: "success", message: t("copied") });
                          } catch {
                            notify({ kind: "error", message: t("copyFailed") });
                          }
                        }}
                      >
                        <CopyIcon className="size-4" />
                      </ActionIconButton>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <span
                      className={
                        isExpired(institution.license_expires_at)
                          ? "text-error-500"
                          : "text-gray-600 dark:text-gray-300"
                      }
                    >
                      {formatDate(institution.license_expires_at)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <StatusBadge active={institution.is_active ?? true} />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <ActionIconButton
                        tone="edit"
                        title={t("editInstitution")}
                        onClick={() => openEdit(institution)}
                      >
                        <PencilIcon />
                      </ActionIconButton>
                      <ActionIconButton
                        tone="renew"
                        title="Renew license"
                        onClick={() => openRenew(institution)}
                      >
                        <TimeIcon />
                      </ActionIconButton>
                      <ActionIconButton
                        tone="delete"
                        title="Remove institution"
                        disabled={deletingId === institution.institution_id}
                        onClick={() => handleDelete(institution)}
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
      <Pagination variant="footer" pagination={pagination} disabled={loading} />

      {/* Create institution */}
      <Modal isOpen={createOpen} onClose={closeCreate} className="max-w-md p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          New Institution
        </h4>
        {createResult ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Institution created. Save this license key now — it won&apos;t be
              shown again.
            </p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="text-gray-500 dark:text-gray-400">
                Institution ID
              </div>
              <div className="font-mono mb-2 break-all text-gray-800 dark:text-white/90">
                {createResult.institutionId}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                License Key
              </div>
              <div className="font-mono break-all text-gray-800 dark:text-white/90">
                {createResult.licenseKey}
              </div>
            </div>
            <Button
              className="w-full"
              startIcon={
                <CopyIcon className="size-5 text-brand-100 dark:text-white" />
              }
              onClick={copyCredentials}
              disabled={copying}
            >
              {t("copyBoth")}
            </Button>
            {credentialsCopied && (
              <Button className="w-full" onClick={closeCreate}>
                {t("done")}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">
                Institution Name <span className="text-error-500">*</span>
              </Label>
              <Input
                id="create-name"
                error={createRequired.invalid(createName)}
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. First National Bank"
              />
            </div>
            <div>
              <Label htmlFor="create-expiry">
                License Expires At <span className="text-error-500">*</span>
              </Label>
              <DateTimeField
                id="create-expiry"
                error={createRequired.invalid(createExpiry)}
                value={createExpiry}
                onChange={setCreateExpiry}
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
              {createSubmitting ? "Creating…" : "Create Institution"}
            </Button>
          </div>
        )}
      </Modal>

      {/* Edit institution name */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        className="max-w-md p-6"
      >
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("editInstitution")}
        </h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Institution Name</Label>
            <Input
              id="edit-name"
              error={editRequired.invalid(editName)}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <Switch
            id="institution-active"
            label={status(editActive ? "active" : "inactive")}
            checked={editActive}
            onChange={setEditActive}
          />
          {editError && <p className="text-sm text-error-500">{editError}</p>}
          <Button
            className="w-full"
            onClick={submitEdit}
            disabled={editSubmitting || !editChanged}
          >
            {editSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </Modal>

      {/* Renew license */}
      <Modal
        isOpen={!!renewTarget}
        onClose={() => setRenewTarget(null)}
        className="max-w-md p-6"
      >
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Renew License
        </h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="renew-expiry">
              New License Expiry <span className="text-error-500">*</span>
            </Label>
            <DateTimeField
              id="renew-expiry"
              error={renewRequired.invalid(renewExpiry)}
              value={renewExpiry}
              onChange={setRenewExpiry}
            />
          </div>
          <Switch
            id="license-active"
            label={status(renewActive ? "active" : "inactive")}
            checked={renewActive}
            onChange={setRenewActive}
          />
          {renewError && <p className="text-sm text-error-500">{renewError}</p>}
          <Button
            className="w-full"
            onClick={submitRenew}
            disabled={renewSubmitting}
          >
            {renewSubmitting ? "Renewing…" : "Renew License"}
          </Button>
        </div>
      </Modal>
    </div>
  </>
);
}
