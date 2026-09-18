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
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [renewTarget, setRenewTarget] = useState<InstitutionItem | null>(
    null,
  );
  const [renewExpiry, setRenewExpiry] = useState("");
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
      setError(err instanceof ApiError ? err.message : "Failed to load institutions.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadInstitutions();
  }, [loadInstitutions]);

  const openCreate = () => {
    setCreateName("");
    setCreateExpiry("");
    setCreateError(null);
    setCreateResult(null);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!createName.trim() || !createExpiry || !accessToken) {
      setCreateError("Institution name and license expiry are required.");
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
    setEditTarget(institution);
    setEditName(institution.institution_name);
    setEditError(null);
  };

  const submitEdit = async () => {
    if (!editTarget || !accessToken) return;
    if (!editName.trim()) {
      setEditError("Institution name is required.");
      return;
    }
    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateInstitution(
        editTarget.institution_id,
        { institution_name: editName.trim() },
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
    setRenewTarget(institution);
    setRenewExpiry(toDateTimeLocalValue(institution.license_expires_at));
    setRenewError(null);
  };

  const submitRenew = async () => {
    if (!renewTarget || !accessToken) return;
    if (!renewExpiry) {
      setRenewError("New license expiry is required.");
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
      !window.confirm(
        `Remove "${institution.institution_name}"? This cannot be undone.`,
      )
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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-7">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Institutions
        </h3>
        <Button size="sm" startIcon={<PlusIcon />} onClick={openCreate}>
          New Institution
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
                Institution
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Institution ID
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                License Expiry
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
              institutions.map((institution) => (
                <TableRow key={institution.institution_id}>
                  <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                    {institution.institution_name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {institution.institution_id}
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
                    <div className="flex items-center gap-3">
                      <button
                        className="text-gray-500 hover:text-brand-500 dark:text-gray-400"
                        title="Edit name"
                        onClick={() => openEdit(institution)}
                      >
                        <PencilIcon />
                      </button>
                      <button
                        className="text-gray-500 hover:text-brand-500 dark:text-gray-400"
                        title="Renew license"
                        onClick={() => openRenew(institution)}
                      >
                        <TimeIcon />
                      </button>
                      <button
                        className="text-gray-500 hover:text-error-500 dark:text-gray-400 disabled:opacity-40"
                        title="Remove institution"
                        disabled={deletingId === institution.institution_id}
                        onClick={() => handleDelete(institution)}
                      >
                        <TrashBinIcon />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create institution */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} className="max-w-md p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          New Institution
        </h4>
        {createResult ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Institution created. Save this license key now — it won&apos;t
              be shown again.
            </p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="text-gray-500 dark:text-gray-400">Institution ID</div>
              <div className="mb-2 break-all font-mono text-gray-800 dark:text-white/90">
                {createResult.institutionId}
              </div>
              <div className="text-gray-500 dark:text-gray-400">License Key</div>
              <div className="break-all font-mono text-gray-800 dark:text-white/90">
                {createResult.licenseKey}
              </div>
            </div>
            <Button className="w-full" onClick={() => setCreateOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Institution Name</Label>
              <Input
                id="create-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. First National Bank"
              />
            </div>
            <div>
              <Label htmlFor="create-expiry">License Expires At</Label>
              <Input
                id="create-expiry"
                type="datetime-local"
                value={createExpiry}
                onChange={(e) => setCreateExpiry(e.target.value)}
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
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} className="max-w-md p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Rename Institution
        </h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Institution Name</Label>
            <Input
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          {editError && <p className="text-sm text-error-500">{editError}</p>}
          <Button
            className="w-full"
            onClick={submitEdit}
            disabled={editSubmitting}
          >
            {editSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </Modal>

      {/* Renew license */}
      <Modal isOpen={!!renewTarget} onClose={() => setRenewTarget(null)} className="max-w-md p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Renew License
        </h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="renew-expiry">New License Expiry</Label>
            <Input
              id="renew-expiry"
              type="datetime-local"
              value={renewExpiry}
              onChange={(e) => setRenewExpiry(e.target.value)}
            />
          </div>
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
  );
}
