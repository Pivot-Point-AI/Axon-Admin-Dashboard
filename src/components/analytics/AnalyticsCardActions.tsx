import type { ReactNode } from "react";

// One header layout for every chart card: view-all (optional) beside the filter.
export default function AnalyticsCardActions({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {children}
    </div>
  );
}
