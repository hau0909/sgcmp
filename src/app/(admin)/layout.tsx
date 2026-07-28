"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Users,
  Menu,
  X,
  Globe,
  Landmark,
  BadgeDollarSign,
  Layers,
  Package,
  LogOut,
} from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { useAuthStore } from "@/store/auth.store";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { dict } = useTranslation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } finally {
      clearAuth();
      setMobileSidebarOpen(false);
      router.replace("/login");
      router.refresh();
    }
  };

  const sidebarLinks = [
    {
      name: dict.layout_admin.dashboard,
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      name: dict.layout_admin.approvals,
      href: "/registrations",
      icon: Building2,
      active:
        pathname === "/registrations" || pathname.startsWith("/registrations/"),
    },
    {
      name: dict.layout_admin.publish_requests,
      href: "/publish-requests",
      icon: Globe,
      active:
        pathname === "/publish-requests" ||
        pathname.startsWith("/publish-requests/"),
    },

    {
      name: dict.layout_admin.payment_history,
      href: "/payment-history",
      icon: BadgeDollarSign,
      active:
        pathname === "/payment-history" ||
        pathname.startsWith("/payment-history/"),
    },
    {
      name: dict.layout_admin.services,
      href: "/services",
      icon: Layers,
      active: pathname === "/services" || pathname.startsWith("/services/"),
    },

    {
      name: dict.layout_admin.bank_accounts,
      href: "/bank-accounts",
      icon: Landmark,
      active:
        pathname === "/bank-accounts" || pathname.startsWith("/bank-accounts/"),
    },
    {
      name: dict.layout_admin.accounts,
      href: "/accounts",
      icon: Users,
      active: pathname === "/accounts" || pathname.startsWith("/accounts/"),
    },
    {
      name: dict.layout_admin.service_packages,
      href: "/service-packages",
      icon: Package,
      active:
        pathname === "/service-packages" ||
        pathname.startsWith("/service-packages/"),
    },
  ];

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background flex text-on-surface antialiased overflow-hidden">
        {/* Backdrop for Mobile Sidebar */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar - Desktop & Mobile Drawer */}
        <aside
          className={`h-screen w-[280px] bg-[#eff4ff] border-r border-[#c3c6d3] flex flex-col p-4 gap-2 z-50 transition-transform duration-300 fixed left-0 top-0 
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0`}
        >
          {/* Sidebar Header / Logo */}
          <div className="flex items-center justify-between mb-6 px-2 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2c5ead] text-white flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>

              <div>
                <h1 className="font-headline text-lg font-bold text-[#0b1c30] leading-tight tracking-tight">
                  SecurityAdmin
                </h1>
                <p className="text-xs text-[#434751] font-medium font-body">
                  {dict.layout_admin.portal_title}
                </p>
              </div>
            </div>

            {/* Close button for Mobile */}
            <button
              className="md:hidden text-[#434751] hover:text-[#024594] p-1 flex items-center justify-center"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
            {sidebarLinks.map((link, idx) => {
              const Icon = link.icon;

              return (
                <Link
                  key={idx}
                  href={link.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg font-body text-sm font-semibold transition-all duration-150 group
                  ${link.active
                      ? "bg-[#4db2ff] text-[#00436a] scale-95 transition-transform"
                      : "text-[#434751] hover:bg-[#dce9ff]/50 hover:text-[#0b1c30] hover:scale-[0.98] transition-transform"
                    }`}
                >
                  <Icon className="w-5 h-5 transition-colors shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

        </aside>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col md:ml-[280px] h-screen overflow-hidden bg-background">
          {/* Top Header */}
          <header className="bg-white border-b border-[#c3c6d3] w-full h-16 px-6 flex justify-between items-center z-40 shrink-0">
            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-4 flex-1">
              <button
                className="md:hidden text-[#434751] hover:text-[#024594] p-1 rounded-full hover:bg-surface-container-low transition-colors flex items-center justify-center"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Right Utilities */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#434751] hover:text-red-600 hover:bg-red-50 transition-all duration-150 border border-transparent hover:border-red-200"
                title={dict.common.logout}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{dict.common.logout}</span>
              </button>
            </div>
          </header>

          {/* Content Viewport */}
          <main className="flex-1 overflow-y-auto bg-background flex flex-col justify-between">
            <div className="flex-1">
              <Suspense
                fallback={
                  <div className="p-6 text-center text-sm text-on-surface-variant">
                    {dict.common.loading}
                  </div>
                }
              >
                {children}
              </Suspense>
            </div>

            {/* Shared Admin Footer */}
            <footer className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
              <p className="text-on-surface-variant text-sm">
                © 2023 Security Operations Management System. All rights
                reserved.
              </p>

              <div className="flex gap-4">
                <Link
                  href="#"
                  className="text-on-surface-variant hover:text-primary text-sm transition-colors"
                >
                  {dict.footer.privacy}
                </Link>

                <Link
                  href="#"
                  className="text-on-surface-variant hover:text-primary text-sm transition-colors"
                >
                  {dict.footer.terms}
                </Link>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
