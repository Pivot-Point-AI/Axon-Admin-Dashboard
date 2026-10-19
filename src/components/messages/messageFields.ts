import { asBoolean } from "@/utils/boolean";

export const MESSAGE_TEXT_FIELDS = [
  { key: "msg_en", label: "english", dir: "ltr" },
  { key: "msg_ur", label: "urdu", dir: "rtl" },
  { key: "msg_ar", label: "arabic", dir: "rtl" },
] as const;

export type MessageTextFieldDefinition = (typeof MESSAGE_TEXT_FIELDS)[number];
export type MessageDraft = Record<MessageTextFieldDefinition["key"], string> & {
  is_active: boolean;
};

export function messageDraft(message: Record<string, unknown>): MessageDraft {
  return {
    msg_en: typeof message.msg_en === "string" ? message.msg_en : "",
    msg_ur: typeof message.msg_ur === "string" ? message.msg_ur : "",
    msg_ar: typeof message.msg_ar === "string" ? message.msg_ar : "",
    is_active: asBoolean(message.is_active, true),
  };
}

export function messageChanged(
  message: Record<string, unknown>,
  draft: MessageDraft,
) {
  const initial = messageDraft(message);
  return (
    draft.is_active !== initial.is_active ||
    MESSAGE_TEXT_FIELDS.some(({ key }) => draft[key] !== initial[key])
  );
}

export function messageUpdate(
  message: Record<string, unknown>,
  draft: MessageDraft,
) {
  const initial = messageDraft(message);
  const updated: Record<string, unknown> = {
    ...message,
    is_active: draft.is_active,
  };
  for (const { key } of MESSAGE_TEXT_FIELDS) {
    if (draft[key] !== initial[key]) updated[key] = draft[key];
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
