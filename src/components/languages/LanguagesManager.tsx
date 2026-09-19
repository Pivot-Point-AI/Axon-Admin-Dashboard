"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Checkbox from "@/components/form/input/Checkbox";
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
  createLanguage,
  getLanguages,
  removeLanguage,
  updateLanguage,
  updatePrimaryLanguage,
} from "@/lib/api/languages";
import { asRecordArray } from "@/lib/api/normalize";

export default function LanguagesManager() {
  const { accessToken } = useAdminAuth();
  const [languages, setLanguages] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createCode, setCreateCode] = useState("");
  const [createName, setCreateName] = useState("");
  const [createEnabled, setCreateEnabled] = useState(true);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Record<string, unknown> | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [editEnabled, setEditEnabled] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [busyCode, setBusyCode] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getLanguages(accessToken);
      setLanguages(asRecordArray(data));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load languages.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setCreateCode("");
    setCreateName("");
    setCreateEnabled(true);
    setCreateError(null);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!accessToken) return;
    if (!createCode.trim() || !createName.trim()) {
      setCreateError("Language code and name are required.");
      return;
    }
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      await createLanguage(
        {
          language_code: createCode.trim(),
          language_name: createName.trim(),
          is_enabled: createEnabled,
        },
        accessToken,
      );
      setCreateOpen(false);
      await load();
    } catch (err) {
      setCreateError(
        err instanceof ApiError ? err.message : "Failed to create language.",
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEdit = (language: Record<string, unknown>) => {
    setEditTarget(language);
    setEditName(String(language.language_name ?? ""));
    setEditEnabled(Boolean(language.is_enabled ?? true));
    setEditError(null);
  };

  const submitEdit = async () => {
    if (!editTarget || !accessToken) return;
    const code = String(editTarget.language_code ?? "");
    if (!code) {
      setEditError("Missing language_code on this record.");
      return;
    }
    if (!editName.trim()) {
      setEditError("Language name is required.");
      return;
    }
    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateLanguage(
        code,
        { language_name: editName.trim(), is_enabled: editEnabled },
        accessToken,
      );
      setEditTarget(null);
      await load();
    } catch (err) {
      setEditError(
        err instanceof ApiError ? err.message : "Failed to update language.",
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleSetPrimary = async (language: Record<string, unknown>) => {
    if (!accessToken) return;
    const code = String(language.language_code ?? "");
    if (!code) return;
    setBusyCode(code);
    try {
      await updatePrimaryLanguage({ language_code: code }, accessToken);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to set primary language.",
      );
    } finally {
      setBusyCode(null);
    }
  };

  const handleDelete = async (language: Record<string, unknown>) => {
    if (!accessToken) return;
    const code = String(language.language_code ?? "");
    if (!code) return;
    if (!window.confirm(`Remove language "${code}"? This cannot be undone.`)) {
      return;
    }
    setBusyCode(code);
    try {
      await removeLanguage(code, accessToken);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to delete language.",
      );
    } finally {
      setBusyCode(null);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-7">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Languages
        </h3>
        <Button size="sm" startIcon={<PlusIcon />} onClick={openCreate}>
          New Language
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
                Code
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Name
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Enabled
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
                  Loading languages…
                </TableCell>
              </TableRow>
            ) : languages.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  No languages found.
                </TableCell>
              </TableRow>
            ) : (
              languages.map((language, index) => {
                const code = String(language.language_code ?? index);
                return (
                  <TableRow key={code}>
                    <TableCell className="px-4 py-3 text-sm font-mono font-medium text-gray-800 dark:text-white/90">
                      {code}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {String(language.language_name ?? "—")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {language.is_enabled ? "Yes" : "No"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <button
                          className="text-theme-xs font-medium text-gray-500 hover:text-brand-500 dark:text-gray-400 disabled:opacity-40"
                          title="Set as primary language"
                          disabled={busyCode === code}
                          onClick={() => handleSetPrimary(language)}
                        >
                          Set Primary
                        </button>
                        <button
                          className="text-gray-500 hover:text-brand-500 dark:text-gray-400"
                          title="Edit language"
                          onClick={() => openEdit(language)}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          className="text-gray-500 hover:text-error-500 dark:text-gray-400 disabled:opacity-40"
                          title="Remove language"
                          disabled={busyCode === code}
                          onClick={() => handleDelete(language)}
                        >
                          <TrashBinIcon />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} className="max-w-md p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          New Language
        </h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="create-code">Language Code</Label>
            <Input
              id="create-code"
              value={createCode}
              onChange={(e) => setCreateCode(e.target.value)}
              placeholder="e.g. en"
            />
          </div>
          <div>
            <Label htmlFor="create-lang-name">Language Name</Label>
            <Input
              id="create-lang-name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g. English"
            />
          </div>
          <Checkbox
            id="create-enabled"
            label="Enabled"
            checked={createEnabled}
            onChange={setCreateEnabled}
          />
          {createError && (
            <p className="text-sm text-error-500">{createError}</p>
          )}
          <Button
            className="w-full"
            onClick={submitCreate}
            disabled={createSubmitting}
          >
            {createSubmitting ? "Creating…" : "Create Language"}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} className="max-w-md p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Edit {String(editTarget?.language_code ?? "")}
        </h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-lang-name">Language Name</Label>
            <Input
              id="edit-lang-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <Checkbox
            id="edit-enabled"
            label="Enabled"
            checked={editEnabled}
            onChange={setEditEnabled}
          />
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
    </div>
  );
}
