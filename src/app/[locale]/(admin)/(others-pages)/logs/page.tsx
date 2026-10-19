import { getTranslations, setRequestLocale } from "next-intl/server";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LogsManager from "@/components/logs/LogsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logs | Bank Assistant Admin",
  description: "Browse recorded conversation sessions and their history.",
};

export default async function LogsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("managementDesign");
  return (
    <div className="axon-management">
      <PageBreadcrumb pageTitle="Logs" description={t("logsSubtitle")} />
      <LogsManager />
    </div>
  );
}
