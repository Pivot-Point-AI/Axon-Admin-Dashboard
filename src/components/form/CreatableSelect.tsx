"use client";

import { useEffect, useRef, useState } from "react";

interface CreatableSelectProps {
  id?: string;
  value: string;
  options: string[];
  // Full option list. When it is larger than `options` (i.e. `options` has
  // been narrowed by a parent filter) a "Show all" footer lets the user widen it.
  allOptions?: string[];
  onChange: (value: string) => void;
  // Persists a brand-new option. Should throw to signal failure; the message
  // is shown inline and the option is not selected.
  onCreate?: (name: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Searchable dropdown of existing options that also lets the user add a new
 * one inline ("Add “xyz”").
 */
export default function CreatableSelect({
  id,
  value,
  options,
  allOptions,
  onChange,
  onCreate,
  placeholder = "Select or type to add…",
  disabled = false,
}: CreatableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canWiden = !!allOptions && allOptions.length > options.length;
  const visible = showAll && allOptions ? allOptions : options;
  const trimmed = query.trim();
  const filtered = visible.filter((o) =>
    o.toLowerCase().includes(trimmed.toLowerCase()),
  );
  const existsInAll = (allOptions ?? options).some(
    (o) => o.toLowerCase() === trimmed.toLowerCase(),
  );
  const canCreate = !!onCreate && trimmed.length > 0 && !existsInAll;

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const select = (option: string) => {
    onChange(option);
    setError(null);
    close();
  };

  const create = async () => {
    if (!onCreate || !canCreate) return;
    setCreating(true);
    setError(null);
    try {
      await onCreate(trimmed);
      onChange(trimmed);
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add option.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={id ? `${id}-listbox` : undefined}
        autoComplete="off"
        disabled={disabled || creating}
        value={open ? query : value}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (filtered.length === 1) select(filtered[0]);
            else if (canCreate) create();
          } else if (e.key === "Escape") {
            close();
          }
        }}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border appearance-none ps-4 pe-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 dark:focus:border-brand-800"
      />
      {open && (
        <div
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-theme-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {filtered.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => select(option)}
              className={`flex w-full items-center px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 ${
                option === value ? "bg-brand-50 dark:bg-brand-500/10" : ""
              }`}
            >
              {option}
            </button>
          ))}
          {filtered.length === 0 && !canCreate && (
            <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No options found.
            </p>
          )}
          {canCreate && (
            <button
              type="button"
              onClick={create}
              disabled={creating}
              className="flex w-full items-center px-4 py-2 text-start text-sm font-medium text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              {creating ? "Adding…" : `+ Add “${trimmed}”`}
            </button>
          )}
          {canWiden && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="w-full border-t border-gray-100 px-4 py-2 text-start text-theme-xs text-gray-500 hover:text-brand-500 dark:border-gray-800 dark:text-gray-400"
            >
              Show all options
            </button>
          )}
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-error-500">{error}</p>}
    </div>
  );
}
