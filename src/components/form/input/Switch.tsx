import type React from "react";

interface SwitchProps {
  label?: string;
  checked: boolean;
  className?: string;
  id?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({
  label,
  checked,
  id,
  onChange,
  className = "",
  disabled = false,
}) => {
  return (
    <label
      className={`flex items-center gap-3 ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    >
      <span className="relative inline-flex h-6 w-11 shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          className={`peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full border border-gray-300 bg-gray-200 transition-colors checked:border-success-500 checked:bg-success-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-700 dark:checked:border-success-500 dark:checked:bg-success-500 ${className}`}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="pointer-events-none absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-theme-xs transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
      </span>
      {label && (
        <span
          className={`text-sm font-medium ${checked ? "text-success-600 dark:text-success-400" : "text-error-600 dark:text-error-400"}`}
        >
          {label}
        </span>
      )}
    </label>
  );
};

export default Switch;
