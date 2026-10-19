import { getTranslations, setRequestLocale } from "next-intl/server";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Axon Dashboard",
  description: "Admin identity for the Axon Bank Assistant dashboard.",
};

export default async function Profile({
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
        pageTitle="Profile"
        description={t("profileSubtitle")}
      />
      <UserMetaCard />
    </div>
  );
}
