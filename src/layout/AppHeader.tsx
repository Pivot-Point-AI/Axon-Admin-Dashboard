"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { Link, usePathname } from "@/i18n/navigation";
import { HomeOutlineIcon, SearchOutlineIcon, MenuOutlineIcon } from "@/icons";

const pageKeys: Record<string, string> = {
  institutions: "institutions",
  users: "users",
  configurations: "configurations",
  "master-data": "masterData",
  messages: "messages",
  flows: "flows",
  languages: "languages",
  profile: "userProfile",
  logs: "logs",
  "chat-history": "chatHistory",
};

export default function AppHeader() {
  const t = useTranslations("header");
  const navigation = useTranslations("sidebar.items");
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const pageKey =
    pageKeys[pathname.split("/").filter(Boolean)[0]] ?? "overview";

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <header className="axon-header axon-header-reference sticky top-0 z-99999 flex min-h-16 w-full items-center gap-4 border-b border-gray-200 bg-white px-4 sm:px-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          aria-label={t("toggleSidebar")}
          onClick={() =>
            window.innerWidth >= 1280 ? toggleSidebar() : toggleMobileSidebar()
          }
          className="flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 xl:hidden dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <MenuOutlineIcon className="size-5" />
        </button>
        <Link
          href={pathname}
          className="flex items-center gap-3 text-sm font-medium text-brand-700 dark:text-gray-200"
        >
          <HomeOutlineIcon className="size-5 shrink-0 text-brand-500 dark:text-gray-300" />
          <span className="hidden sm:inline">{navigation(pageKey)}</span>
        </Link>
      </div>
      <div className="mx-auto hidden w-full max-w-lg px-4 md:block">
        <div className="relative">
          <SearchOutlineIcon
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          />
          <input
            ref={inputRef}
            type="search"
            aria-label={t("searchPlaceholder")}
            placeholder={t("searchPlaceholder")}
            className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 ps-10 pe-3 text-sm text-gray-700 placeholder:text-gray-500 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-400"
          />
        </div>
      </div>
      <div className="ms-auto flex shrink-0 items-center gap-3">
        <ThemeToggleButton className="size-8 rounded-md border-transparent bg-transparent hover:bg-gray-100 dark:border-transparent dark:bg-transparent dark:hover:bg-gray-800" />
        <div className="border-s border-gray-200 ps-3 dark:border-gray-700">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
