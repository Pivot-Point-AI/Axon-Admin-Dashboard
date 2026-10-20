import type { FAQItemModel, FAQSettingsModel } from "@/lib/api/faqs";
import { asBoolean } from "@/utils/boolean";
import { recordId } from "@/lib/api/normalize";

export interface FAQItem extends FAQItemModel {
  id: number | null;
}
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export function faqItem(
  value: unknown,
  section: Record<string, unknown> = {},
): FAQItem {
  const row = record(value);
  return {
    id: recordId(row, "faq_id"),
    section_title: String(
      row.section_title ?? section.section_title ?? section.title ?? "",
    ),
    question: String(row.question ?? ""),
    answer: String(row.answer ?? ""),
    section_order: Number(row.section_order ?? section.section_order ?? 0),
    item_order: Number(row.item_order ?? 0),
    is_active: asBoolean(row.is_active, true),
  };
}

// The API declares a free-form object response. Accept both flat FAQ lists
// and client-facing lists grouped into sections, preserving database IDs.
export function faqData(payload: unknown): {
  items: FAQItem[];
  settings: FAQSettingsModel;
} {
  const root = record(payload);
  const data = Object.keys(record(root.data)).length ? record(root.data) : root;
  const settings = record(
    data.settings ?? data.header ?? data.header_settings ?? root.settings,
  );
  const rows = Array.isArray(payload)
    ? payload
    : (data.faqs ?? data.sections ?? data.items ?? data.data ?? []);
  const items: FAQItem[] = [];
  if (Array.isArray(rows))
    for (const value of rows) {
      const section = record(value);
      const children = section.items ?? section.faqs ?? section.questions;
      if (Array.isArray(children))
        items.push(...children.map((item) => faqItem(item, section)));
      else if (section.question != null) items.push(faqItem(section));
    }
  items.sort(
    (a, b) =>
      (a.section_order ?? 0) - (b.section_order ?? 0) ||
      (a.item_order ?? 0) - (b.item_order ?? 0),
  );
  return {
    items,
    settings: {
      title: String(settings.title ?? data.title ?? ""),
      subtitle: String(settings.subtitle ?? data.subtitle ?? ""),
    },
  };
}
