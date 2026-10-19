"use client";

import Pagination from "@/components/common/Pagination";
import StatusBadge from "@/components/common/StatusBadge";
import { asBoolean } from "@/utils/boolean";
import usePagination from "@/hooks/usePagination";
import { useConfirm } from "@/context/FeedbackContext";
import { useCallback, useEffect, useState } from "react";
import ActionIconButton from "@/components/ui/button/ActionIconButton";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/input/Switch";
import LanguagePicker from "@/components/languages/LanguagePicker";
import useRequiredFields from "@/hooks/useRequiredFields";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { CheckCircleIcon, PencilIcon, PlusIcon, TrashBinIcon } from "@/icons/index";
import { ApiError } from "@/lib/api/client";
import {
  createLanguage,
  getLanguages,
  removeLanguage,
  updateLanguage,
  updatePrimaryLanguage,
} from "@/lib/api/languages";
import { asRecordArray } from "@/lib/api/normalize";

// Common ISO 639-1 languages to pick from when adding a new language — the
// code is derived from the selection rather than typed by hand, so it can
// never drift from a valid ISO code.
const LANGUAGE_OPTIONS: { code: string; name: string }[] = [
  { code: "en", name: "English" },
  { code: "ar", name: "Arabic" },
  { code: "ur", name: "Urdu" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "fa", name: "Persian" },
  { code: "tr", name: "Turkish" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "pl", name: "Polish" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "pa", name: "Punjabi" },
  { code: "ta", name: "Tamil" },
  { code: "ml", name: "Malayalam" },
  { code: "sw", name: "Swahili" },
  { code: "he", name: "Hebrew" },
  { code: "el", name: "Greek" },
  { code: "uk", name: "Ukrainian" },
];

