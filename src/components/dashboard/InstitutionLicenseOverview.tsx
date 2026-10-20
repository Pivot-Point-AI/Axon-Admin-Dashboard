"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getAllInstitutions } from "@/lib/api/institutions";
import { ApiError } from "@/lib/api/client";
import type { InstitutionItem } from "@/lib/api/types";
import LicenseOverview from "./LicenseOverview";

function classifyInstitutions(institutions: InstitutionItem[]) {
  const now = Date.now();
  const soonThreshold = 30 * 24 * 60 * 60 * 1000;
  let active = 0;
  let expiringSoon = 0;
  let expired = 0;
  let inactive = 0;

  for (const inst of institutions) {
    if (inst.is_active === false) {
      inactive += 1;
      continue;
    }
    if (!inst.license_expires_at) {
      active += 1;
      continue;
    }
    const expiry = new Date(inst.license_expires_at).getTime();
    if (Number.isNaN(expiry) || expiry >= now) {
      active += 1;
      if (!Number.isNaN(expiry) && expiry - now <= soonThreshold) {
        expiringSoon += 1;
      }
    } else {
      expired += 1;
    }
  }

  return { active, expiringSoon, expired, inactive };
}

export default function InstitutionLicenseOverview() {
  const { accessToken } = useAdminAuth();
  const t = useTranslations("dashboardAnalytics");
  const [stats, setStats] = useState<ReturnType<
    typeof classifyInstitutions
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    getAllInstitutions(accessToken)
      .then((data) => {
        if (!cancelled) {
          setStats(classifyInstitutions(data));
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : t("loadFailed"));
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, t]);

  if (error)
    return (
      <p role="alert" className="text-sm text-error-600 dark:text-error-400">
        {error}
      </p>
    );
  return (
    <LicenseOverview
      active={stats?.active ?? 0}
      expiringSoon={stats?.expiringSoon ?? 0}
      expired={stats?.expired ?? 0}
      inactive={stats?.inactive ?? 0}
      loading={!stats}
    />
  );
}
