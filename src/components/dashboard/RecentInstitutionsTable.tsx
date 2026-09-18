"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import Badge from "@/components/ui/badge/Badge";
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
            err instanceof ApiError ? err.message : "Failed to load institutions.",
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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Institutions
        </h3>
        <Link className="text-sm text-brand-500 hover:underline" href="/institutions">
          Manage all
        </Link>
      </div>

      {error && <p className="text-sm text-error-500">{error}</p>}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Institution
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                License Expiry
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  Loading…
                </TableCell>
              </TableRow>
            ) : institutions.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  No institutions yet.
                </TableCell>
              </TableRow>
            ) : (
              institutions.map((institution) => {
                const status = licenseStatus(institution.license_expires_at);
                return (
                  <TableRow key={institution.institution_id}>
                    <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                      {institution.institution_name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {institution.license_expires_at
                        ? new Date(
                            institution.license_expires_at,
                          ).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      <Badge size="sm" color={status.color}>
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
