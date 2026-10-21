"use client";

import { useFormatter, useTranslations } from "next-intl";
import ManagementMetrics from "@/components/common/ManagementMetrics";
import { BoxCubeIcon, CheckCircleIcon, CloseIcon } from "@/icons";
import { asBoolean } from "@/utils/boolean";

interface MasterDataMetricsProps {
  items: Record<string, unknown>[];
  loading: boolean;
}

export default function MasterDataMetrics({
  items,
  loading,
}: MasterDataMetricsProps) {
  const t = useTranslations("designSystem");
  const c = useTranslations("metricCards");
  const format = useFormatter();
  const active = items.filter((item) => asBoolean(item.is_active)).length;
  const share = (count: number) =>
    format.number(items.length ? count / items.length : 0, {
      style: "percent",
      maximumFractionDigits: 1,
    });
  return (
    <ManagementMetrics
      loading={loading}
      items={[
        {
          label: t("totalRecords"),
          value: items.length,
          icon: <BoxCubeIcon />,
          tone: "brand",
          description: c("recordsHint"),
        },
        {
          label: t("activeRecords"),
          value: active,
          icon: <CheckCircleIcon />,
          tone: "success",
          description: c("ofTotal", { percent: share(active) }),
        },
        {
          label: t("inactiveRecords"),
          value: items.length - active,
          icon: <CloseIcon />,
          tone: "error",
          description: c("ofTotal", { percent: share(items.length - active) }),
        },
      ]}
    />
  );
}
