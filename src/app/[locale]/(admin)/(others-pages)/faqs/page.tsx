import { getTranslations, setRequestLocale } from "next-intl/server";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FaqsManager from "@/components/faqs/FaqsManager";

export default async function FaqsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faqs");
  return (
    <div>
      <PageBreadcrumb
        pageTitle={t("pageTitle")}
        description={t("description")}
      />
      <FaqsManager />
    </div>
  );
}
