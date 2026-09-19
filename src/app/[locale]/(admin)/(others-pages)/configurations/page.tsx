import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ConfigurationsManager from "@/components/configurations/ConfigurationsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurations | Axon Dashboard",
  description: "View and update system configuration values.",
};

export default function ConfigurationsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Configurations" />
      <ConfigurationsManager />
    </div>
  );
}
