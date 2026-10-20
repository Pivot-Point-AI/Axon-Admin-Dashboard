import InstitutionLicenseOverview from "@/components/dashboard/InstitutionLicenseOverview";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickLinks from "@/components/dashboard/QuickLinks";
import RecentInstitutionsTable from "@/components/dashboard/RecentInstitutionsTable";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Axon",
  description:
    "Live institution and session overview for the Axon Admin Dashboard.",
};

export default async function DashboardHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboardAnalytics");
  return (
    <div className="space-y-6">
      <DashboardStats
        heading={
          <div>
            <h1 className="text-title-sm font-bold tracking-tight text-gray-950 dark:text-white/90">
              {t("pageTitle")}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("pageSubtitle")}
            </p>
          </div>
        }
      />

      <InstitutionLicenseOverview />

      <QuickLinks />

      <RecentInstitutionsTable />
    </div>
  );
}
