"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
  const c = useTranslations("metricCards");
  const format = useFormatter();
  const share = (count: number) =>
    format.number(institutions.length ? count / institutions.length : 0, {
      style: "percent",
      maximumFractionDigits: 1,
    });
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
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
          description: c("institutionsHint"),
        },
        {
          label: t("activeInstitutions"),
          value: active,
          icon: <CheckCircleIcon />,
          tone: "success",
          description: c("activeShare", { percent: share(active) }),
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
          description: c("ofTotal", { percent: share(expired) }),
        },
      ]}
    />
  );
}
