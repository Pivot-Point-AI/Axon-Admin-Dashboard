"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/input/Switch";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { TableCell, TableRow } from "@/components/ui/table";
import useRequiredFields from "@/hooks/useRequiredFields";
import { ApiError } from "@/lib/api/client";
import type { ConfigResponse } from "@/lib/api/types";
import {
  configKind,
  rangeHint,
  typeLabel,
  validateConfigValue,
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

  const save = async () => {
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
    setError(null);
    onChange(next);
  };

  return (
    <TableRow className="transition-colors hover:bg-gray-50 dark:hover:bg-white/3">
      <TableCell className="max-w-md px-4 py-3">
        <label
          htmlFor={editing ? inputId : undefined}
          className="font-mono text-sm font-medium break-words text-gray-800 dark:text-white/90"
        >
          {config.config_key}
        </label>
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
                    step={kind === "integer" ? 1 : undefined}
                    min={config.min_value ?? undefined}
                    max={config.max_value ?? undefined}
                    value={value}
                    onChange={(event) => change(event.target.value)}
                    error={required.invalid(value) || !!error}
                    hint={rangeHint(config, t)}
                    disabled={saving}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !busy && !unchanged) {
                        event.preventDefault();
                        void save();
                      }
                    }}
                  />
                )}
              </div>
            </div>
            {error && (
              <p
                role="alert"
                className="mt-2 text-theme-xs text-error-600 dark:text-error-400"
              >
                {error}
              </p>
            )}
          </div>
        ) : kind === "boolean" ? (
          <Badge size="sm" color={enabled ? "success" : "light"}>
            {t(enabled ? "enabled" : "disabled")}
          </Badge>
        ) : (
          <span className="font-medium break-words text-gray-800 dark:text-white/90">
            {config.config_value}
          </span>
        )}
      </TableCell>
      <TableCell className="px-4 py-3 text-sm">
        <Badge size="sm" color="light">
          {typeLabel(config, t)}
        </Badge>
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
            disabled={busy || unchanged}
          >
            {t(saving ? "saving" : "save")}
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}
