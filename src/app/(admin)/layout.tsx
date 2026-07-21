"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Users,
  Settings,
  HelpCircle,
  Menu,
  Search,
  Bell,
  History,
  Grid,
  X,
  Globe,
  Landmark,
  BadgeDollarSign,
  Layers,
  Package,
} from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";
import { useTranslation } from "@/components/providers/LanguageProvider";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { dict } = useTranslation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
      name: "Lịch sử thanh toán",
      href: "/payment-history",
      icon: BadgeDollarSign,
      active:
        pathname === "/payment-history" ||
        pathname.startsWith("/payment-history/"),
    },
    {
      name: "Dịch vụ",
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
      name: "Quản lý tài khoản",
      href: "/accounts",
      icon: Users,
      active: pathname === "/accounts" || pathname.startsWith("/accounts/"),
    },
    {
      name: "Quản lý gói dịch vụ",
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
                  ${
                    link.active
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

          {/* Footer Section */}
          <div className="mt-auto flex flex-col gap-1 border-t border-[#c3c6d3] pt-4">
            <Link
              href="#"
              className="flex items-center gap-3 px-3 py-2 text-[#434751] hover:bg-[#dce9ff]/50 hover:text-[#0b1c30] hover:scale-[0.98] rounded-lg font-body text-sm font-semibold transition-all"
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span>{dict.layout_admin.settings}</span>
            </Link>

            <Link
              href="#"
              className="flex items-center gap-3 px-3 py-2 text-[#434751] hover:bg-[#dce9ff]/50 hover:text-[#0b1c30] hover:scale-[0.98] rounded-lg font-body text-sm font-semibold transition-all"
            >
              <HelpCircle className="w-5 h-5 shrink-0" />
              <span>{dict.layout_admin.support}</span>
            </Link>

            {/* User Profile Info Card */}
            <div className="mt-4 px-3 flex items-center gap-3 border-t border-[#c3c6d3]/50 pt-4">
              <div className="w-8 h-8 rounded-full bg-[#2c5ead] flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                <img
                  alt="Administrator Profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjI0itcdYN6Wdi_lhkZQ3f7tyQfIcYttAvisUfDlFj2cbSiN4di_5NjLyvR7svkFEmobdqztiUp9J46Jk7SC4NTrPqLSz3M9-T6VHVmaNFByA_JtCclVQrW3l9o8kzoy9LWSCtsc6Vl4qOZuq9XPSaU174tCQ7rum65ghY9HY5V_K536vq7-LaqcGTrWyt0_uu2Lt94UQoMrxscJ5dZidy6udctgmkG733AEUN-hDrMtg3mItwGc1MbNxqnVn-i8mbtxnZWdFNcgwV"
                />
              </div>

              <div className="overflow-hidden">
                <p className="text-[#0b1c30] text-xs font-semibold truncate">
                  {dict.layout_admin.admin_name}
                </p>
                <p className="text-[#434751] text-[10px] truncate">
                  admin@security.vn
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col md:ml-[280px] h-screen overflow-hidden bg-background">
          {/* Top Header */}
          <header className="bg-white border-b border-[#c3c6d3] w-full h-16 px-6 flex justify-between items-center z-40 shrink-0">
            {/* Mobile Menu Toggle & Breadcrumbs */}
            <div className="flex items-center gap-4 flex-1">
              <button
                className="md:hidden text-[#434751] hover:text-[#024594] p-1 rounded-full hover:bg-surface-container-low transition-colors flex items-center justify-center"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="hidden sm:flex items-center bg-[#eff4ff] rounded-full px-4 py-2 border border-[#c3c6d3] focus-within:border-secondary transition-colors w-full max-w-md">
                <Search className="text-[#434751] w-5 h-5 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đăng ký, doanh nghiệp..."
                  className="bg-transparent border-none outline-none text-sm text-[#0b1c30] w-full placeholder-on-surface-variant"
                />
              </div>
            </div>

            {/* Right Utilities */}
            <div className="flex items-center gap-4">
              <button className="text-[#434751] hover:text-[#024594] transition-colors relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#dce9ff]/50">
                <Bell className="w-5 h-5 shrink-0" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full" />
              </button>

              <button className="text-[#434751] hover:text-[#024594] transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#dce9ff]/50">
                <History className="w-5 h-5 shrink-0" />
              </button>

              <button className="text-[#434751] hover:text-[#024594] transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#dce9ff]/50">
                <Grid className="w-5 h-5 shrink-0" />
              </button>

              <div className="h-6 w-[1px] bg-outline-variant mx-1" />

              <div className="w-8 h-8 rounded-full border border-outline-variant overflow-hidden cursor-pointer hover:border-primary transition-colors shrink-0">
                <img
                  alt="Administrator Profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjI0itcdYN6Wdi_lhkZQ3f7tyQfIcYttAvisUfDlFj2cbSiN4di_5NjLyvR7svkFEmobdqztiUp9J46Jk7SC4NTrPqLSz3M9-T6VHVmaNFByA_JtCclVQrW3l9o8kzoy9LWSCtsc6Vl4qOZuq9XPSaU174tCQ7rum65ghY9HY5V_K536vq7-LaqcGTrWyt0_uu2Lt94UQoMrxscJ5dZidy6udctgmkG733AEUN-hDrMtg3mItwGc1MbNxqnVn-i8mbtxnZWdFNcgwV"
                />
              </div>
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
