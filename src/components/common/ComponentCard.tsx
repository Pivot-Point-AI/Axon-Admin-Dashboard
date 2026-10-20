import type { ReactNode } from "react";
import { cn } from "@/utils";

interface ComponentCardProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  description?: string;
  className?: string;
  icon?: ReactNode;
}

export default function ComponentCard({
  title,
  children,
  actions,
  description,
  className,
  icon,
}: ComponentCardProps) {
  return (
    <section
      className={cn(
        "axon-panel min-w-0 rounded-xl border border-brand-100/70 bg-white p-4 shadow-theme-xs sm:p-5 dark:border-gray-800 dark:bg-gray-900",
        className,
      )}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {icon && (
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-300 [&>svg]:size-5"
            >
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-base leading-6 font-semibold text-gray-950 dark:text-white/90">
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
