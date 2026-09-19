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
import { asRecordArray } from "@/lib/api/normalize";

export interface MasterDataField {
  key: string;
  label: string;
  type: "text" | "checkbox";
  required?: boolean;
}

interface MasterDataSectionProps {
  title: string;
  idField: string;
  fields: MasterDataField[];
  fetchItems: (bearerToken: string) => Promise<unknown>;
  createItem: (
    body: Record<string, unknown>,
    bearerToken: string,
  ) => Promise<unknown>;
  updateItem: (
    id: number,
    body: Record<string, unknown>,
    bearerToken: string,
  ) => Promise<unknown>;
  removeItem: (id: number, bearerToken: string) => Promise<unknown>;
}

function emptyForm(fields: MasterDataField[]): Record<string, unknown> {
  const form: Record<string, unknown> = {};
  for (const field of fields) {
    form[field.key] = field.type === "checkbox" ? true : "";
  }
  return form;
}

export default function MasterDataSection({
  title,
  idField,
  fields,
  fetchItems,
  createItem,
  updateItem,
  removeItem,
}: MasterDataSectionProps) {
  const { accessToken } = useAdminAuth();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<Record<string, unknown>>(
    emptyForm(fields),
  );
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Record<string, unknown> | null>(
    null,
  );
  const [editForm, setEditForm] = useState<Record<string, unknown>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchItems(accessToken);
      setItems(asRecordArray(data));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Failed to load ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setCreateForm(emptyForm(fields));
    setCreateError(null);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!accessToken) return;
    for (const field of fields) {
      if (field.required && !String(createForm[field.key] ?? "").trim()) {
        setCreateError(`${field.label} is required.`);
        return;
      }
    }
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      await createItem(createForm, accessToken);
      setCreateOpen(false);
      await load();
    } catch (err) {
      setCreateError(
        err instanceof ApiError ? err.message : `Failed to create ${title.toLowerCase()} entry.`,
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEdit = (item: Record<string, unknown>) => {
    setEditTarget(item);
    const form: Record<string, unknown> = {};
    for (const field of fields) {
      form[field.key] =
        field.type === "checkbox"
          ? Boolean(item[field.key] ?? true)
          : String(item[field.key] ?? "");
    }
    setEditForm(form);
    setEditError(null);
  };

  const submitEdit = async () => {
    if (!editTarget || !accessToken) return;
    const id = Number(editTarget[idField]);
    if (!Number.isFinite(id)) {
      setEditError(`Missing ${idField} on this record — can't update it.`);
      return;
    }
    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateItem(id, editForm, accessToken);
      setEditTarget(null);
      await load();
    } catch (err) {
      setEditError(
        err instanceof ApiError ? err.message : `Failed to update ${title.toLowerCase()} entry.`,
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (item: Record<string, unknown>) => {
    if (!accessToken) return;
    const id = Number(item[idField]);
    if (!Number.isFinite(id)) {
      setError(`Missing ${idField} on this record — can't delete it.`);
      return;
    }
    if (!window.confirm("Remove this entry? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await removeItem(id, accessToken);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : `Failed to delete ${title.toLowerCase()} entry.`,
      );
    } finally {
      setDeletingId(null);
    }
  };

  const renderFormField = (
    field: MasterDataField,
    form: Record<string, unknown>,
    setForm: (form: Record<string, unknown>) => void,
  ) => {
    if (field.type === "checkbox") {
      return (
        <Checkbox
          key={field.key}
          id={`field-${field.key}`}
          label={field.label}
          checked={Boolean(form[field.key])}
          onChange={(checked) => setForm({ ...form, [field.key]: checked })}
        />
      );
    }
    return (
      <div key={field.key}>
        <Label htmlFor={`field-${field.key}`}>{field.label}</Label>
        <Input
          id={`field-${field.key}`}
          value={String(form[field.key] ?? "")}
          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
        />
      </div>
    );
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h4>
        <Button size="sm" startIcon={<PlusIcon />} onClick={openCreate}>
          Add {title.replace(/s$/, "")}
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
              {fields.map((field) => (
                <TableCell
                  key={field.key}
                  isHeader
                  className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {field.label}
                </TableCell>
              ))}
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  Loading…
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  No entries yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => {
                const id = item[idField];
                return (
                  <TableRow key={id != null ? String(id) : index}>
                    {fields.map((field) => (
                      <TableCell
                        key={field.key}
                        className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"
                      >
                        {field.type === "checkbox"
                          ? item[field.key]
                            ? "Yes"
                            : "No"
                          : String(item[field.key] ?? "—")}
                      </TableCell>
                    ))}
                    <TableCell className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <button
                          className="text-gray-500 hover:text-brand-500 dark:text-gray-400"
                          title="Edit"
                          onClick={() => openEdit(item)}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          className="text-gray-500 hover:text-error-500 dark:text-gray-400 disabled:opacity-40"
                          title="Remove"
                          disabled={deletingId === Number(id)}
                          onClick={() => handleDelete(item)}
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
          Add {title.replace(/s$/, "")}
        </h4>
        <div className="space-y-4">
          {fields.map((field) => renderFormField(field, createForm, setCreateForm))}
          {createError && <p className="text-sm text-error-500">{createError}</p>}
          <Button className="w-full" onClick={submitCreate} disabled={createSubmitting}>
            {createSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} className="max-w-md p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Edit {title.replace(/s$/, "")}
        </h4>
        <div className="space-y-4">
          {fields.map((field) => renderFormField(field, editForm, setEditForm))}
          {editError && <p className="text-sm text-error-500">{editError}</p>}
          <Button className="w-full" onClick={submitEdit} disabled={editSubmitting}>
            {editSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
