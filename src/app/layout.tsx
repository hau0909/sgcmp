import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { CustomerChatWidget } from "@/features/chat/components/CustomerChatWidget";
import { Suspense } from "react";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${robotoSans.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Đang tải...</div>}>
          {children}
        </Suspense>
        <Suspense fallback={null}>
          <CustomerChatWidget />
        </Suspense>
      </body>
    </html>
  );
}
