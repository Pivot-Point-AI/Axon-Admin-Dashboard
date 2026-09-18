import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Axon Dashboard",
  description: "Admin identity for the Axon Bank Assistant dashboard.",
};

export default function Profile() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Profile" />
      <UserMetaCard />
    </div>
  );
}
