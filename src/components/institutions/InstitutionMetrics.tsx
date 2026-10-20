"use client";

import { useTranslations } from "next-intl";
import ManagementMetrics from "@/components/common/ManagementMetrics";
import { BoxCubeIcon, CheckCircleIcon, CloseIcon, TimeIcon } from "@/icons";
import type { InstitutionItem } from "@/lib/api/types";

interface InstitutionMetricsProps {
  institutions: InstitutionItem[];
  loading: boolean;
}

export default function InstitutionMetrics({
  institutions,
  loading,
}: InstitutionMetricsProps) {
  const t = useTranslations("designSystem");
  const now = Date.now();
  const soon = 30 * 24 * 60 * 60 * 1000;
  const active = institutions.filter((item) => item.is_active !== false).length;
  const expiring = institutions.filter((item) => {
    if (!item.license_expires_at || item.is_active === false) return false;
    const expires = new Date(item.license_expires_at).getTime();
    return expires >= now && expires - now <= soon;
  }).length;
  const expired = institutions.filter(
    (item) =>
      item.license_expires_at &&
      new Date(item.license_expires_at).getTime() < now,
  ).length;
  return (
    <ManagementMetrics
      loading={loading}
      items={[
        {
          label: t("totalInstitutions"),
          value: institutions.length,
          icon: <BoxCubeIcon />,
          tone: "brand",
        },
        {
          label: t("activeInstitutions"),
          value: active,
          icon: <CheckCircleIcon />,
          tone: "success",
        },
        {
          label: t("expiringSoon"),
          value: expiring,
          icon: <TimeIcon />,
          tone: "warning",
          description: t("within30Days"),
        },
        {
          label: t("expiredLicenses"),
          value: expired,
          icon: <CloseIcon />,
          tone: "error",
        },
      ]}
    />
  );
}
