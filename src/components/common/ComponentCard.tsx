import type { ReactNode } from "react";
import { cn } from "@/utils";

interface ComponentCardProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  description?: string;
  className?: string;
  icon?: ReactNode;
  compact?: boolean;
  iconClassName?: string;
}

export default function ComponentCard({
  title,
  children,
  actions,
  description,
  className,
  icon,
  compact = false,
  iconClassName,
}: ComponentCardProps) {
  return (
    <section
      className={cn(
        "axon-panel min-w-0 rounded-xl border border-brand-100/70 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900",
        !compact && "sm:p-5",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-wrap justify-between gap-3",
          compact ? "mb-4 items-start" : "mb-5 items-center",
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {icon && (
            <span
              aria-hidden="true"
              className={cn(
                "flex shrink-0 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300 [&>svg]:size-5",
                compact ? "size-9" : "size-10",
                iconClassName,
              )}
            >
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2
              className={cn(
                "leading-6 font-bold text-gray-950 dark:text-white/90",
                compact ? "text-sm" : "text-base",
              )}
            >
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-theme-xs leading-5 text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
