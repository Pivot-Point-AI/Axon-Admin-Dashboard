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

export default function QuickLinks() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
        Manage
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className="group flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-gray-800 dark:hover:border-brand-800 dark:hover:bg-brand-500/10"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700 group-hover:bg-brand-100 group-hover:text-brand-600 dark:bg-gray-800 dark:text-gray-300 dark:group-hover:bg-brand-500/15 dark:group-hover:text-brand-400">
              {link.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                {link.label}
              </div>
              <div className="text-theme-xs text-gray-500 dark:text-gray-400">
                {link.description}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
