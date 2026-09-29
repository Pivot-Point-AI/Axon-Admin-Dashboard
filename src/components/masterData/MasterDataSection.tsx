"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/input/Switch";
import CreatableSelect from "@/components/form/CreatableSelect";
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
  type: "text" | "checkbox" | "creatable";
  required?: boolean;
  // Only for type "creatable": a dropdown of existing values that also lets
  // the user add a new one. `options` may depend on the rest of the form and
  // the loaded rows (e.g. narrowing categories by the chosen biller type).
  creatable?: {
    options: (
      form: Record<string, unknown>,
      items: Record<string, unknown>[],
    ) => string[];
    allOptions?: (items: Record<string, unknown>[]) => string[];
    onCreate: (name: string, bearerToken: string) => Promise<void>;
  };
}

// A dropdown filter above the table. Filters are ordered: `options` receives
// the rows already narrowed by the filters before it, so later filters
// cascade from earlier ones (e.g. category options follow the biller type).
export interface MasterDataFilter {
  key: string;
  label: string;
  options: (items: Record<string, unknown>[]) => string[];
}

interface MasterDataSectionProps {
  title: string;
  idField: string;
  fields: MasterDataField[];
  filters?: MasterDataFilter[];
  // Record keys that have no form input but must be sent back unchanged on
  // update, since PUT replaces the record.
  preserveKeys?: string[];
  fetchItems: (bearerToken: string) => Promise<unknown>;
  createItem: (
    body: Record<string, unknown>,
    bearerToken: string,
  ) => Promise<unknown>;
  // Update / remove are optional: a section whose API is create + list only
  // (e.g. card types) simply shows no row actions.
  updateItem?: (
    id: number,
    body: Record<string, unknown>,
    bearerToken: string,
  ) => Promise<unknown>;
  removeItem?: (id: number, bearerToken: string) => Promise<unknown>;
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
  filters = [],
  preserveKeys = [],
  fetchItems,
  createItem,
  updateItem,
  removeItem,
}: MasterDataSectionProps) {
  const { accessToken } = useAdminAuth();
  const hasActions = !!updateItem || !!removeItem;
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
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const applyFilters = (
    rows: Record<string, unknown>[],
    upTo: number = filters.length,
  ) =>
    filters.slice(0, upTo).reduce((acc, filter) => {
      const selected = filterValues[filter.key];
      return selected
        ? acc.filter((row) => String(row[filter.key] ?? "") === selected)
        : acc;
    }, rows);
  const visibleItems = applyFilters(items);

  const changeFilter = (index: number, value: string) => {
    // Changing a filter invalidates the ones that cascade from it.
    const next: Record<string, string> = {};
    filters.forEach((filter, i) => {
      if (i < index) next[filter.key] = filterValues[filter.key] ?? "";
      if (i === index) next[filter.key] = value;
    });
    setFilterValues(next);
  };

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
    if (!editTarget || !accessToken || !updateItem) return;
    const id = Number(editTarget[idField]);
    if (!Number.isFinite(id)) {
      setEditError(`Missing ${idField} on this record — can't update it.`);
      return;
    }
    setEditSubmitting(true);
    setEditError(null);
    try {
      const preserved: Record<string, unknown> = {};
      for (const key of preserveKeys) {
        if (editTarget[key] !== undefined) preserved[key] = editTarget[key];
      }
      await updateItem(id, { ...preserved, ...editForm }, accessToken);
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
    if (!accessToken || !removeItem) return;
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
    if (field.type === "creatable" && field.creatable) {
      const { options, allOptions, onCreate } = field.creatable;
      return (
        <div key={field.key}>
          <Label htmlFor={`field-${field.key}`}>
            {field.label}
            {field.required ? " *" : ""}
          </Label>
          <CreatableSelect
            id={`field-${field.key}`}
            value={String(form[field.key] ?? "")}
            options={options(form, items)}
            allOptions={allOptions?.(items)}
            onChange={(value) => setForm({ ...form, [field.key]: value })}
            onCreate={(name) => onCreate(name, accessToken ?? "")}
          />
        </div>
      );
    }
    if (field.type === "checkbox") {
      return (
        <Switch
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

      {filters.length > 0 && (
        <div className="mb-5 flex flex-wrap items-end gap-3">
          {filters.map((filter, index) => {
            const choices = filter.options(applyFilters(items, index));
            return (
              <div key={filter.key} className="min-w-44">
                <Label htmlFor={`filter-${filter.key}`}>{filter.label}</Label>
                <select
                  id={`filter-${filter.key}`}
                  value={filterValues[filter.key] ?? ""}
                  onChange={(e) => changeFilter(index, e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="">All</option>
                  {choices.map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
          {Object.values(filterValues).some(Boolean) && (
            <Button size="sm" variant="outline" onClick={() => setFilterValues({})}>
              Clear filters
            </Button>
          )}
        </div>
      )}

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
              {hasActions && (
                <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  Loading…
                </TableCell>
              </TableRow>
            ) : visibleItems.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {items.length === 0 ? "No entries yet." : "No entries match the selected filters."}
                </TableCell>
              </TableRow>
            ) : (
              visibleItems.map((item, index) => {
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
                    {hasActions && (
                      <TableCell className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-3">
                          {updateItem && (
                            <button
                              className="text-gray-500 hover:text-brand-500 dark:text-gray-400"
                              title="Edit"
                              onClick={() => openEdit(item)}
                            >
                              <PencilIcon />
                            </button>
                          )}
                          {removeItem && (
                            <button
                              className="text-gray-500 hover:text-error-500 dark:text-gray-400 disabled:opacity-40"
                              title="Remove"
                              disabled={deletingId === Number(id)}
                              onClick={() => handleDelete(item)}
                            >
                              <TrashBinIcon />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    )}
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
