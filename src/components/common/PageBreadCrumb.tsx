interface BreadcrumbProps {
  pageTitle: string;
  description?: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({
  pageTitle,
  description,
}) => {
  return (
    <header className="mb-6 space-y-1">
      <h1 className="text-title-sm font-semibold tracking-tight text-gray-900 dark:text-white/90">
        {pageTitle}
      </h1>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </header>
  );
};

export default PageBreadcrumb;
