import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MessagesManager from "@/components/messages/MessagesManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages | Axon Dashboard",
  description: "View and toggle system message templates.",
};

export default function MessagesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Messages" />
      <MessagesManager />
    </div>
  );
}
