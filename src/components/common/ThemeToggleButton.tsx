"use client";

import { useTheme } from "@/context/ThemeContext";
import { useTranslations } from "next-intl";
import { MoonIcon, SunIcon } from "@/icons";
import { cn } from "@/utils";

export function ThemeToggleButton({ className }: { className?: string }) {
  const { toggleTheme, theme } = useTheme();
  const t = useTranslations("fixes");
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t(dark ? "switchToLight" : "switchToDark")}
      title={t(dark ? "switchToLight" : "switchToDark")}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-brand-50 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:hover:bg-brand-900",
        className,
      )}
    >
      {dark ? (
        <SunIcon className="size-5 shrink-0 text-warning-400" />
      ) : (
        <MoonIcon className="size-5 shrink-0 text-theme-purple-500" />
      )}
    </button>
  );
}
