import { getTranslations, setRequestLocale } from "next-intl/server";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ConfigurationsManager from "@/components/configurations/ConfigurationsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurations | Axon Dashboard",
  description: "View and update system configuration values.",
};

export default async function ConfigurationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("managementDesign");
  return (
    <div className="axon-management">
      <PageBreadcrumb
        pageTitle="Configurations"
        description={t("configsSubtitle")}
      />
      <ConfigurationsManager />
    </div>
  );
}
