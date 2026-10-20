import { getTranslations, setRequestLocale } from "next-intl/server";
import AnalyticsManager from "@/components/analytics/AnalyticsManager";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("analytics");
  return (
    <AnalyticsManager
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
