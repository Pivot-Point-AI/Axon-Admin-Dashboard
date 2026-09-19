import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LanguagesManager from "@/components/languages/LanguagesManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Languages | Axon Dashboard",
  description: "Manage supported languages and the primary language.",
};

export default function LanguagesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Languages" />
      <LanguagesManager />
    </div>
  );
}
