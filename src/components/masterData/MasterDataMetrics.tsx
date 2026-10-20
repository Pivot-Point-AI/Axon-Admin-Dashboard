"use client";

import { useTranslations } from "next-intl";
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
  return (
    <ManagementMetrics
      loading={loading}
      items={[
        {
          label: t("totalRecords"),
          value: items.length,
          icon: <BoxCubeIcon />,
          tone: "brand",
        },
        {
          label: t("activeRecords"),
          value: items.filter((item) => asBoolean(item.is_active)).length,
          icon: <CheckCircleIcon />,
          tone: "success",
        },
        {
          label: t("inactiveRecords"),
          value: items.filter((item) => !asBoolean(item.is_active)).length,
          icon: <CloseIcon />,
          tone: "error",
        },
      ]}
    />
  );
}
