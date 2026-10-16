import { getTranslations } from "next-intl/server";
import {
  BoxCubeIcon,
  ChatIcon,
  CheckCircleIcon,
  GridIcon,
  GroupIcon,
  ListIcon,
} from "@/icons";
import Image from "next/image";

export default async function AuthShowcase() {
  const t = await getTranslations("redesign");
  return (
    <div className="relative z-1 flex w-full flex-col px-12 pt-10 pb-16 xl:px-16">
      <p className="flex items-center justify-end gap-3 text-sm text-brand-100 dark:text-brand-100">
        <span className="size-2.5 rounded-full bg-success-400 dark:bg-success-400" />
        {t("secure")}
      </p>
      <div className="mt-20 max-w-xl">
        <h2 className="text-title-md leading-tight font-semibold text-white xl:text-title-lg dark:text-white">
          {t("heroTitle")}
          <br />
          {t("heroWith")}{" "}
          <span className="text-blue-light-400 dark:text-blue-light-400">
            Axon
          </span>
        </h2>
        <div className="mt-3 h-1.5 w-14 rounded-full bg-linear-to-r from-blue-light-400 to-brand-500 dark:from-blue-light-400 dark:to-brand-500" />
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-brand-200 dark:text-brand-200">
          {t("heroSubtitle")}
        </p>
      </div>
      <div
        className="axon-product-preview mt-16 flex min-h-80 gap-5 rounded-3xl border border-brand-400/40 bg-gray-950/80 p-5 shadow-theme-xl dark:border-brand-400/40 dark:bg-gray-950/80"
        aria-hidden="true"
      >
        <div className="flex w-12 shrink-0 flex-col items-center gap-7 border-e border-brand-300/10 pe-4 text-brand-200 dark:border-brand-300/10 dark:text-brand-200">
          <Image
            src="/images/logo/logo-icon.png"
            width={36}
            height={36}
            alt=""
          />
          {[GridIcon, BoxCubeIcon, GroupIcon, ChatIcon, ListIcon].map(
            (Icon, i) => (
              <Icon
                key={i}
                className={
                  i === 0
                    ? "size-6 text-blue-light-400 dark:text-blue-light-400"
                    : "size-5"
                }
              />
            ),
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between">
            <p className="font-semibold text-white dark:text-white">
              {t("overview")}
            </p>
            <div className="h-6 w-24 rounded-lg bg-white/5 dark:bg-white/5" />
          </div>
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[GroupIcon, BoxCubeIcon, ChatIcon].map((Icon, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-brand-900/25 p-3 dark:border-white/5 dark:bg-brand-900/25"
              >
                <Icon className="mb-3 size-6 text-blue-light-400 dark:text-blue-light-400" />
                <div className="h-2 w-3/4 rounded-full bg-brand-200/50 dark:bg-brand-200/50" />
                <div className="mt-2 h-1.5 w-1/2 rounded-full bg-brand-200/20 dark:bg-brand-200/20" />
              </div>
            ))}
          </div>
          <div className="flex h-36 items-end gap-3 rounded-xl border border-white/5 bg-brand-900/20 p-5 dark:border-white/5 dark:bg-brand-900/20">
            {[30, 45, 38, 65, 52, 75, 68, 90, 82, 100].map((height, i) => (
              <div
                key={i}
                style={{ height: `${height}%` }}
                className="flex-1 rounded-t-sm bg-linear-to-t from-brand-500/20 to-blue-light-400 dark:from-brand-500/20 dark:to-blue-light-400"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10 flex items-start gap-3 text-brand-100 dark:text-brand-100">
        <CheckCircleIcon className="mt-1 size-5 shrink-0 text-success-400 dark:text-success-400" />
        <div>
          <p className="font-medium">{t("centralized")}</p>
          <p className="mt-1 text-sm text-brand-300 dark:text-brand-300">
            {t("connected")}
          </p>
        </div>
      </div>
    </div>
  );
}
