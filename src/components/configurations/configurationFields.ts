import type { ConfigResponse } from "@/lib/api/types";

export type ConfigKind = "boolean" | "integer" | "number" | "string";
type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function configKind(config: ConfigResponse): ConfigKind {
  switch ((config.data_type ?? "string").trim().toLowerCase()) {
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

export function typeLabel(config: ConfigResponse, t: Translate): string {
  return t(`types.${configKind(config)}`);
}

// Allow incomplete numeric drafts while typing (for example "-" or "0.").
// The complete value and its bounds are checked before saving.
export function isConfigDraft(config: ConfigResponse, value: string): boolean {
  const kind = configKind(config);
  if (kind === "integer") return /^-?\d*$/.test(value);
  if (kind === "number") return /^-?(?:\d+(?:\.\d*)?|\.\d*)?$/.test(value);
  if (kind === "boolean") return ["true", "false"].includes(value);
  return true;
}

export function validateConfigValue(
  config: ConfigResponse,
  value: string,
  t: Translate,
): string | null {
  const kind = configKind(config);
  if (kind === "boolean")
    return ["true", "false"].includes(value.trim().toLowerCase())
      ? null
      : t("booleanRequired");
  if (kind === "integer" || kind === "number") {
    const trimmed = value.trim();
    if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed))
      return t("numberRequired");
    const number = Number(trimmed);
    if (!Number.isFinite(number)) return t("numberRequired");
    if (
      kind === "integer" &&
      (!/^-?\d+$/.test(trimmed) || !Number.isInteger(number))
    )
      return t("integerRequired");
    if (config.min_value != null && number < config.min_value)
      return t("minimum", { value: config.min_value });
    if (config.max_value != null && number > config.max_value)
      return t("maximum", { value: config.max_value });
  }
  return null;
}

export function rangeHint(
  config: ConfigResponse,
  t: Translate,
): string | undefined {
  const { min_value: min, max_value: max } = config;
  if (min != null && max != null) return t("range", { min, max });
  if (min != null) return t("minimum", { value: min });
  if (max != null) return t("maximum", { value: max });
  return undefined;
}
