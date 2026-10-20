"use client";

import { useRef, useState } from "react";
import Label from "@/components/form/Label";
import { CalenderIcon } from "@/icons/index";

interface DateFieldProps {
  id: string;
  label?: string;
  placeholder?: string;
  hideLabel?: boolean;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  error?: boolean;
}

/**
 * Date input with a visible calendar icon. The native picker indicator is
 * hidden globally, so the whole field (and the icon) opens the picker.
 */
export default function DateField({
  id,
  label = "",
  placeholder,
  hideLabel = false,
  value,
  onChange,
  min,
  max,
  required = false,
  error = false,
}: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const openPicker = () => {
    try {
      inputRef.current?.showPicker?.();
    } catch {
      // showPicker can throw if the browser blocks it; the field still works by typing.
    }
  };

  const showPlaceholder = !focused && !value && Boolean(placeholder);

  return (
    <div>
      {label && !hideLabel && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-error-500"> *</span>}
        </Label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type={showPlaceholder ? "text" : "date"}
          placeholder={placeholder}
          value={showPlaceholder ? "" : value}
          min={min}
          max={max}
          required={required}
          aria-label={label || placeholder}
          aria-invalid={error || undefined}
          onFocus={() => {
            setFocused(true);
            openPicker();
          }}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          onClick={openPicker}
          className={`h-11 w-full min-w-0 cursor-pointer rounded-lg border bg-transparent ps-4 pe-11 text-sm text-gray-800 shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:scheme-dark ${
            error
              ? "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500 dark:focus:border-error-400"
              : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Open ${label || placeholder || "date"} calendar`}
          onClick={openPicker}
          className="absolute end-0 top-0 flex h-11 w-11 items-center justify-center text-gray-500 dark:text-gray-400"
        >
          <CalenderIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
