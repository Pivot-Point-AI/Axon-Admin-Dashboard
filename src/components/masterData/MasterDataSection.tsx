"use client";

import Pagination from "@/components/common/Pagination";
import MasterDataMetrics from "./MasterDataMetrics";
import StatusBadge from "@/components/common/StatusBadge";
import usePagination from "@/hooks/usePagination";
import useRequiredFields from "@/hooks/useRequiredFields";
import { asBoolean } from "@/utils/boolean";
import { useTranslations } from "next-intl";
import { useConfirm } from "@/context/FeedbackContext";
import { useCallback, useEffect, useState } from "react";
import ActionIconButton from "@/components/ui/button/ActionIconButton";
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
import { asRecordArray, recordId } from "@/lib/api/normalize";

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
  // Update / remove are optional for sections with list/create-only APIs.
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

function itemForm(fields: MasterDataField[], item: Record<string, unknown>) {
  return Object.fromEntries(
    fields.map((field) => [
      field.key,
      field.type === "checkbox"
        ? asBoolean(item[field.key], true)
        : String(item[field.key] ?? ""),
    ]),
  );
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
  const createRequired = useRequiredFields();
  const editRequired = useRequiredFields();
  const t = useTranslations("fixes");
  const confirm = useConfirm();
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
  const initialCreateForm = emptyForm(fields);
  const createChanged = fields.some(
    (field) => createForm[field.key] !== initialCreateForm[field.key],
  );
  const initialEditForm = editTarget ? itemForm(fields, editTarget) : {};
  const editChanged =
    !!editTarget &&
    fields.some((field) => editForm[field.key] !== initialEditForm[field.key]);

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
      setError(
        err instanceof ApiError
          ? err.message
          : `Failed to load ${title.toLowerCase()}.`,
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    createRequired.reset();
    setCreateForm(emptyForm(fields));
    setCreateError(null);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!accessToken || createSubmitting || !createChanged) return;
    setCreateError(null);
    if (
      !createRequired.validate(
        fields
          .filter((field) => field.required)
          .map((field) => createForm[field.key]),
      )
    )
      return;
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      await createItem(createForm, accessToken);
      setCreateOpen(false);
      await load();
    } catch (err) {
      setCreateError(
        err instanceof ApiError
          ? err.message
          : `Failed to create ${title.toLowerCase()} entry.`,
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEdit = (item: Record<string, unknown>) => {
    editRequired.reset();
    setEditTarget(item);
    setEditForm(itemForm(fields, item));
    setEditError(null);
  };

  const submitEdit = async () => {
    if (
      !editTarget ||
      !accessToken ||
      !updateItem ||
      editSubmitting ||
      !editChanged
    )
      return;
    const id = recordId(editTarget, idField);
    if (id === null) {
      setEditError(t("missingRecordId", { field: idField }));
      return;
    }
    setEditError(null);
    if (
      !editRequired.validate(
        fields
          .filter((field) => field.required)
          .map((field) => editForm[field.key]),
      )
    )
      return;
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
        err instanceof ApiError
          ? err.message
          : `Failed to update ${title.toLowerCase()} entry.`,
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (item: Record<string, unknown>) => {
    if (!accessToken || !removeItem) return;
    const id = recordId(item, idField);
    if (id === null) {
      setError(t("missingRecordId", { field: idField }));
      return;
    }
    if (!(await confirm("Remove this entry? This cannot be undone."))) return;
    setDeletingId(id);
    try {
      await removeItem(id, accessToken);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `Failed to delete ${title.toLowerCase()} entry.`,
      );
    } finally {
      setDeletingId(null);
    }
  };

  const renderFormField = (
    field: MasterDataField,
    form: Record<string, unknown>,
    setForm: (form: Record<string, unknown>) => void,
    invalid: (value: unknown) => boolean,
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
            invalid={!!field.required && invalid(form[field.key])}
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
          label={
            field.key === "is_active"
              ? t(asBoolean(form[field.key]) ? "active" : "inactive")
              : field.label
          }
          checked={asBoolean(form[field.key])}
          onChange={(checked) => setForm({ ...form, [field.key]: checked })}
        />
      );
    }
    return (
      <div key={field.key}>
        <Label htmlFor={`field-${field.key}`}>
          {field.label}
          {field.required && <span className="text-error-500"> *</span>}
        </Label>
        <Input
          id={`field-${field.key}`}
          error={!!field.required && invalid(form[field.key])}
          required={field.required}
          value={String(form[field.key] ?? "")}
          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
        />
      </div>
    );
  };

  const pagination = usePagination(visibleItems, JSON.stringify(filterValues));

  return (
    <div className="axon-master-data space-y-5">
      <MasterDataMetrics items={items} loading={loading || !!error} />
      <div className="axon-management-panel rounded-xl border border-brand-100 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h4 className="me-auto self-center text-base font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h4>
          {filters.length > 0 && (
            <div className="flex flex-1 flex-wrap items-end gap-3 lg:justify-end">
              {filters.map((filter, index) => {
                const choices = filter.options(applyFilters(items, index));
                return (
                  <div key={filter.key} className="min-w-44">
                    <Label htmlFor={`filter-${filter.key}`}>
                      {filter.label}
                    </Label>
                    <select
                      id={`filter-${filter.key}`}
                      value={filterValues[filter.key] ?? ""}
                      onChange={(e) => changeFilter(index, e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFilterValues({})}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}

          <Button
            size="sm"
            startIcon={
              <PlusIcon
                aria-hidden="true"
                className="block size-5 text-white dark:text-white"
              />
            }
            onClick={openCreate}
          >
            Add {title.replace(/s$/, "")}
          </Button>
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
        />
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
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
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
                    {items.length === 0
                      ? "No entries yet."
                      : "No entries match the selected filters."}
                  </TableCell>
                </TableRow>
              ) : (
                pagination.items.map((item, index) => {
                  const id = recordId(item, idField);
                  return (
                    <TableRow key={id != null ? String(id) : index}>
                      {fields.map((field) => (
                        <TableCell
                          key={field.key}
                          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300"
                        >
                          {field.type === "checkbox" ? (
                            <StatusBadge
                              active={asBoolean(item[field.key])}
                              kind={
                                field.key === "is_active" ? "active" : "yesNo"
                              }
                            />
                          ) : field.key === fields[0].key ? (
                            <div className="flex items-center gap-3">
                              <span
                                aria-hidden="true"
                                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-theme-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
                              >
                                {String(item[field.key] ?? "")
                                  .slice(0, 1)
                                  .toUpperCase()}
                              </span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {String(item[field.key] ?? "—")}
                              </span>
                            </div>
                          ) : (
                            String(item[field.key] ?? "—")
                          )}
                        </TableCell>
                      ))}
                      {hasActions && (
                        <TableCell className="px-4 py-2 text-sm">
                          <div className="flex items-center gap-3">
                            {updateItem && (
                              <ActionIconButton
                                tone="edit"
                                className="size-8 rounded-lg"
                                title="Edit"
                                onClick={() => openEdit(item)}
                              >
                                <PencilIcon />
                              </ActionIconButton>
                            )}
                            {removeItem && (
                              <ActionIconButton
                                tone="delete"
                                title="Remove"
                                disabled={deletingId === Number(id)}
                                onClick={() => handleDelete(item)}
                              >
                                <TrashBinIcon />
                              </ActionIconButton>
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
        <Pagination
          variant="footer"
          pagination={pagination}
          disabled={loading}
        />
      </div>

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        className="max-w-md p-6"
      >
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Add {title.replace(/s$/, "")}
        </h4>
        <div className="space-y-4">
          {fields.map((field) =>
            renderFormField(
              field,
              createForm,
              setCreateForm,
              createRequired.invalid,
            ),
          )}
          {createError && (
            <p className="text-sm text-error-500">{createError}</p>
          )}
          <Button
            className="w-full"
            onClick={submitCreate}
            disabled={createSubmitting || !createChanged}
          >
            {createSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        className="max-w-md p-6"
      >
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Edit {title.replace(/s$/, "")}
        </h4>
        <div className="space-y-4">
          {fields.map((field) =>
            renderFormField(field, editForm, setEditForm, editRequired.invalid),
          )}
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
