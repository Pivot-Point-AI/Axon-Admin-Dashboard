"use client";

import { useAdminAuth } from "@/context/AdminAuthContext";
import { useRouter } from "@/i18n/navigation";
import { ChevronDownIcon } from "@/icons";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

export default function UserDropdown() {
  const t = useTranslations("userDropdown");
  const router = useRouter();
  const { logout, username, role } = useAdminAuth();
  const displayName = username || role || "Admin";
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center rounded-xl px-2 py-1 text-gray-800 transition-colors hover:bg-brand-50 dark:text-gray-200 dark:hover:bg-brand-500/10"
      >
        <span className="me-2 size-8 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200 dark:ring-gray-700">
          <Image
            width={32}
            height={32}
            src="/images/user/owner.png"
            alt="User"
          />
        </span>

        <span className="me-1 block text-theme-sm font-medium">
          {displayName}
        </span>

        <ChevronDownIcon
          className={`size-4 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute end-0 mt-4.25 flex w-65 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="border-b border-gray-200 px-2 pb-3 dark:border-gray-800">
          <span className="block text-theme-sm font-medium text-gray-700 dark:text-gray-400">
            {displayName}
          </span>
          {role && (
            <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
              {role}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            closeDropdown();
            logout();
            router.push("/signin");
          }}
          className="group mt-3 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-theme-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          {t("signOut")}
        </button>
      </Dropdown>
    </div>
  );
}
