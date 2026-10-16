import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function AuthShowcase() {
  const t = await getTranslations("redesign");

  return (
    <div className="relative flex w-full items-center justify-center px-12 py-20 xl:px-16">
      <div className="relative w-full max-w-md text-center">
        <div className="relative mx-auto mb-12 flex size-40 items-center justify-center">
          <div aria-hidden="true" className="absolute inset-0 rounded-full border border-white/10 dark:border-white/10" />
          <div aria-hidden="true" className="absolute inset-4 rounded-full border border-white/10 bg-white/5 dark:border-white/10 dark:bg-white/5" />
          <Image
            src="/images/logo/logo-icon.png"
            width={88}
            height={88}
            alt="Axon"
            className="relative size-22 object-contain dark:opacity-100"
            preload
          />
        </div>
        <h2 className="text-3xl leading-snug font-medium tracking-tight text-white dark:text-white">
          {t("authPanelTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-brand-200 dark:text-brand-200">
          {t("authPanelSubtitle")}
        </p>
      </div>
    </div>
  );
}
