"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/input/Switch";
import StatusBadge from "@/components/common/StatusBadge";
import Button from "@/components/ui/button/Button";
import { TableCell, TableRow } from "@/components/ui/table";
import useRequiredFields from "@/hooks/useRequiredFields";
import { ApiError } from "@/lib/api/client";
import type { ConfigResponse } from "@/lib/api/types";
import { CheckCircleIcon, ListIcon, PieChartIcon } from "@/icons";
import {
  configKind,
  isConfigDraft,
  rangeHint,
  validateConfigValue,
  typeLabel,
} from "./configurationFields";

interface ConfigurationRowProps {
  config: ConfigResponse;
  editing: boolean;
  value: string;
  saving: boolean;
  busy: boolean;
  onChange: (value: string) => void;
  onSave: (config: ConfigResponse, value: string) => Promise<void>;
}

export default function ConfigurationRow({
  config,
  editing,
  value,
  saving,
  busy,
  onChange,
  onSave,
}: ConfigurationRowProps) {
  const t = useTranslations("configurationEditor");
  const required = useRequiredFields();
  const [error, setError] = useState<string | null>(null);
  const kind = configKind(config);
  const enabled = value.trim().toLowerCase() === "true";
  const unchanged = value.trim() === config.config_value.trim();
  const inputId = `configuration-${config.config_key}`;
  const validationError =
    !unchanged && value.trim() ? validateConfigValue(config, value, t) : null;
  const fieldError = error ?? validationError;

  const save = async () => {
    if (busy || unchanged) return;
    setError(null);
    if (!required.validate([value])) return;
    const validationError = validateConfigValue(config, value, t);
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      await onSave(config, value.trim());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("saveFailed"));
    }
  };

  const change = (next: string) => {
    if (!isConfigDraft(config, next)) {
      setError(
        t(
          kind === "integer"
            ? "integerRequired"
            : kind === "boolean"
              ? "booleanRequired"
              : "numberRequired",
        ),
      );
      return;
    }
    setError(null);
    onChange(next);
  };

  return (
    <TableRow className="transition-colors hover:bg-gray-50 dark:hover:bg-white/3">
      <TableCell className="max-w-md px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-theme-purple-500/10 text-theme-purple-500 dark:bg-theme-purple-500/15 dark:text-theme-purple-500"
          >
            {kind === "boolean" ? (
              <CheckCircleIcon className="size-5" />
            ) : kind === "integer" || kind === "number" ? (
              <PieChartIcon className="size-5" />
            ) : (
              <ListIcon className="size-5" />
            )}
          </span>
          <div className="min-w-0">
            <label
              htmlFor={editing ? inputId : undefined}
              className="text-theme-xs font-semibold break-words text-gray-900 dark:text-white/90"
            >
              {config.config_key}
            </label>
            <span className="mt-1 block w-fit rounded-full bg-brand-50 px-2 py-0.5 text-theme-xs text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              {typeLabel(config, t)}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="max-w-xs px-4 py-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {config.description || "—"}
      </TableCell>
      <TableCell className="px-4 py-3 text-sm">
        {editing ? (
          <div className="min-w-44">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                {kind === "boolean" ? (
                  <div className="flex min-h-11 items-center">
                    <Switch
                      id={inputId}
                      label={t(enabled ? "enabled" : "disabled")}
                      checked={enabled}
                      onChange={(checked) => change(String(checked))}
                      disabled={saving}
                    />
                  </div>
                ) : (
                  <Input
                    id={inputId}
                    type={
                      kind === "integer" || kind === "number"
                        ? "number"
                        : "text"
                    }
                    inputMode={
                      kind === "integer"
                        ? "numeric"
                        : kind === "number"
                          ? "decimal"
                          : undefined
                    }
                    step={
                      kind === "integer"
                        ? 1
                        : kind === "number"
                          ? "any"
                          : undefined
                    }
                    min={config.min_value ?? undefined}
                    max={config.max_value ?? undefined}
                    value={value}
                    onChange={(event) => change(event.target.value)}
                    error={required.invalid(value) || !!fieldError}
                    hint={rangeHint(config, t)}
                    disabled={saving}
                    onKeyDown={(event) => {
                      if (
                        !event.ctrlKey &&
                        !event.metaKey &&
                        !event.altKey &&
                        (kind === "number" || kind === "integer") &&
                        (["e", "E", "+"].includes(event.key) ||
                          (kind === "integer" &&
                            [".", ","].includes(event.key)))
                      ) {
                        event.preventDefault();
                        return;
                      }
                      if (event.key === "Enter" && !busy && !unchanged) {
                        event.preventDefault();
                        void save();
                      }
                    }}
                  />
                )}
              </div>
            </div>
            {fieldError && (
              <p
                role="alert"
                className="mt-2 text-theme-xs text-error-600 dark:text-error-400"
              >
                {fieldError}
              </p>
            )}
          </div>
        ) : kind === "boolean" ? (
          <StatusBadge active={enabled} kind="enabled" />
        ) : (
          <span className="font-medium break-words text-gray-800 dark:text-white/90">
            {config.config_value}
          </span>
        )}
      </TableCell>
      <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        {config.updated_at ? new Date(config.updated_at).toLocaleString() : "—"}
      </TableCell>
      {editing && (
        <TableCell className="px-4 py-3 text-end text-sm">
          <Button
            size="sm"
            className="h-11"
            onClick={save}
            disabled={busy || unchanged || !value.trim() || !!validationError}
          >
            {t(saving ? "saving" : "save")}
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}
