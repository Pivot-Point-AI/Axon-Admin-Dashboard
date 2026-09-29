import { PlusIcon } from "@/icons";

// Parameters may be stored bare ("amount") or already braced ("{amount}");
// normalise to the bare name and render/insert them as {name}.
export function parameterNames(message: Record<string, unknown>): string[] {
  if (!Array.isArray(message.parameters)) return [];
  return message.parameters
    .filter((p): p is string => typeof p === "string")
    .map((p) => p.trim().replace(/^\{+|\}+$/g, ""))
    .filter(Boolean);
}

interface ParameterTagProps {
  name: string;
  onClick?: () => void;
  title?: string;
}

const baseClasses =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-theme-xs font-medium";

export default function ParameterTag({ name, onClick, title }: ParameterTagProps) {
  if (!onClick) {
    return (
      <span
        className={`${baseClasses} bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300`}
      >
        {`{${name}}`}
      </span>
    );
  }
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      // Keep focus (and the caret) in the field being edited.
      onMouseDown={(e) => e.preventDefault()}
      className={`${baseClasses} border border-gray-200 bg-white text-gray-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-brand-800 dark:hover:bg-brand-500/15 dark:hover:text-brand-400`}
    >
      <PlusIcon />
      {`{${name}}`}
    </button>
  );
}
