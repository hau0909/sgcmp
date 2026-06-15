"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Package,
  Settings,
  HelpCircle,
  Menu,
  X,
  Search,
  Bell,
  ArrowUpCircle,
  Users,
} from "lucide-react";

export default function CompanyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (pathname.startsWith("/onboarding")) {
    return <>{children}</>;
  }

  const sidebarLinks = [
    {
      name: "Tổng quan",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      name: "Quản lý gói dịch vụ",
      href: "/billing",
      icon: Package,
      active: pathname === "/billing",
    },
    {
      name: "Quản lý điều phối viên",
      href: "/coordinator",
      icon: Users,
      active: pathname === "/coordinator",
    },
  ];

  return (
    <div className="min-h-screen bg-surface flex text-on-surface antialiased">
      {/* Backdrop for Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={`h-screen w-64 bg-surface-container-low border-r border-outline-variant flex flex-col p-4 gap-2 z-50 transition-transform duration-300 fixed left-0 top-0 
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-on-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface tracking-tight leading-tight">
                Bảo vệ Sài Gòn
              </h2>
              <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-widest mt-1">
                Giám đốc: Lê Văn Long
              </p>
            </div>
          </div>
          {/* Close button for Mobile */}
          <button
            className="md:hidden text-on-surface-variant hover:text-primary p-1"
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
                      ? "bg-secondary-container text-on-secondary-container"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors
                    ${
                      link.active
                        ? "text-on-secondary-container"
                        : "text-on-surface-variant group-hover:text-primary"
                    }`}
                />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant pt-4">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-body text-sm font-semibold transition-all"
          >
            <Settings className="w-5 h-5" />
            <span>Cài đặt</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-body text-sm font-semibold transition-all"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Hỗ trợ</span>
          </Link>
          <button className="mt-4 w-full bg-primary hover:bg-primary-container text-on-primary font-medium py-2 rounded shadow-sm transition-colors flex items-center justify-center gap-2">
            <ArrowUpCircle className="w-4 h-4" />
            <span>Nâng cấp gói</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col md:ml-64 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-surface-container-lowest border-b border-outline-variant w-full h-16 px-6 flex justify-between items-center z-30 shrink-0">
          {/* Brand & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-container-low transition-colors"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-primary tracking-tight md:block hidden">
              SGCMP - Quản lý doanh nghiệp
            </h1>
          </div>

          {/* Right Header Options */}
          <div className="flex items-center gap-4">
            {/* Search Box */}
            <div className="hidden sm:flex items-center bg-surface-container-low rounded-full px-3 py-1.5 border border-outline-variant focus-within:border-secondary transition-colors">
              <Search className="w-4 h-4 text-on-surface-variant mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm text-on-surface w-32 focus:w-48 transition-all duration-300 placeholder-on-surface-variant"
              />
            </div>
            {/* Notification */}
            <button className="text-on-surface-variant hover:text-primary transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            </button>
            {/* Help */}
            <button className="text-on-surface-variant hover:text-primary transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low">
              <HelpCircle className="w-5 h-5" />
            </button>
            {/* User Profile */}
            <div className="w-8 h-8 rounded-full border border-outline-variant overflow-hidden cursor-pointer hover:border-primary transition-colors ml-2 shrink-0">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCObcfnyW9yatcX9gZtb5sRZ7mBWagdDK-hgW8GPIz8FAFVTZpYtfKoX1OmaNJ106xfVUOfRq2CxN9PDfbfcrv1rq6BTTZIwE1lOl8lOrYN8Lvwm2te3DnzO0Eg-tCUz1cjbAKDywgccnGkqvmTdP_QV2OJT8v4v-DZKBXlYRE0te4DjZpoEH7pDTWSTo44Y3zS9NddyIN6lWxqEndynE4cBdkDLl3g96Seo_AFZqWVvI6RZYYMksQez1VNREY018LTsE1-YzlHOi4N"
                alt="User profile photo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-surface">{children}</main>
      </div>
    </div>
  );
}
