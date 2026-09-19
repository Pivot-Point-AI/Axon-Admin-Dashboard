import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UsersManager from "@/components/users/UsersManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Users | Axon Dashboard",
  description: "Create and manage dashboard admin users.",
};

export default function UsersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard Users" />
      <UsersManager />
    </div>
  );
}
