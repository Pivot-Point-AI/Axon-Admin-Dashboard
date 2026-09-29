"use client";

import { useState } from "react";
import { cn } from "@/utils";
import LogSessionsList from "./LogSessionsList";
import LogHistoryViewer from "./LogHistoryViewer";

const tabs = [
  { key: "live", label: "Live Logs" },
  { key: "historical", label: "Historical Logs" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function LogsManager() {
  const [activeTab, setActiveTab] = useState<TabKey>("live");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div
        role="tablist"
        className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-800"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "live" ? <LogSessionsList /> : <LogHistoryViewer />}
    </div>
  );
}
