import { getTranslations } from "next-intl/server";
import { ArrowRightIcon } from "@/icons";
import { Link } from "@/i18n/navigation";
import {
  BoltIcon,
  BoxIconLine,
  DocsIcon,
  GroupIcon,
  ListIcon,
  MailIcon,
} from "@/icons/index";

const links = [
  {
    key: "users",
    label: "Dashboard Users",
    description: "Create and manage admin accounts",
    href: "/users",
    icon: <GroupIcon />,
  },
  {
    key: "configurations",
    label: "Configurations",
    description: "System configuration values",
    href: "/configurations",
    icon: <ListIcon />,
  },
  {
    key: "masterData",
    label: "Master Data",
    description: "Banks, billers, and donations",
    href: "/master-data",
    icon: <BoxIconLine />,
  },
  {
    key: "messages",
    label: "Messages",
    description: "System message templates",
    href: "/messages",
    icon: <MailIcon />,
  },
  {
    key: "flows",
    label: "Flows",
    description: "Enable or disable conversation flows",
    href: "/flows",
    icon: <BoltIcon />,
  },
  {
    key: "languages",
    label: "Languages",
    description: "Supported languages & primary locale",
    href: "/languages",
    icon: <DocsIcon />,
  },
];

const iconTones: Record<string, string> = {
  users: "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-300",
  configurations:
    "bg-theme-purple-500/10 text-theme-purple-500 dark:bg-theme-purple-500/20 dark:text-theme-purple-500",
  masterData:
    "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400",
  messages:
    "bg-theme-pink-500/10 text-theme-pink-500 dark:bg-theme-pink-500/15 dark:text-theme-pink-500",
  flows:
    "bg-orange-50 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400",
  languages:
    "bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-300",
};

export default async function QuickLinks() {
  const t = await getTranslations("redesign");
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
        Manage
      </h3>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {t("manageSubtitle")}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className="axon-shortcut group flex min-w-0 items-center gap-3 rounded-xl border border-brand-100 bg-white p-4 transition-colors hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
          >
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl [&>svg]:size-6 ${iconTones[link.key]}`}
            >
              {link.icon}
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-theme-xs leading-5 font-semibold text-gray-900 dark:text-gray-100">
                {link.label}
              </span>
              <p className="mt-1 text-theme-xs leading-5 text-gray-500 dark:text-gray-400">
                {link.description}
              </p>
            </div>
            <ArrowRightIcon className="ms-auto size-4 shrink-0 text-gray-400 transition-colors group-hover:text-brand-500 rtl:rotate-180 dark:text-gray-500 dark:group-hover:text-brand-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
