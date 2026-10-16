"use client";

import { useAdminAuth } from "@/context/AdminAuthContext";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function UserMetaCard() {
  const { username, role } = useAdminAuth();
  const t = useTranslations("profile");
  const displayName = username || t("signedInUser");
  const normalizedRole = role
    ?.trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  const roleLabel =
    normalizedRole === "SUPER_ADMIN" || normalizedRole === "SUPERADMIN"
      ? t("roles.superAdmin")
      : normalizedRole === "MANAGER"
        ? t("roles.manager")
        : normalizedRole === "VIEWER"
          ? t("roles.viewer")
          : role || t("roleUnavailable");
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center lg:gap-6">
        <div className="overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
          <Image
            src="/images/user/owner.png"
            width={80}
            height={80}
            className="size-20"
            alt={displayName}
          />
        </div>
        <div className="text-start">
          <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
            {displayName}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {roleLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
