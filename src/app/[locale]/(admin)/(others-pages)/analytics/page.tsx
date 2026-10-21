import { getTranslations, setRequestLocale } from "next-intl/server";
import AnalyticsManager from "@/components/analytics/AnalyticsManager";
import { analyticsEndpoints, type AnalyticsSection } from "@/lib/api/analytics";

export default async function AnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ section?: string | string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { section } = await searchParams;
  const initialSection: AnalyticsSection =
    typeof section === "string" && Object.hasOwn(analyticsEndpoints, section)
      ? (section as AnalyticsSection)
      : "users";
  const t = await getTranslations("analytics");
  return (
    <AnalyticsManager
      key={initialSection}
      initialSection={initialSection}
      heading={
        <div>
          <h1 className="text-title-sm font-bold tracking-tight text-gray-950 dark:text-white/90">
            {t("pageTitle")}
          </h1>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {t("description")}
          </p>
        </div>
      }
    />
  );
}
