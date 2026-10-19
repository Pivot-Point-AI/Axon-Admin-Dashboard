import { getTranslations, setRequestLocale } from "next-intl/server";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LogSessionDetail from "@/components/logs/LogSessionDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Log | Axon Dashboard",
  description: "Inspect a single conversation session's recorded history.",
};

export default async function LogSessionPage({
  params,
}: {
  params: Promise<{ locale: string; sessionId: string }>;
}) {
  const { locale, sessionId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("managementDesign");
  return (
    <div className="axon-management">
      <PageBreadcrumb
        pageTitle="Session Log"
        description={t("sessionLogSubtitle")}
      />
      <LogSessionDetail sessionId={decodeURIComponent(sessionId)} />
    </div>
  );
}
