import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LogSessionDetail from "@/components/logs/LogSessionDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Log | Axon Dashboard",
  description: "Inspect a single conversation session's recorded history.",
};

export default async function LogSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <div>
      <PageBreadcrumb pageTitle="Session Log" />
      <LogSessionDetail sessionId={decodeURIComponent(sessionId)} />
    </div>
  );
}
