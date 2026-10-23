"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import Badge from "@/components/ui/badge/Badge";
import StatusBadge from "@/components/common/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ApiError } from "@/lib/api/client";
import { getAllInstitutions } from "@/lib/api/institutions";
import type { InstitutionItem } from "@/lib/api/types";
import { BoxCubeIcon } from "@/icons";

function licenseStatus(iso: string | null): {
  label: string;
  color: "success" | "warning" | "error" | "light";
} {
  if (!iso) return { label: "No Expiry", color: "light" };
  const expiry = new Date(iso).getTime();
  if (Number.isNaN(expiry)) return { label: "Unknown", color: "light" };
  const daysLeft = (expiry - Date.now()) / (24 * 60 * 60 * 1000);
  if (daysLeft < 0) return { label: "Expired", color: "error" };
  if (daysLeft <= 30) return { label: "Expiring Soon", color: "warning" };
  return { label: "Active", color: "success" };
}

export default function RecentInstitutionsTable() {
  const t = useTranslations("redesign");
  const { accessToken } = useAdminAuth();
  const [institutions, setInstitutions] = useState<InstitutionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    getAllInstitutions(accessToken, 5)
      .then((data) => {
        if (!cancelled) setInstitutions(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Failed to load institutions.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return (
    <section
      aria-label={t("institutionsTitle")}
      className="axon-dashboard-institutions flex h-full min-w-0 flex-col rounded-xl border border-brand-100 bg-white p-4 shadow-theme-xs sm:p-5 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300"
          >
            <BoxCubeIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-950 dark:text-white/90">
              {t("institutionsTitle")}
            </h3>
            <p className="mt-1 text-theme-xs leading-5 text-gray-500 dark:text-gray-400">
              {t("institutionsSubtitle")}
            </p>
          </div>
        </div>
        <Link
          className="inline-flex min-h-9 shrink-0 items-center rounded-lg border border-brand-100 bg-brand-25 px-3 py-2 text-theme-xs font-medium text-brand-600 hover:border-brand-200 hover:bg-brand-50 dark:border-brand-700 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
          href="/institutions"
        >
          {t("manageAll")}
        </Link>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-3 text-sm text-error-600 dark:text-error-400"
        >
          {error}
        </p>
      )}

      <div
        role="region"
        aria-label={t("institutionsTitle")}
        tabIndex={0}
        className={`custom-scrollbar min-w-0 overflow-x-auto rounded-xl border border-gray-100 focus-visible:outline-2 focus-visible:outline-brand-400 dark:border-gray-800 ${institutions.length ? "flex-1" : ""}`}
      >
        <Table className={institutions.length ? "h-full" : undefined}>
          <TableHeader className="h-11 border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
            <TableRow>
              <TableCell
                isHeader
                className="w-12 px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {t("rowNumber")}
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Institution
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                License Expiry
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400"
                >
                  Loading…
                </TableCell>
              </TableRow>
            ) : institutions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400"
                >
                  No institutions yet.
                </TableCell>
              </TableRow>
            ) : (
              institutions.map((institution, index) => {
                const status = licenseStatus(institution.license_expires_at);
                return (
                  <TableRow key={institution.institution_id}>
                    <TableCell className="px-4 py-3 text-theme-xs text-gray-500 tabular-nums dark:text-gray-400">
                      {index + 1}
                    </TableCell>
                    <TableCell className="max-w-48 px-4 py-3 text-sm font-medium break-words text-gray-800 dark:text-white/90">
                      {institution.institution_name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-xs whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {institution.license_expires_at
                        ? new Date(
                            institution.license_expires_at,
                          ).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      {institution.is_active === false ? (
                        <StatusBadge active={false} />
                      ) : status.color === "success" ? (
                        <StatusBadge active />
                      ) : (
                        <Badge variant="text" size="sm" color={status.color}>
                          {status.label}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
