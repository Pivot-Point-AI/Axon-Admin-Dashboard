import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ApiStatusBadge from "@/components/common/ApiStatusBadge";
import InstitutionsManager from "@/components/institutions/InstitutionsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Institutions | Axon Dashboard",
  description: "Create, update, and manage institution licenses.",
};

export default function InstitutionsPage() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageBreadcrumb pageTitle="Institutions" />
        <ApiStatusBadge />
      </div>
      <InstitutionsManager />
    </div>
  );
}
