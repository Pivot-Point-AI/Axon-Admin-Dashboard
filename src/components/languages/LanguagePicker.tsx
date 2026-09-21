"use client";

import { useEffect, useRef, useState } from "react";

export interface LanguageOption {
  code: string;
  name: string;
  disabled?: boolean;
}

interface LanguagePickerProps {
  id?: string;
  options: LanguageOption[];
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}

export default function LanguagePicker({
  id,
  options,
  value,
  onChange,
  placeholder = "Search languages…",
}: LanguagePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.code === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(
    (o) =>
      o.name.toLowerCase().includes(query.toLowerCase()) ||
      o.code.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        autoComplete="off"
        value={open ? query : (selected?.name ?? "")}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border appearance-none ps-4 pe-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 dark:focus:border-brand-800"
      />
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-theme-lg dark:border-gray-700 dark:bg-gray-900">
          {filtered.length === 0 ? (
            <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No languages found.
            </p>
          ) : (
            filtered.map((option) => (
              <button
                key={option.code}
                type="button"
                disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.code);
                  setOpen(false);
                  setQuery("");
                }}
                className={`flex w-full items-center justify-between px-4 py-2 text-start text-sm ${
                  option.disabled
                    ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                } ${option.code === value ? "bg-brand-50 dark:bg-brand-500/10" : ""}`}
              >
                <span>{option.name}</span>
                <span className="font-mono text-theme-xs text-gray-400 dark:text-gray-500">
                  {option.code}
                  {option.disabled ? " · added" : ""}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
