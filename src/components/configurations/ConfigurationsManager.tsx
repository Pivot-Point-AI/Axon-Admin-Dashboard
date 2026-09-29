"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/input/Switch";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ApiError } from "@/lib/api/client";
import { listConfigurations, updateConfiguration } from "@/lib/api/configurations";
import type { ConfigResponse } from "@/lib/api/types";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

type ConfigKind = "boolean" | "integer" | "number" | "string";

function configKind(config: ConfigResponse): ConfigKind {
  switch ((config.data_type ?? "string").toLowerCase()) {
    case "bool":
    case "boolean":
      return "boolean";
    case "int":
    case "integer":
      return "integer";
    case "float":
    case "double":
    case "decimal":
    case "number":
      return "number";
    default:
      return "string";
  }
}

// Returns an error message, or null when the value is acceptable for the
// config's declared data type and min/max bounds.
function validateConfigValue(config: ConfigResponse, value: string): string | null {
  const kind = configKind(config);
  const trimmed = value.trim();
  if (!trimmed) return "Value is required.";
  if (kind === "boolean") {
    return ["true", "false"].includes(trimmed.toLowerCase())
      ? null
      : "Value must be true or false.";
  }
  if (kind === "integer" || kind === "number") {
    const num = Number(trimmed);
    if (!Number.isFinite(num)) return "Value must be a number.";
    if (kind === "integer" && !Number.isInteger(num)) {
      return "Value must be a whole number.";
    }
    const { min_value: min, max_value: max } = config;
    if (min != null && num < min) return `Value must be at least ${min}.`;
    if (max != null && num > max) return `Value must be at most ${max}.`;
  }
  return null;
}

function rangeHint(config: ConfigResponse): string | undefined {
  const { min_value: min, max_value: max } = config;
  if (min != null && max != null) return `Allowed range: ${min} – ${max}`;
  if (min != null) return `Minimum: ${min}`;
  if (max != null) return `Maximum: ${max}`;
  return undefined;
}

export default function ConfigurationsManager() {
  const { accessToken } = useAdminAuth();
  const [configs, setConfigs] = useState<ConfigResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<ConfigResponse | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listConfigurations(accessToken);
      setConfigs(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load configurations.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (config: ConfigResponse) => {
    setEditTarget(config);
    setEditValue(config.config_value);
    setEditError(null);
  };

  const submitEdit = async () => {
    if (!editTarget || !accessToken) return;
    const validationError = validateConfigValue(editTarget, editValue);
    if (validationError) {
      setEditError(validationError);
      return;
    }
    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateConfiguration(
        editTarget.config_key,
        { config_value: editValue.trim(), description: editTarget.description ?? null },
        accessToken,
      );
      setEditTarget(null);
      await load();
    } catch (err) {
      setEditError(
        err instanceof ApiError ? err.message : "Failed to update configuration.",
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const typeLabel = (config: ConfigResponse) => {
    const labels: Record<ConfigKind, string> = {
      boolean: "Yes / No",
      integer: "Whole number",
      number: "Number",
      string: "Text",
    };
    return labels[configKind(config)];
  };

  const renderValue = (config: ConfigResponse) => {
    if (configKind(config) === "boolean") {
      const on = config.config_value.trim().toLowerCase() === "true";
      return (
        <Badge size="sm" color={on ? "success" : "light"}>
          {on ? "Enabled" : "Disabled"}
        </Badge>
      );
    }
    return (
      <span className="font-medium text-gray-800 dark:text-white/90">
        {config.config_value}
      </span>
    );
  };

  const isUnchanged =
    !!editTarget && editValue.trim() === editTarget.config_value.trim();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-7">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Configurations
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tune how the assistant behaves. Changes apply as soon as they are
            saved.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
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
              {["Setting", "Value", "Type", "Last updated", ""].map((heading, i) => (
                <TableCell
                  key={i}
                  isHeader
                  className="px-4 py-3 text-start text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {heading}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && configs.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                  Loading configurations…
                </TableCell>
              </TableRow>
            ) : configs.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                  No configurations found.
                </TableCell>
              </TableRow>
            ) : (
              configs.map((config) => (
                <TableRow
                  key={config.config_key}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-white/3"
                >
                  <TableCell className="max-w-md px-4 py-3">
                    <div className="font-mono text-sm font-medium text-gray-800 dark:text-white/90">
                      {config.config_key}
                    </div>
                    {config.description && (
                      <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">
                        {config.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate px-4 py-3 text-sm">
                    {renderValue(config)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <Badge size="sm" color="light">
                      {typeLabel(config)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(config.updated_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-end text-sm">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(config)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        className="max-w-lg p-6 sm:p-8"
      >
        {editTarget && (
          <div>
            <div className="mb-5 pe-10">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Edit configuration
                </h4>
                <Badge size="sm" color="light">
                  {typeLabel(editTarget)}
                </Badge>
              </div>
              <p className="mt-1 font-mono text-theme-xs text-gray-500 dark:text-gray-400">
                {editTarget.config_key}
              </p>
            </div>

            {editTarget.description && (
              <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-white/3 dark:text-gray-300">
                {editTarget.description}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-value">Value</Label>
                {configKind(editTarget) === "boolean" ? (
                  <Switch
                    id="edit-value"
                    label={
                      editValue.trim().toLowerCase() === "true"
                        ? "Enabled"
                        : "Disabled"
                    }
                    checked={editValue.trim().toLowerCase() === "true"}
                    onChange={(checked) => setEditValue(String(checked))}
                  />
                ) : (
                  <Input
                    id="edit-value"
                    type={
                      ["integer", "number"].includes(configKind(editTarget))
                        ? "number"
                        : "text"
                    }
                    step={configKind(editTarget) === "integer" ? 1 : undefined}
                    min={editTarget.min_value ?? undefined}
                    max={editTarget.max_value ?? undefined}
                    hint={rangeHint(editTarget)}
                    error={!!editError}
                    value={editValue}
                    onChange={(e) => {
                      setEditValue(e.target.value);
                      setEditError(null);
                    }}
                  />
                )}
              </div>

              {!isUnchanged && (
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                  Current value:{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {editTarget.config_value}
                  </span>
                  <button
                    type="button"
                    className="ms-2 text-brand-500 hover:underline"
                    onClick={() => {
                      setEditValue(editTarget.config_value);
                      setEditError(null);
                    }}
                  >
                    Reset
                  </button>
                </p>
              )}

              {editError && (
                <div className="rounded-lg border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
                  {editError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setEditTarget(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={submitEdit}
                  disabled={editSubmitting || isUnchanged}
                >
                  {editSubmitting ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
