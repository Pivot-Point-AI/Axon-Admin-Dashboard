"use client";

import useRequiredFields from "@/hooks/useRequiredFields";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowRightIcon,
  EnvelopeIcon,
  LockIcon,
  EyeCloseIcon,
  EyeIcon,
} from "@/icons";
import { ApiError } from "@/lib/api/client";
import { FormEvent, useState } from "react";

export default function SignInForm() {
  const f = useTranslations("fixes");
  const t = useTranslations("redesign");
  const router = useRouter();
  const { login } = useAdminAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const required = useRequiredFields();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!required.validate([username, password])) return;
    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="axon-signin relative flex w-full flex-1 flex-col px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center">
        <div className="axon-login-card rounded-2xl border border-gray-200 bg-white p-7 shadow-theme-xl sm:p-10 dark:border-gray-700 dark:bg-gray-900">
          <Link href="/" className="mb-7 inline-block">
            <Image
              src="/images/logo/logo.png"
              alt="Axon"
              width={190}
              height={68}
              className="dark:hidden"
              priority
            />
            <Image
              src="/images/logo/logo-dark.png"
              alt="Axon"
              width={190}
              height={68}
              className="hidden dark:block"
              priority
            />
          </Link>
          <div className="mb-8 sm:mb-10">
            <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
              {f("loginTitle")}
              <br />
              <span className="text-brand-500 dark:text-brand-300">
                {f("loginBrand")}
              </span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("signinSubtitle")}
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="username">
                    Email or Username <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <EnvelopeIcon className="pointer-events-none absolute start-4 top-4 z-1 size-5 text-gray-500 dark:text-gray-400" />
                    <Input
                      className="h-14 ps-12"
                      id="username"
                      error={required.invalid(username)}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your email or username"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label htmlFor="password" className="mb-0">
                      Password <span className="text-error-500">*</span>{" "}
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-brand-500 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute start-4 top-4 z-1 size-5 text-gray-500 dark:text-gray-400" />
                    <Input
                      className="h-14 ps-12 pe-12"
                      id="password"
                      error={required.invalid(password)}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      aria-label={t(
                        showPassword ? "hidePassword" : "showPassword",
                      )}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-error-500">{error}</p>}
                <div>
                  <Button
                    className="h-12 w-full bg-brand-500 shadow-theme-sm dark:bg-brand-500"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in…" : "Sign in"}
                    <ArrowRightIcon className="size-5 rtl:rotate-180" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
