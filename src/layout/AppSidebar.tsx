"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  BoltIcon,
  BoxCubeIcon,
  BoxIconLine,
  DocsIcon,
  GridIcon,
  GroupIcon,
  ListIcon,
  MailIcon,
  TableIcon,
  UserCircleIcon,
} from "@/icons";

const items = [
  { key: "dashboard", path: "/", icon: GridIcon },
  { key: "institutions", path: "/institutions", icon: BoxCubeIcon },
  { key: "logs", path: "/logs", icon: TableIcon },
  { key: "users", path: "/users", icon: GroupIcon },
  { key: "configurations", path: "/configurations", icon: ListIcon },
  { key: "masterData", path: "/master-data", icon: BoxIconLine },
  { key: "messages", path: "/messages", icon: MailIcon },
  { key: "flows", path: "/flows", icon: BoltIcon },
  { key: "languages", path: "/languages", icon: DocsIcon },
  { key: "userProfile", path: "/profile", icon: UserCircleIcon },
];
export default function AppSidebar() {
  const { isExpanded, isMobileOpen } = useSidebar();
  const pathname = usePathname();
  const t = useTranslations("sidebar");
  const showLabels = isExpanded || isMobileOpen;
  return (
    <aside
      className={`axon-sidebar fixed start-0 top-0 z-50 flex h-dvh flex-col overflow-hidden border-e px-3 transition-all duration-300 ease-in-out dark:border-brand-700 ${showLabels ? "w-64" : "w-22.5"} ${isMobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"} xl:translate-x-0 xl:rtl:translate-x-0`}
    >
      <Link
        href="/"
        className={`flex h-20 shrink-0 items-center ${showLabels ? "justify-start ps-2" : "justify-center"}`}
      >
        <Image
          src="/images/logo/logo-icon.png"
          alt="Axon"
          width={40}
          height={40}
          className="h-auto w-10 shrink-0 object-contain dark:opacity-100"
          preload
        />
      </Link>
      <nav className="no-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-6">
        {showLabels && (
          <p className="mb-2 px-3 text-theme-xs font-medium tracking-wide text-brand-300 dark:text-brand-300">
            {t("groups.overview")}
          </p>
        )}
        <ul className="flex flex-col gap-1">
          {items.map(({ key, path, icon: Icon }) => {
            const active =
              path === "/"
                ? pathname === "/"
                : pathname === path || pathname.startsWith(`${path}/`);
            return (
              <li
                key={key}
                className={
                  key === "users" || key === "userProfile"
                    ? "mt-4 border-t border-white/15 pt-4 dark:border-white/15"
                    : undefined
                }
              >
                {showLabels && key === "users" && (
                  <p className="mb-3 px-3 text-theme-xs font-medium tracking-wide text-brand-300 dark:text-brand-300">
                    {t("groups.administration")}
                  </p>
                )}
                <Link
                  href={path}
                  aria-current={active ? "page" : undefined}
                  title={t(`items.${key}`)}
                  className={`menu-item ${active ? "menu-item-active" : "menu-item-inactive"} ${showLabels ? "justify-start" : "justify-center"}`}
                >
                  <Icon
                    className={`size-6 shrink-0 ${active ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}
                  />
                  {showLabels && <span>{t(`items.${key}`)}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
