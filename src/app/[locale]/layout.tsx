import { FeedbackProvider } from "@/context/FeedbackContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { isRtl } from "@/i18n/languages";
import { type Locale, routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "simplebar-react/dist/simplebar.min.css";
import "swiper/css/bundle";
import "../globals.css";

const dashboardFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dashboard",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      dir={isRtl(locale as Locale) ? "rtl" : "ltr"}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var m=localStorage.getItem('theme-mode')||localStorage.getItem('theme');var d=m==='dark'||m==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}",
          }}
        />
      </head>
      <body
        className={`${dashboardFont.className} ${dashboardFont.variable} dark:bg-gray-900`}
      >
        <NextIntlClientProvider>
          <AdminAuthProvider>
            <ThemeProvider>
              <FeedbackProvider>
                <SidebarProvider>{children}</SidebarProvider>
              </FeedbackProvider>
            </ThemeProvider>
          </AdminAuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
