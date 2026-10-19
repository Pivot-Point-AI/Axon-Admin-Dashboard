import { getTranslations, setRequestLocale } from "next-intl/server";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MessagesManager from "@/components/messages/MessagesManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages | Axon Dashboard",
  description: "View and toggle system message templates.",
};

export default async function MessagesPage({
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
        pageTitle="Messages"
        description={t("messagesSubtitle")}
      />
      <MessagesManager />
    </div>
  );
}
