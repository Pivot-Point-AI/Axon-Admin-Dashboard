import type { ConfigResponse } from "@/lib/api/types";

export type ConfigKind = "boolean" | "integer" | "number" | "string";
type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function configKind(config: ConfigResponse): ConfigKind {
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

export function typeLabel(config: ConfigResponse, t: Translate): string {
  return t(`types.${configKind(config)}`);
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
    const number = Number(value);
    if (!Number.isFinite(number)) return t("numberRequired");
    if (kind === "integer" && !Number.isInteger(number))
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
