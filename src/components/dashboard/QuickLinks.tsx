import { getTranslations } from "next-intl/server";
import { ArrowRightIcon, GridIcon } from "@/icons";
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
    href: "/users",
    icon: <GroupIcon />,
  },
  {
    key: "configurations",
    href: "/configurations",
    icon: <ListIcon />,
  },
  {
    key: "masterData",
    href: "/master-data",
    icon: <BoxIconLine />,
  },
  {
    key: "messages",
    href: "/messages",
    icon: <MailIcon />,
  },
  {
    key: "flows",
    href: "/flows",
    icon: <BoltIcon />,
  },
  {
    key: "languages",
    href: "/languages",
    icon: <DocsIcon />,
  },
];

const tileTones: Record<string, string> = {
  users:
    "border-brand-100 from-brand-25 to-white dark:border-brand-500/20 dark:from-brand-500/5 dark:to-gray-900",
  configurations:
    "border-theme-purple-500/15 from-theme-purple-500/5 to-white dark:border-theme-purple-500/20 dark:from-theme-purple-500/10 dark:to-gray-900",
  masterData:
    "border-success-100 from-success-25 to-white dark:border-success-500/20 dark:from-success-500/5 dark:to-gray-900",
  messages:
    "border-theme-pink-500/15 from-theme-pink-500/5 to-white dark:border-theme-pink-500/20 dark:from-theme-pink-500/10 dark:to-gray-900",
  flows:
    "border-orange-100 from-orange-25 to-white dark:border-orange-500/20 dark:from-orange-500/5 dark:to-gray-900",
  languages:
    "border-blue-light-100 from-blue-light-25 to-white dark:border-blue-light-500/20 dark:from-blue-light-500/5 dark:to-gray-900",
};

export default async function QuickLinks() {
  const t = await getTranslations("redesign");
  const navigation = await getTranslations("sidebar.items");
  return (
    <section
      aria-label={t("manageTitle")}
      className="flex h-full min-w-0 flex-col rounded-xl border border-brand-100 bg-white p-4 shadow-theme-xs sm:p-5 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="mb-5 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300"
        >
          <GridIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-gray-950 dark:text-white/90">
            {t("manageTitle")}
          </h3>
          <p className="mt-1 text-theme-xs leading-5 text-gray-500 dark:text-gray-400">
            {t("manageSubtitle")}
          </p>
        </div>
      </div>
      <div className="grid flex-1 auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={`axon-shortcut group flex min-w-0 flex-col justify-between gap-3 rounded-xl border bg-linear-to-br p-4 transition-colors hover:border-brand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 dark:hover:border-brand-700 ${tileTones[link.key]}`}
          >
            <div className="flex w-full items-center gap-2.5">
              <span
                aria-hidden="true"
                className="order-last flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-300 [&>svg]:size-5"
              >
                {link.icon}
              </span>
              <span className="min-w-0 flex-1 text-sm leading-5 font-bold text-gray-900 transition-colors group-hover:text-brand-700 dark:text-gray-100 dark:group-hover:text-brand-300">
                {navigation(link.key)}
              </span>
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-theme-xs transition-colors group-hover:bg-brand-50 group-hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-brand-500/20 dark:group-hover:text-brand-300"
              >
                <ArrowRightIcon className="size-3.5 rtl:rotate-180" />
              </span>
            </div>
            <p className="w-full text-theme-xs leading-5 text-gray-500 dark:text-gray-400">
              {t(`shortcuts.${link.key}`)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
