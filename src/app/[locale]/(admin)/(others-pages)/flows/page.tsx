import { getTranslations, setRequestLocale } from "next-intl/server";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FlowsManager from "@/components/flows/FlowsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flows | Axon Dashboard",
  description: "Enable or disable conversation flows.",
};

export default async function FlowsPage({
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
        pageTitle="Flows"
        description={t("flowsSubtitle")}
      />
      <FlowsManager />
    </div>
  );
}
