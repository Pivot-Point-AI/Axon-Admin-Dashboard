"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button/Button";
import type { LogEventEntry } from "@/lib/api/logs";

interface LogExportActionsProps {
  entries: LogEventEntry[];
}

export default function LogExportActions({ entries }: LogExportActionsProps) {
  const t = useTranslations("logTerminal");
  const [message, setMessage] = useState<string | null>(null);
  const text = () =>
    entries.map((entry) => JSON.stringify(entry.data)).join("\n");
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={!entries.length}
        onClick={() => {
          void navigator.clipboard
            .writeText(text())
            .then(() => setMessage(t("copied")))
            .catch(() => setMessage(t("copyFailed")));
        }}
      >
        {t("copy")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={!entries.length}
        onClick={() => {
          const url = URL.createObjectURL(
            new Blob([text()], { type: "text/plain;charset=utf-8" }),
          );
          const link = document.createElement("a");
          link.href = url;
          link.download = `logs-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
          link.click();
          URL.revokeObjectURL(url);
        }}
      >
        {t("download")}
      </Button>
      {message && (
        <span
          role="status"
          className="font-mono text-theme-xs text-gray-500 dark:text-terminal-muted"
        >
          {message}
        </span>
      )}
    </>
  );
}
