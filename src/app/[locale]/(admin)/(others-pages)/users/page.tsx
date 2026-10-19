import { getTranslations, setRequestLocale } from "next-intl/server";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UsersManager from "@/components/users/UsersManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Users | Axon Dashboard",
  description: "Create and manage dashboard admin users.",
};

export default async function UsersPage({
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
        pageTitle="Dashboard Users"
        description={t("usersSubtitle")}
      />
      <UsersManager />
    </div>
  );
}
