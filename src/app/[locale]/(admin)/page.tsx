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
  const t = await getTranslations("redesign");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("dashboardSubtitle")}
          </p>
        </div>
      </div>

      <DashboardStats />

      <QuickLinks />

      <RecentInstitutionsTable />
    </div>
  );
}
