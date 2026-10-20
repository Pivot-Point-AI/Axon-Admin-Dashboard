import { setRequestLocale } from "next-intl/server";
import InstitutionsManager from "@/components/institutions/InstitutionsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Institutions | Axon Dashboard",
  description: "Create, update, and manage institution licenses.",
};

export default async function InstitutionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="axon-management">
      <InstitutionsManager />
    </div>
  );
}
