import { setRequestLocale } from "next-intl/server";
import LogsManager from "@/components/logs/LogsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logs | Bank Assistant Admin",
  description: "Browse recorded conversation sessions and their history.",
};

export default async function LogsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="axon-management lg:-my-5">
      <LogsManager />
    </div>
  );
}
