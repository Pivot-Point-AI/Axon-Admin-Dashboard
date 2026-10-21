"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { Link, usePathname } from "@/i18n/navigation";
import {
  ChevronLeftIcon,
  HomeOutlineIcon,
  SearchOutlineIcon,
  MenuOutlineIcon,
} from "@/icons";

const pageKeys: Record<string, string> = {
  institutions: "institutions",
  users: "users",
  configurations: "configurations",
  "master-data": "masterData",
  messages: "messages",
  flows: "flows",
  languages: "languages",
  analytics: "analytics",
  faqs: "faqs",
  profile: "userProfile",
  logs: "logs",
  "chat-history": "chatHistory",
};

export default function AppHeader() {
  const t = useTranslations("header");
  const common = useTranslations("common");
  const navigation = useTranslations("sidebar.items");
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const pageKey =
    pageKeys[pathname.split("/").filter(Boolean)[0]] ?? "overview";
  const isSessionLog =
    pageKey === "logs" && pathname.split("/").filter(Boolean).length > 1;

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
    <header className="axon-header sticky top-0 z-99999 flex min-h-16 w-full items-center gap-3 border-b border-brand-100/70 bg-white/95 px-4 backdrop-blur-lg sm:px-6 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] dark:border-gray-800 dark:bg-gray-900/95">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label={t("toggleSidebar")}
          onClick={() =>
            window.innerWidth >= 1280 ? toggleSidebar() : toggleMobileSidebar()
          }
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 xl:hidden dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <MenuOutlineIcon className="size-5" />
        </button>
        <nav
          aria-label={common("breadcrumb")}
          className={pathname === "/" ? "sr-only" : "min-w-0 py-2"}
        >
          <ol className="flex min-w-0 items-center gap-2 text-sm">
            <li className="shrink-0">
              <Link
                href="/"
                aria-label={common("home")}
                className="flex items-center gap-1.5 rounded text-gray-500 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-400 dark:text-gray-400 dark:hover:text-brand-300"
              >
                <HomeOutlineIcon aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">{common("home")}</span>
              </Link>
            </li>
            <li aria-hidden="true" className="shrink-0">
              <ChevronLeftIcon className="size-4 rotate-180 text-gray-400 rtl:rotate-0 dark:text-gray-500" />
            </li>
            {isSessionLog && (
              <>
                <li className="hidden shrink-0 sm:block">
                  <Link
                    href="/logs"
                    className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-300"
                  >
                    {navigation("logs")}
                  </Link>
                </li>
                <li aria-hidden="true" className="hidden shrink-0 sm:block">
                  <ChevronLeftIcon className="size-4 rotate-180 text-gray-400 rtl:rotate-0 dark:text-gray-500" />
                </li>
              </>
            )}
            <li
              aria-current="page"
              className="min-w-0 truncate font-semibold text-brand-700 dark:text-brand-200"
              title={isSessionLog ? t("sessionLog") : navigation(pageKey)}
            >
              {isSessionLog ? t("sessionLog") : navigation(pageKey)}
            </li>
          </ol>
        </nav>
      </div>
      <div className="hidden w-full max-w-lg justify-self-center md:block">
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
            className="h-11 w-full rounded-xl border border-brand-100/70 bg-gray-50 ps-10 pe-16 text-theme-xs text-gray-700 placeholder:text-gray-500 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 focus:outline-none dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-400"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute end-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 text-gray-500 lg:flex dark:text-gray-400"
          >
            <kbd className="rounded bg-gray-100 px-1 py-0.5 text-theme-xs dark:bg-gray-700">
              Ctrl
            </kbd>
            <kbd className="rounded bg-gray-100 px-1 py-0.5 text-theme-xs dark:bg-gray-700">
              K
            </kbd>
          </span>
        </div>
      </div>
      <div className="ms-auto flex shrink-0 items-center gap-3 md:ms-0 md:justify-self-end">
        <ThemeToggleButton className="size-8 rounded-md border-transparent bg-transparent hover:bg-gray-100 dark:border-transparent dark:bg-transparent dark:hover:bg-gray-800" />
        <div className="border-s border-gray-200 ps-3 dark:border-gray-700">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
