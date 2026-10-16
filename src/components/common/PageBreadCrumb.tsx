import { useTranslations } from "next-intl";
import { ChevronLeftIcon } from "@/icons";
import { Link } from "@/i18n/navigation";

interface BreadcrumbProps {
  pageTitle: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  const t = useTranslations("common");
  return (
    <div className="mb-6 flex flex-wrap items-center justify-start gap-3">
      <h2
        className="text-xl font-semibold text-gray-800 dark:text-white/90"
        x-text="pageName"
      >
        {pageTitle}
      </h2>
      <nav>
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              href="/"
            >
              {t("home")}
              <ChevronLeftIcon className="size-4 rotate-180 rtl:rotate-0" />
            </Link>
          </li>
          <li className="text-sm text-gray-800 dark:text-white/90">
            {pageTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
