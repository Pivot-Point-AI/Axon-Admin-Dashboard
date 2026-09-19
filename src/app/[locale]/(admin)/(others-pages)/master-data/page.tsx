import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MasterDataManager from "@/components/masterData/MasterDataManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Master Data | Axon Dashboard",
  description: "Manage banks, billers, and donation organizations.",
};

export default function MasterDataPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Master Data" />
      <MasterDataManager />
    </div>
  );
}
