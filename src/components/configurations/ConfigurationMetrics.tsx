"use client";

import { useFormatter, useTranslations } from "next-intl";
import ManagementMetrics, {
  type ManagementMetric,
} from "@/components/common/ManagementMetrics";
import { CheckCircleIcon, ListIcon, TableIcon, TimeIcon } from "@/icons";
import type { ConfigResponse } from "@/lib/api/types";
import { configKind } from "./configurationFields";

interface ConfigurationMetricsProps {
  configs: ConfigResponse[];
  loading: boolean;
}

export default function ConfigurationMetrics({
  configs,
  loading,
}: ConfigurationMetricsProps) {
  const t = useTranslations("designSystem");
  const format = useFormatter();
  const dates = configs.flatMap((item) => {
    const date = item.updated_at ? new Date(item.updated_at).getTime() : NaN;
    return Number.isFinite(date) ? [date] : [];
  });
  const items: ManagementMetric[] = [
    {
      label: t("totalSettings"),
      value: configs.length,
      icon: <ListIcon />,
      tone: "purple",
    },
    {
      label: t("numericSettings"),
      value: configs.filter((item) =>
        ["number", "integer"].includes(configKind(item)),
      ).length,
      icon: <TableIcon />,
      tone: "brand",
    },
    {
      label: t("booleanSettings"),
      value: configs.filter((item) => configKind(item) === "boolean").length,
      icon: <CheckCircleIcon />,
      tone: "success",
    },
  ];
  if (dates.length)
    items.push({
      label: t("lastUpdated"),
      value: format.dateTime(new Date(Math.max(...dates)), {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      icon: <TimeIcon />,
      tone: "warning",
    });
  return <ManagementMetrics items={items} loading={loading} />;
}
