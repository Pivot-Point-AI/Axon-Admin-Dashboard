import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function AuthShowcase() {
  const t = await getTranslations("redesign");

  return (
    <div className="relative flex w-full items-center justify-center px-12 py-32 xl:px-20">
      <div className="absolute start-12 top-8 xl:start-16">
        <Image
          src="/images/logo/auth-logo.png"
          width={204}
          height={72}
          alt="Axon"
          className="h-auto w-44 object-contain dark:opacity-100"
          preload
        />
      </div>
      <div className="relative w-full max-w-xl text-start">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-400/15 px-3 py-1 text-theme-xs font-medium tracking-wide text-brand-300 dark:bg-brand-400/15 dark:text-brand-300">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-brand-400 dark:bg-brand-400"
          />
          {t("enterpriseWorkspace")}
        </p>
        <h2 className="max-w-lg text-title-md leading-tight font-semibold tracking-tight text-white xl:text-title-lg dark:text-white">
          {t("authPanelTitle")}
        </h2>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-brand-200 dark:text-brand-200">
          {t("authPanelSubtitle")}
        </p>
      </div>
    </div>
  );
}
