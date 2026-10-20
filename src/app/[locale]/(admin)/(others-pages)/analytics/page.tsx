import { getTranslations, setRequestLocale } from "next-intl/server";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
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
    <div>
      <PageBreadcrumb
        pageTitle={t("pageTitle")}
        description={t("description")}
      />
      <AnalyticsManager />
    </div>
  );
}
