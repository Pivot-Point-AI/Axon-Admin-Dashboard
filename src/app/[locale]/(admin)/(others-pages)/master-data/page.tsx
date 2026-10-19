import { getTranslations, setRequestLocale } from "next-intl/server";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MasterDataManager from "@/components/masterData/MasterDataManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Master Data | Axon Dashboard",
  description: "Manage banks, billers, and donation organizations.",
};

export default async function MasterDataPage({
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
        pageTitle="Master Data"
        description={t("masterDataSubtitle")}
      />
      <MasterDataManager />
    </div>
  );
}
