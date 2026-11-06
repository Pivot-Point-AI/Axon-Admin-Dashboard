"use client";

import { useTranslations } from "next-intl";
import { LOG_FLOW_STATUSES, type LogFlowStatus } from "@/lib/api/logs";

interface LogFlowStatusSelectProps {
  id?: string;
  value: LogFlowStatus | "";
  onChange: (value: LogFlowStatus | "") => void;
  className?: string;
}

const statusKeys = {
  completed: "flowStatusCompleted",
  abandoned: "flowStatusAbandoned",
  failed: "flowStatusFailed",
} as const;

/** Filters history logs by flow outcome (`flow_status`). */
export default function LogFlowStatusSelect({
  id,
  value,
  onChange,
  className,
}: LogFlowStatusSelectProps) {
  const t = useTranslations("logTerminal");
  return (
    <select
      id={id}
      aria-label={t("flowStatus")}
      value={value}
      onChange={(event) =>
        onChange(event.target.value as LogFlowStatus | "")
      }
      className={className}
    >
      <option value="">{t("flowStatusAll")}</option>
      {LOG_FLOW_STATUSES.map((status) => (
        <option key={status} value={status}>
          {t(statusKeys[status])}
        </option>
      ))}
    </select>
  );
}
