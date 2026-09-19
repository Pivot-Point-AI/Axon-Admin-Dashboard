import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FlowsManager from "@/components/flows/FlowsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flows | Axon Dashboard",
  description: "Enable or disable conversation flows.",
};

export default function FlowsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Flows" />
      <FlowsManager />
    </div>
  );
}
