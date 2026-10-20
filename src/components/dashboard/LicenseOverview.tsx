"use client";

import { useFormatter, useTranslations } from "next-intl";
import { CheckCircleIcon, CloseLineIcon, TimeIcon } from "@/icons";

interface LicenseOverviewProps {
  active: number;
  expiringSoon: number;
  expired: number;
  inactive?: number;
  loading: boolean;
}

export default function LicenseOverview({
  active,
  expiringSoon,
  expired,
  inactive = 0,
  loading,
}: LicenseOverviewProps) {
  const t = useTranslations("redesign");
  const status = useTranslations("status");
  const format = useFormatter();
  // Expiring licenses are included in the existing active metric.
  const healthy = Math.max(0, active - expiringSoon);
  const total = active + expired + inactive;
  const rows = [
    {
      label: t("active"),
      value: healthy,
      color: "bg-success-500 dark:bg-success-400",
      icon: CheckCircleIcon,
    },
    {
      label: t("expiring"),
      value: expiringSoon,
      color: "bg-warning-500 dark:bg-warning-400",
      icon: TimeIcon,
    },
    {
      label: t("expired"),
      value: expired,
      color: "bg-error-500 dark:bg-error-400",
      icon: CloseLineIcon,
    },
    {
      label: status("inactive"),
      value: inactive,
      color: "bg-gray-400 dark:bg-gray-500",
      icon: null,
    },
  ];
  const activeAngle = total ? (healthy / total) * 360 : 0;
  const expiringAngle = total ? ((healthy + expiringSoon) / total) * 360 : 0;
  const expiredAngle = total
    ? ((healthy + expiringSoon + expired) / total) * 360
    : 0;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-brand-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-base font-semibold text-gray-950 dark:text-white/90">
          {t("licenseOverview")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("licenseSubtitle")}
        </p>
        <div className="mt-6 space-y-4">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-white dark:text-white ${row.color}`}
                >
                  {Icon ? (
                    <Icon className="size-5" />
                  ) : (
                    <span className="text-xl">−</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="mb-2 text-theme-xs text-gray-700 dark:text-gray-300">
                    {row.label}
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{
                        width: `${total ? (row.value / total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="w-6 shrink-0 text-end text-theme-xs font-semibold text-gray-950 tabular-nums dark:text-gray-100">
                  {loading ? "\u2014" : format.number(row.value)}
                </span>
                <span className="w-10 shrink-0 text-end text-theme-xs text-gray-500 tabular-nums dark:text-gray-400">
                  {loading
                    ? "\u2014"
                    : format.number(total ? row.value / total : 0, {
                        style: "percent",
                        maximumFractionDigits: 0,
                      })}
                </span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="rounded-xl border border-brand-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-base font-semibold text-gray-950 dark:text-white/90">
          {t("distribution")}
        </h3>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
          <div
            className="relative size-48 shrink-0 rounded-full bg-gray-100 2xl:size-52 dark:bg-gray-800"
            style={
              total
                ? {
                    background: `conic-gradient(var(--color-success-500) 0deg ${activeAngle}deg, var(--color-warning-500) ${activeAngle}deg ${expiringAngle}deg, var(--color-error-500) ${expiringAngle}deg ${expiredAngle}deg, var(--color-gray-400) ${expiredAngle}deg 360deg)`,
                  }
                : undefined
            }
          >
            <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-white dark:bg-gray-900">
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
