"use client";

import LogHistoryViewer from "./LogHistoryViewer";

export default function LogSessionDetail({
  sessionId,
}: {
  sessionId: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 lg:mb-7 dark:text-white/90">
        Session {sessionId}
      </h3>
      <LogHistoryViewer sessionId={sessionId} autoSearch />
    </div>
  );
}
