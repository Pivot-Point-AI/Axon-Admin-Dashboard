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
      className={`axon-sidebar fixed start-0 top-0 z-50 flex h-dvh flex-col overflow-hidden border-e px-5 transition-all duration-300 ease-in-out dark:border-brand-700 ${showLabels ? "w-72.5" : "w-22.5"} ${isMobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"} xl:translate-x-0 xl:rtl:translate-x-0`}
    >
      <Link
        href="/"
        className={`flex h-24 shrink-0 items-center ${showLabels ? "justify-start" : "justify-center"}`}
      >
        <Image
          src={
            showLabels
              ? "/images/logo/logo-dark.png"
              : "/images/logo/logo-icon.png"
          }
          alt="Axon"
          width={showLabels ? 140 : 32}
          height={showLabels ? 50 : 32}
          priority
        />
      </Link>
      <nav className="no-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-6">
        <ul className="flex flex-col gap-1">
          {items.map(({ key, path, icon: Icon }) => {
            const active =
              path === "/"
                ? pathname === "/"
                : pathname === path || pathname.startsWith(`${path}/`);
            return (
              <li key={key}>
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
