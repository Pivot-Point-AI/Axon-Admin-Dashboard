"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { BoxCubeIcon, ChatIcon, GroupIcon, TableIcon } from "@/icons/index";
import { ApiError } from "@/lib/api/client";
import { getAllInstitutions } from "@/lib/api/institutions";
import { listLogSessions } from "@/lib/api/logs";
import type { InstitutionItem } from "@/lib/api/types";

interface Stats {
  total: number;
  active: number;
  expiringSoon: number;
  expired: number;
  logSessions: number | null;
}

function countLogSessions(payload: Record<string, unknown>): number | null {
  const candidate =
    (Array.isArray(payload.sessions) && payload.sessions) ||
    (Array.isArray(payload.session_ids) && payload.session_ids) ||
    (Array.isArray(payload.items) && payload.items) ||
    (Array.isArray(payload.data) && payload.data) ||
    null;
  if (candidate) return candidate.length;
  return Object.keys(payload).length || null;
}

function classifyInstitutions(institutions: InstitutionItem[]) {
  const now = Date.now();
  const soonThreshold = 30 * 24 * 60 * 60 * 1000;
  let active = 0;
  let expiringSoon = 0;
  let expired = 0;

  for (const inst of institutions) {
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

  return { active, expiringSoon, expired };
}

export default function DashboardStats() {
  const { accessToken } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    async function load() {
      try {
        const institutions = await getAllInstitutions(accessToken!);
        const { active, expiringSoon, expired } =
          classifyInstitutions(institutions);

        let logSessions: number | null = null;
        try {
          const logsPayload = await listLogSessions(accessToken!);
          logSessions = countLogSessions(logsPayload);
        } catch {
          logSessions = null;
        }

        if (!cancelled) {
          setStats({
            total: institutions.length,
            active,
            expiringSoon,
            expired,
            logSessions,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load dashboard stats.",
          );
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  if (error) {
    return (
      <div className="rounded-2xl border border-error-500 bg-error-50 p-4 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
        {error}
      </div>
    );
  }

  const cards = [
    {
      key: "total",
      label: "Institutions",
      value: stats?.total,
      icon: <BoxCubeIcon />,
    },
    {
      key: "active",
      label: "Active Licenses",
      value: stats?.active,
      icon: <GroupIcon />,
    },
    {
      key: "expiringSoon",
      label: "Expiring ≤30 Days",
      value: stats?.expiringSoon,
      icon: <TableIcon />,
      warn: (stats?.expiringSoon ?? 0) > 0,
    },
    {
      key: "expired",
      label: "Expired Licenses",
      value: stats?.expired,
      icon: <TableIcon />,
      danger: (stats?.expired ?? 0) > 0,
    },
    {
      key: "logSessions",
      label: "Log Sessions",
      value: stats?.logSessions,
      icon: <ChatIcon />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
            {card.icon}
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {card.label}
            </span>
            <h4
              className={`mt-1 text-title-sm font-bold ${
                card.danger
                  ? "text-error-500"
                  : card.warn
                    ? "text-warning-500"
                    : "text-gray-800 dark:text-white/90"
              }`}
            >
              {card.value ?? "—"}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}
