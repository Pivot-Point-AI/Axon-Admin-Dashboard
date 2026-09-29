import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LogsManager from "@/components/logs/LogsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logs | Bank Assistant Admin",
  description: "Browse recorded conversation sessions and their history.",
};

export default function LogsPage() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageBreadcrumb pageTitle="Logs" />
      </div>
      <LogsManager />
    </div>
  );
}
