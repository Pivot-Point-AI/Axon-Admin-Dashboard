
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import AuthShowcase from "@/components/auth/AuthShowcase";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 bg-white dark:bg-gray-900">
      <div className="relative flex min-h-screen w-full flex-col justify-center lg:flex-row-reverse dark:bg-gray-900">
        {children}
        <aside className="axon-auth-panel relative hidden w-1/2 overflow-hidden bg-brand-950 text-white lg:flex dark:bg-brand-950">

          <AuthShowcase />
        </aside>
        <div className="fixed end-6 bottom-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}

