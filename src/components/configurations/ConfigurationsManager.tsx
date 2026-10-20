"use client";

import Pagination from "@/components/common/Pagination";
import usePagination from "@/hooks/usePagination";
import { useTranslations } from "next-intl";

import { PencilIcon, RefreshIcon } from "@/icons";
import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ApiError } from "@/lib/api/client";
import {
  listConfigurations,
  updateConfiguration,
} from "@/lib/api/configurations";
import type { ConfigResponse } from "@/lib/api/types";

import ConfigurationRow from "./ConfigurationRow";
import ConfigurationMetrics from "./ConfigurationMetrics";
import { configKind, typeLabel, type ConfigKind } from "./configurationFields";

export default function ConfigurationsManager() {
  const t = useTranslations("managementDesign");
  const e = useTranslations("configurationEditor");
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("");
  const { accessToken } = useAdminAuth();
  const [configs, setConfigs] = useState<ConfigResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editSession, setEditSession] = useState(0);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listConfigurations(accessToken);
      setConfigs(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : e("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, e]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleEditing = () => {
    setDrafts({});
    setEditSession((session) => session + 1);
    setEditing((previous) => !previous);
  };

  const saveConfiguration = async (config: ConfigResponse, value: string) => {
    if (!accessToken) return;
    setSavingKey(config.config_key);
    try {
      const saved = await updateConfiguration(
        config.config_key,
        {
          config_value: value,
          description: config.description ?? null,
        },
        accessToken,
      );
      const savedValue = saved.config_value ?? value;
      setConfigs((previous) =>
        previous.map((item) =>
          item.config_key === config.config_key
            ? {
                ...item,
                ...saved,
                config_key: config.config_key,
                config_value: savedValue,
              }
            : item,
        ),
      );
      setDrafts((previous) => ({
        ...previous,
        [config.config_key]: savedValue,
      }));
    } finally {
      setSavingKey(null);
    }
  };

  const visibleConfigs = configs.filter(
    (config) =>
      (!kindFilter || configKind(config) === kindFilter) &&
      `${config.config_key} ${config.description ?? ""} ${config.config_value}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );

  const pagination = usePagination(
    visibleConfigs,
    JSON.stringify([query, kindFilter]),
  );

  return (
    <div className="space-y-5">
      <ConfigurationMetrics configs={configs} loading={loading || !!error} />
      <div className="axon-management-panel rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-7">
          <div className="flex flex-1 flex-wrap gap-3">
            <Input
              type="search"
              aria-label={t("searchSettings")}
              placeholder={t("searchSettings")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-60 bg-gray-50 dark:bg-gray-900"
            />
            <select
              aria-label={t("allTypes")}
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="">{t("allTypes")}</option>
              {(["boolean", "integer", "number", "string"] as ConfigKind[]).map(
                (kind) => (
                  <option key={kind} value={kind}>
                    {typeLabel(
                      {
                        config_key: "",
                        config_value: "",
                        data_type: kind,
                      },
                      e,
                    )}
                  </option>
                ),
              )}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant={editing ? "outline" : "primary"}
              onClick={toggleEditing}
              disabled={loading || savingKey !== null}
              startIcon={<PencilIcon className="size-4" />}
            >
              {e(editing ? "cancelEditing" : "edit")}
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="!text-white"
              onClick={load}
              disabled={loading || editing}
              startIcon={
                <RefreshIcon
                  className={`size-4 text-white ${loading ? "motion-safe:animate-spin" : ""}`}
                />
              }
            >
              {e(loading ? "refreshing" : "refresh")}
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
        />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                {[
                  e("setting"),
                  t("description"),
                  e("value"),
                  e("lastUpdated"),
                  ...(editing ? [e("actions")] : []),
                ].map((heading, i) => (
                  <TableCell
                    key={i}
                    isHeader
                    className="px-4 py-3 text-start text-theme-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400"
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
                    {e("loading")}
                  </TableCell>
                </TableRow>
              ) : visibleConfigs.length === 0 ? (
                <TableRow>
                  <TableCell className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                    {configs.length ? t("noMatches") : e("empty")}
                  </TableCell>
                </TableRow>
              ) : (
                pagination.items.map((config) => (
                  <ConfigurationRow
                    key={config.config_key + ":" + editSession}
                    config={config}
                    editing={editing}
                    value={drafts[config.config_key] ?? config.config_value}
                    saving={savingKey === config.config_key}
                    busy={savingKey !== null}
                    onChange={(value) =>
                      setDrafts((previous) => ({
                        ...previous,
                        [config.config_key]: value,
                      }))
                    }
                    onSave={saveConfiguration}
                  />
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
      </div>
    </div>
  );
}
