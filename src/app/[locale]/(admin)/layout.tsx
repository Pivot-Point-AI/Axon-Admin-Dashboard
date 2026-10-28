"use client";

import { useAdminAuth } from "@/context/AdminAuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { ChevronLeftIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen, toggleSidebar } = useSidebar();
  const t = useTranslations("header");
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  // Dynamic class for main content margin based on sidebar state
  const sidebarWide = isExpanded || isHovered;
  const mainContentMargin = isMobileOpen
    ? "ms-0"
    : sidebarWide
      ? "xl:ms-64"
      : "xl:ms-22.5";
  const toggleLabel = t(sidebarWide ? "hideSidebar" : "showSidebar");

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="axon-admin min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      <button
        type="button"
        aria-pressed={sidebarWide}
        aria-label={toggleLabel}
        onClick={toggleSidebar}
        className={cn(
          // A compact round handle on the sidebar edge, halfway down.
          "group fixed top-1/2 z-999 hidden size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-theme-sm transition-[inset-inline-start,background-color,color,border-color,box-shadow] duration-300 ease-in-out hover:border-brand-500 hover:bg-brand-500 hover:text-white hover:shadow-focus-ring focus-visible:border-brand-500 focus-visible:bg-brand-500 focus-visible:text-white focus-visible:shadow-focus-ring focus-visible:outline-none xl:flex rtl:translate-x-1/2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:bg-brand-500 dark:hover:text-white",
          sidebarWide ? "start-64" : "start-22.5",
        )}
      >
        <ChevronLeftIcon
          aria-hidden="true"
          className={cn(
            "size-4 transition-transform duration-300",
            sidebarWide ? "rtl:rotate-180" : "rotate-180 rtl:rotate-0",
          )}
        />
        <span
          role="tooltip"
          className="pointer-events-none absolute start-full top-1/2 ms-3 -translate-y-1/2 rounded-lg bg-gray-900 px-2.5 py-1.5 text-theme-xs font-medium whitespace-nowrap text-white opacity-0 shadow-tooltip transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-gray-700"
        >
          {toggleLabel}
        </span>
      </button>
      {/* Main Content Area */}
      <div
        className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <main className="axon-page mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6 lg:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
