import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { CustomerChatWidget } from "@/features/chat/components/CustomerChatWidget";
import { Suspense } from "react";
import AuthRedirect from "@/components/auth/authRedirect";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { getLocaleServer } from "@/utils/locale";

const robotoSans = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SGCMP",
  description: "Security Guard Connection & Management Platform",
  icons: {
    icon: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocaleServer();

  return (
    <html
      lang={locale}
      className={`${robotoSans.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider initialLocale={locale}>
          <Suspense fallback={null}>
            <AuthRedirect />
          </Suspense>
          <Suspense
            fallback={
              <div className="flex h-screen items-center justify-center">
                Đang tải...
              </div>
            }
          >
            {children}
          </Suspense>
          <Suspense fallback={null}>
            <CustomerChatWidget />
          </Suspense>
          <Suspense fallback={null}>
            <LanguageSwitcher variant="floating" />
          </Suspense>
        </LanguageProvider>
      </body>
    </html>
  );
}
