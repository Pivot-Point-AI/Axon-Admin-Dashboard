import type { ReactNode } from "react";
import { cn } from "@/utils";

interface ComponentCardProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  description?: string;
  className?: string;
}

export default function ComponentCard({
  title,
  children,
  actions,
  description,
  className,
}: ComponentCardProps) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
