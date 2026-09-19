import ApiStatusBadge from "@/components/common/ApiStatusBadge";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickLinks from "@/components/dashboard/QuickLinks";
import RecentInstitutionsTable from "@/components/dashboard/RecentInstitutionsTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Axon",
  description: "Live institution and session overview for the Axon Admin Dashboard.",
};

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Dashboard
        </h2>
        <ApiStatusBadge />
      </div>

      <DashboardStats />

      <QuickLinks />

      <RecentInstitutionsTable />
    </div>
  );
}
