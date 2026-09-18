import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ApiStatusBadge from "@/components/common/ApiStatusBadge";
import ChatHistoryExplorer from "@/components/chat-history/ChatHistoryExplorer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat History | Axon Dashboard",
  description: "Search and manage a user's stored chat history.",
};

export default function ChatHistoryPage() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageBreadcrumb pageTitle="Chat History" />
        <ApiStatusBadge />
      </div>
      <ChatHistoryExplorer />
    </div>
  );
}
