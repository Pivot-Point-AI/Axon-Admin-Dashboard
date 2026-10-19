"use client";

import { useId, useRef } from "react";
import { useTranslations } from "next-intl";
import ParameterTag from "./ParameterTag";
import {
  fieldLanguageLabel,
  insertMessageParameter,
  type MessageTextFieldDefinition,
} from "./messageFields";

interface MessageTextFieldProps {
  field: MessageTextFieldDefinition;
  messageKey: string;
  value: string;
  parameters: string[];
  disabled: boolean;
  onChange: (value: string) => void;
}

export default function MessageTextField({
  field,
  messageKey,
  value,
  parameters,
  disabled,
  onChange,
}: MessageTextFieldProps) {
  const t = useTranslations("messageEditor");
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const focused = useRef(false);
  const language = fieldLanguageLabel(field, t);
  const missing = parameters.filter((name) => !value.includes(`{${name}}`));
  const insert = (name: string) => {
    if (disabled) return;
    const start =
      focused.current && input.current
        ? input.current.selectionStart
        : value.length;
    const end =
      focused.current && input.current ? input.current.selectionEnd : start;
    const next = insertMessageParameter(value, name, start, end);
    onChange(next.text);
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(next.caret, next.caret);
    });
  };

  return (
    <div className="min-w-48">
      <textarea
        id={id}
        ref={input}
        dir={field.dir}
        rows={2}
        aria-label={t("fieldLabel", {
          language,
          key: messageKey,
        })}
        aria-describedby={missing.length ? `${id}-missing` : undefined}
        disabled={disabled}
        value={value}
        onFocus={() => {
          focused.current = true;
        }}
        onChange={(event) => onChange(event.target.value)}
        className="block w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm leading-6 text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 focus:outline-hidden disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-brand-700"
      />
      {parameters.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {parameters.map((name) => (
            <ParameterTag
              key={name}
              name={name}
              disabled={disabled}
              title={t("insertParameter", { name, language })}
              onClick={() => insert(name)}
            />
          ))}
        </div>
      )}
      {missing.length > 0 && (
        <p
          id={`${id}-missing`}
          className="mt-1.5 text-theme-xs text-warning-600 dark:text-warning-400"
        >
          {t("missingParameters", {
            names: missing.map((name) => `{${name}}`).join(", "),
          })}
        </p>
      )}
    </div>
  );
}
