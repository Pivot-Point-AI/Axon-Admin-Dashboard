import { getTranslations, setRequestLocale } from "next-intl/server";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LanguagesManager from "@/components/languages/LanguagesManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Languages | Axon Dashboard",
  description: "Manage supported languages and the primary language.",
};

export default async function LanguagesPage({
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
        pageTitle="Languages"
        description={t("languagesSubtitle")}
      />
      <LanguagesManager />
    </div>
  );
}
