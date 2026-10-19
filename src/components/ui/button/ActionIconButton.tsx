import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils";

interface ActionIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone: "edit" | "delete" | "renew" | "copy";
}

const tones = {
  edit: "bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25",
  delete:
    "bg-error-50 text-error-600 hover:bg-error-100 dark:bg-error-500/15 dark:text-error-400 dark:hover:bg-error-500/25",
  renew:
    "bg-warning-50 text-warning-600 hover:bg-warning-100 dark:bg-warning-500/15 dark:text-warning-400 dark:hover:bg-warning-500/25",
  copy: "bg-theme-purple-500/10 text-theme-purple-500 hover:bg-theme-purple-500/20 dark:bg-theme-purple-500/15 dark:text-theme-purple-500 dark:hover:bg-theme-purple-500/25",
};

export default function ActionIconButton({
  tone,
  title,
  className,
  children,
  type = "button",
  ...props
}: ActionIconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      title={title}
      aria-label={props["aria-label"] ?? title}
      className={cn(
        "axon-action inline-flex size-8 shrink-0 items-center justify-center rounded-lg p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:cursor-not-allowed disabled:opacity-40",
        tones[tone],
        className,
      )}
    >
      {children}
    </button>
  );
}
