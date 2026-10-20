import { ReactNode } from "react";

interface BreadcrumbProps {
  pageTitle: string;
  description?: string;
  children?: ReactNode;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({
  pageTitle,
  description,
  children,
}) => {
  return (
    <header className="axon-page-heading mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-title-sm font-bold tracking-tight text-gray-950 dark:text-white/90">
          {pageTitle}
        </h1>
        {description && (
          <p className="max-w-4xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </header>
  );
};

export default PageBreadcrumb;
