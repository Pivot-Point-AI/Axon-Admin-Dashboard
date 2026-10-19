import { asBoolean } from "@/utils/boolean";

const RTL_LANGUAGE_CODES = new Set([
  "ar",
  "ur",
  "fa",
  "he",
  "ps",
  "sd",
  "ug",
  "yi",
]);

const KNOWN_LANGUAGE_LABELS: Record<string, string> = {
  en: "english",
  ur: "urdu",
  ar: "arabic",
};

export interface MessageTextFieldDefinition {
  key: string;
  label: string;
  dir: "ltr" | "rtl";
  code?: string;
}

export const MESSAGE_TEXT_FIELDS: readonly MessageTextFieldDefinition[] = [
  { key: "msg_en", label: "english", dir: "ltr", code: "en" },
  { key: "msg_ur", label: "urdu", dir: "rtl", code: "ur" },
  { key: "msg_ar", label: "arabic", dir: "rtl", code: "ar" },
] as const;

export type MessageDraft = {
  msg_en: string;
  msg_ur: string;
  msg_ar: string;
  is_active: boolean;
  [key: string]: string | boolean;
};

export function messageTextFields(
  languages?: Record<string, unknown>[],
): readonly MessageTextFieldDefinition[] {
  if (!Array.isArray(languages) || languages.length === 0) {
    return MESSAGE_TEXT_FIELDS;
  }
  const seen = new Set<string>();
  const fields: MessageTextFieldDefinition[] = [];
  for (const language of languages) {
    const rawCode = String(language.language_code ?? "")
      .trim()
      .toLowerCase();
    if (!rawCode) continue;
    const code = rawCode.replace(/^msg_/, "");
    if (!code || seen.has(code)) continue;
    seen.add(code);
    const name = String(language.language_name ?? "").trim();
    fields.push({
      key: `msg_${code}`,
      label: KNOWN_LANGUAGE_LABELS[code] ?? (name || code.toUpperCase()),
      dir: RTL_LANGUAGE_CODES.has(code) ? "rtl" : "ltr",
      code,
    });
  }
  return fields.length > 0 ? fields : MESSAGE_TEXT_FIELDS;
}

export function fieldLanguageLabel(
  field: MessageTextFieldDefinition,
  t: (key: string) => string,
): string {
  if (
    field.label === "english" ||
    field.label === "urdu" ||
    field.label === "arabic"
  ) {
    return t(field.label);
  }
  return field.label;
}

export function draftText(draft: MessageDraft, key: string): string {
  const value = draft[key];
  return typeof value === "string" ? value : "";
}

export function messageDraft(
  message: Record<string, unknown>,
  fields: readonly MessageTextFieldDefinition[] = MESSAGE_TEXT_FIELDS,
): MessageDraft {
  const draft: MessageDraft = {
    msg_en: typeof message.msg_en === "string" ? message.msg_en : "",
    msg_ur: typeof message.msg_ur === "string" ? message.msg_ur : "",
    msg_ar: typeof message.msg_ar === "string" ? message.msg_ar : "",
    is_active: asBoolean(message.is_active, true),
  };
  for (const { key } of fields) {
    draft[key] =
      typeof message[key] === "string" ? (message[key] as string) : "";
  }
  for (const [key, value] of Object.entries(message)) {
    if (key.startsWith("msg_")) {
      draft[key] = typeof value === "string" ? value : "";
    }
  }
  return draft;
}

export function messageChanged(
  message: Record<string, unknown>,
  draft: MessageDraft,
  fields: readonly MessageTextFieldDefinition[] = MESSAGE_TEXT_FIELDS,
) {
  const initial = messageDraft(message, fields);
  const keys = new Set([
    ...fields.map((field) => field.key),
    ...Object.keys(draft).filter((key) => key.startsWith("msg_")),
  ]);
  return (
    draft.is_active !== initial.is_active ||
    Array.from(keys).some(
      (key) => draftText(draft, key) !== draftText(initial, key),
    )
  );
}

export function messageUpdate(
  message: Record<string, unknown>,
  draft: MessageDraft,
  fields: readonly MessageTextFieldDefinition[] = MESSAGE_TEXT_FIELDS,
) {
  const initial = messageDraft(message, fields);
  const updated: Record<string, unknown> = {
    ...message,
    is_active: draft.is_active,
  };
  const keys = new Set([
    ...fields.map((field) => field.key),
    ...Object.keys(draft).filter((key) => key.startsWith("msg_")),
  ]);
  for (const key of keys) {
    const nextValue = draftText(draft, key);
    if (nextValue !== draftText(initial, key)) {
      updated[key] = nextValue;
    }
  }
  return updated;
}

export function insertMessageParameter(
  text: string,
  name: string,
  start = text.length,
  end = start,
) {
  const before = text.slice(0, start);
  const after = text.slice(end);
  const prefix = before && !/\s$/.test(before) ? " " : "";
  const suffix = after && !/^\s/.test(after) ? " " : "";
  const token = `{${name}}`;
  return {
    text: before + prefix + token + suffix + after,
    caret: start + prefix.length + token.length,
  };
}
