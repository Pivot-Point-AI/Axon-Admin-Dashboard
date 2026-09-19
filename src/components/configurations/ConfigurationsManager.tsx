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
import { PencilIcon } from "@/icons/index";
import { ApiError } from "@/lib/api/client";
import { listConfigurations, updateConfiguration } from "@/lib/api/configurations";
import type { ConfigResponse } from "@/lib/api/types";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

export default function ConfigurationsManager() {
  const { accessToken } = useAdminAuth();
  const [configs, setConfigs] = useState<ConfigResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<ConfigResponse | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDescription, setEditDescription] = useState("");
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
    setEditDescription(config.description ?? "");
    setEditError(null);
  };

  const submitEdit = async () => {
    if (!editTarget || !accessToken) return;
    if (!editValue.trim()) {
      setEditError("Value is required.");
      return;
    }
    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateConfiguration(
        editTarget.config_key,
        { config_value: editValue.trim(), description: editDescription.trim() || null },
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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-7">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Configurations
        </h3>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          Refresh
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
                Key
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Value
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Description
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Updated
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
                  Loading configurations…
                </TableCell>
              </TableRow>
            ) : configs.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  No configurations found.
                </TableCell>
              </TableRow>
            ) : (
              configs.map((config) => (
                <TableRow key={config.config_key}>
                  <TableCell className="px-4 py-3 text-sm font-mono font-medium text-gray-800 dark:text-white/90">
                    {config.config_key}
                  </TableCell>
                  <TableCell className="max-w-xs truncate px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {config.config_value}
                  </TableCell>
                  <TableCell className="max-w-xs truncate px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {config.description || "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(config.updated_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <button
                      className="text-gray-500 hover:text-brand-500 dark:text-gray-400"
                      title="Edit configuration"
                      onClick={() => openEdit(config)}
                    >
                      <PencilIcon />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} className="max-w-md p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Edit {editTarget?.config_key}
        </h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-value">Value</Label>
            <Input
              id="edit-value"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
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
    </div>
  );
}