export default function LanguagesManager() {
  const createRequired = useRequiredFields();
  const editRequired = useRequiredFields();
  const confirm = useConfirm();
  const { accessToken } = useAdminAuth();
  const [languages, setLanguages] = useState<Record<string, unknown>[]>([]);
  const [primaryCode, setPrimaryCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createSelection, setCreateSelection] = useState("");
  const [createEnabled, setCreateEnabled] = useState(true);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Record<string, unknown> | null>(
    null,
  );
  // Code of the system language chosen for this record's display name. Empty
  // when the record's current name isn't one of the system languages.
  const [editSelection, setEditSelection] = useState("");
  const [editEnabled, setEditEnabled] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [initialEditSelection, setInitialEditSelection] = useState("");
  const editChanged =
    !!editTarget &&
    (editSelection !== initialEditSelection ||
      editEnabled !== Boolean(editTarget.is_enabled ?? true));

  const [busyCode, setBusyCode] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = asRecordArray(await getLanguages(accessToken));
      setLanguages(data);
      const primary = data.find(
        (l) =>
          l.is_primary === true ||
          l.primary === true ||
          l.is_default === true,
      );
      if (primary?.language_code) {
        setPrimaryCode(String(primary.language_code).toLowerCase());
      }
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

  const existingCodes = new Set(
    languages.map((l) => String(l.language_code ?? "").toLowerCase()),
  );
  const languagePickerOptions = LANGUAGE_OPTIONS.map((option) => ({
    ...option,
    disabled: existingCodes.has(option.code),
  }));

  // Editing keeps the record's own code, so only block languages already
  // registered under a *different* record.
  const editingCode = String(editTarget?.language_code ?? "").toLowerCase();
  const editPickerOptions = LANGUAGE_OPTIONS.map((option) => ({
    ...option,
    disabled: existingCodes.has(option.code) && option.code !== editingCode,
  }));

  const openCreate = () => {
    createRequired.reset();
    setCreateSelection("");
    setCreateEnabled(true);
    setCreateError(null);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!accessToken) return;
    const selected = LANGUAGE_OPTIONS.find((o) => o.code === createSelection);
    setCreateError(null);
    if (!createRequired.validate([selected?.code])) return;
    if (!selected) {
      return;
    }
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      await createLanguage(
        {
          language_code: selected.code,
          language_name: selected.name,
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
    editRequired.reset();
    setEditTarget(language);
    const currentName = String(language.language_name ?? "").toLowerCase();
    const currentCode = String(language.language_code ?? "").toLowerCase();
    const match =
      LANGUAGE_OPTIONS.find((o) => o.code === currentCode) ??
      LANGUAGE_OPTIONS.find((o) => o.name.toLowerCase() === currentName);
    setEditSelection(match?.code ?? "");
    setInitialEditSelection(match?.code ?? "");
    setEditEnabled(Boolean(language.is_enabled ?? true));
    setEditError(null);
  };

  const submitEdit = async () => {
    if (!editTarget || !accessToken || editSubmitting || !editChanged) return;
    const code = String(editTarget.language_code ?? "");
    if (!code) {
      setEditError("Missing language_code on this record.");
      return;
    }
    // Only languages that exist in the system can be chosen; if the user
    // leaves the picker alone, the record's current name is kept.
    const selected = LANGUAGE_OPTIONS.find((o) => o.code === editSelection);
    const languageName =
      selected?.name ?? String(editTarget.language_name ?? "").trim();
    setEditError(null);
    if (!editRequired.validate([languageName])) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateLanguage(
        code,
        { language_name: languageName, is_enabled: editEnabled },
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
      setPrimaryCode(code.toLowerCase());
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to set primary language.",
      );
    } finally {
      setBusyCode(null);
    }
  };

  const handleDelete = async (language: Record<string, unknown>) => {
    if (!accessToken) return;
    const code = String(language.language_code ?? "");
    if (!code) return;
    if (!(await confirm(`Remove language "${code}"? This cannot be undone.`))) {
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

  const pagination = usePagination(languages, "");

  return (
    <div className="axon-management-panel w-full rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-7">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Languages
        </h3>
        <Button
          size="sm"
          startIcon={
            <PlusIcon className="size-5 text-success-200 dark:text-success-200" />
          }
          onClick={openCreate}
        >
          New Language
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
          {error}
        </div>
      )}

      <Pagination variant="header" pagination={pagination} disabled={loading} />
      <div className="w-full overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
        <Table className="w-full">
          <TableHeader className="border-b border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-white/2">
            <TableRow>
              <TableCell
                isHeader
                className="px-4 py-3 text-start text-theme-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400"
              >
                Code
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-start text-theme-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400"
              >
                Name
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-start text-theme-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400"
              >
                Enabled
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-start text-theme-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400"
              >
                Primary
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-end text-theme-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400"
                >
                  Loading languages…
                </TableCell>
              </TableRow>
            ) : languages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400"
                >
                  No languages found.
                </TableCell>
              </TableRow>
            ) : (
              pagination.items.map((language, index) => {
                const code = String(language.language_code ?? index);
                const isPrimary =
                  primaryCode
                    ? code.toLowerCase() === primaryCode.toLowerCase()
                    : Boolean(
                        language.is_primary ||
                          language.primary ||
                          language.is_default,
                      );
                return (
                  <TableRow key={code}>
                    <TableCell className="px-4 py-3 text-sm font-medium">
                      <span className="inline-block rounded-md bg-gray-100 px-2.5 py-1 font-mono text-theme-xs font-semibold text-gray-800 dark:bg-white/5 dark:text-gray-200">
                        {code}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                      {String(language.language_name ?? "—")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      <StatusBadge
                        active={asBoolean(language.is_enabled)}
                        kind="enabled"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      {isPrimary ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-theme-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                          <CheckCircleIcon className="size-3.5" />
                          Primary Language
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            busyCode === code || !asBoolean(language.is_enabled)
                          }
                          onClick={() => handleSetPrimary(language)}
                          title={
                            !asBoolean(language.is_enabled)
                              ? "Enable this language to set as primary"
                              : `Set ${language.language_name || code} as primary language`
                          }
                          className="py-1.5 text-theme-xs"
                        >
                          {busyCode === code ? "Setting…" : "Set as Primary"}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <ActionIconButton
                          tone="edit"
                          title="Edit language"
                          onClick={() => openEdit(language)}
                        >
                          <PencilIcon />
                        </ActionIconButton>
                        <ActionIconButton
                          tone="delete"
                          title={
                            isPrimary
                              ? "Cannot remove primary language"
                              : "Remove language"
                          }
                          disabled={busyCode === code || isPrimary}
                          onClick={() => handleDelete(language)}
                        >
                          <TrashBinIcon />
                        </ActionIconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination variant="footer" pagination={pagination} disabled={loading} />

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        className="max-w-md p-6"
      >
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          New Language
        </h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="create-lang-select">Language</Label>
            <LanguagePicker
              id="create-lang-select"
              invalid={createRequired.invalid(createSelection)}
              options={languagePickerOptions}
              value={createSelection}
              onChange={setCreateSelection}
            />
          </div>
          {createSelection && (
            <div>
              <Label htmlFor="create-lang-code">Language Code</Label>
              <Input id="create-lang-code" value={createSelection} disabled />
            </div>
          )}
          <Switch
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

      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        className="max-w-md p-6"
      >
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Edit {String(editTarget?.language_code ?? "")}
        </h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-lang-name">Language</Label>
            <LanguagePicker
              id="edit-lang-name"
              invalid={editRequired.invalid(
                editSelection || editTarget?.language_name,
              )}
              options={editPickerOptions}
              value={editSelection}
              onChange={setEditSelection}
              placeholder={String(
                editTarget?.language_name ?? "Search languages…",
              )}
            />
            <p className="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
              Choose from the languages available in the system. Languages
              already added are disabled.
            </p>
          </div>
          <Switch
            id="edit-enabled"
            label="Enabled"
            checked={editEnabled}
            onChange={setEditEnabled}
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
    </div>
  );
  
}
