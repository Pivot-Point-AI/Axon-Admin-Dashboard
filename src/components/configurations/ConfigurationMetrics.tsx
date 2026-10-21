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
  const c = useTranslations("metricCards");
  const format = useFormatter();
  const numeric = configs.filter((item) =>
    ["number", "integer"].includes(configKind(item)),
  ).length;
  const boolean = configs.filter(
    (item) => configKind(item) === "boolean",
  ).length;
  const share = (count: number) =>
    c("ofTotal", {
      percent: format.number(configs.length ? count / configs.length : 0, {
        style: "percent",
        maximumFractionDigits: 1,
      }),
    });
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
      description: c("settingsHint"),
    },
    {
      label: t("numericSettings"),
      value: numeric,
      icon: <TableIcon />,
      tone: "brand",
      description: share(numeric),
    },
    {
      label: t("booleanSettings"),
      value: boolean,
      icon: <CheckCircleIcon />,
      tone: "success",
      description: share(boolean),
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
      description: c("recentChange"),
    });
  return <ManagementMetrics items={items} loading={loading} />;
}
