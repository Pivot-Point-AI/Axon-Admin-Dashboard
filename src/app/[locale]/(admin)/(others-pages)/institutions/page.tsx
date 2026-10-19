import { getTranslations, setRequestLocale } from "next-intl/server";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import InstitutionsManager from "@/components/institutions/InstitutionsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Institutions | Axon Dashboard",
  description: "Create, update, and manage institution licenses.",
};

export default async function InstitutionsPage({
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
        pageTitle="Institutions"
        description={t("institutionsSubtitle")}
      />
      <InstitutionsManager />
    </div>
  );
}
