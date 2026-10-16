"use client";

import { useTranslations } from "next-intl";

interface LicenseOverviewProps {
  active: number;
  expiringSoon: number;
  expired: number;
  loading: boolean;
}

export default function LicenseOverview({
  active,
  expiringSoon,
  expired,
  loading,
}: LicenseOverviewProps) {
  const t = useTranslations("redesign");
  // Expiring licenses are included in the existing active metric.
  const healthy = Math.max(0, active - expiringSoon);
  const total = active + expired;
  const rows = [
    {
      label: t("active"),
      value: healthy,
      color: "bg-brand-500 dark:bg-brand-400",
    },
    {
      label: t("expiring"),
      value: expiringSoon,
      color: "bg-warning-500 dark:bg-warning-400",
    },
    {
      label: t("expired"),
      value: expired,
      color: "bg-error-500 dark:bg-error-400",
    },
  ];
  const activeAngle = total ? (healthy / total) * 360 : 0;
  const expiringAngle = total ? ((healthy + expiringSoon) / total) * 360 : 0;
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs lg:col-span-3 dark:border-gray-800 dark:bg-white/3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
          {t("licenseOverview")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("licenseSubtitle")}
        </p>
        <div className="mt-7 space-y-5">
          {rows.map((row) => (
            <div key={row.label}>
              <div className="mb-2 flex justify-between gap-3 text-sm text-gray-600 dark:text-gray-300">
                <span>{row.label}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {loading ? "\u2014" : row.value}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className={`h-full rounded-full ${row.color}`}
                  style={{ width: `${total ? (row.value / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs lg:col-span-2 dark:border-gray-800 dark:bg-white/3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
          {t("distribution")}
        </h3>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-7">
          <div
            className="relative size-40 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800"
            style={
              total
                ? {
                    background: `conic-gradient(var(--color-brand-500) 0deg ${activeAngle}deg, var(--color-warning-500) ${activeAngle}deg ${expiringAngle}deg, var(--color-error-500) ${expiringAngle}deg 360deg)`,
                  }
                : undefined
            }
          >
            <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white dark:bg-gray-900">
              <span className="text-title-sm font-semibold text-gray-900 dark:text-white">
                {loading ? "\u2014" : total}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t("total")}
              </span>
            </div>
          </div>
          <div className="min-w-40 flex-1 space-y-5">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-2 text-theme-xs text-gray-600 dark:text-gray-300"
              >
                <span
                  className={`size-2.5 shrink-0 rounded-full ${row.color}`}
                />
                <span className="flex-1">{row.label}</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {loading ? "\u2014" : row.value}
                </span>
                <span className="w-9 text-end">
                  {loading
                    ? "\u2014"
                    : `${total ? Math.round((row.value / total) * 100) : 0}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
