"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const sidebarLinks = [
    {
      name: "Bảng điều khiển",
      href: "#",
      icon: "dashboard",
      active: false,
    },
    {
      name: "Quản lý Doanh nghiệp",
      href: "/registrations",
      icon: "corporate_fare",
      active: true, // Active state
    },
    {
      name: "Tuân thủ pháp lý",
      href: "#",
      icon: "verified_user",
      active: false,
    },
    {
      name: "Quản lý Bảo vệ",
      href: "#",
      icon: "security",
      active: false,
    },
    {
      name: "Người dùng Hệ thống",
      href: "#",
      icon: "group",
      active: false,
    },
  ];

  return (
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
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                security
              </span>
            </div>
            <div>
              <h1 className="font-headline text-lg font-bold text-[#0b1c30] leading-tight tracking-tight">
                QUẢN TRỊ VIÊN
              </h1>
              <p className="text-xs text-[#434751] font-medium font-body">Cổng Quản Trị</p>
            </div>
          </div>
          {/* Close button for Mobile */}
          <button
            className="md:hidden text-[#434751] hover:text-[#024594] p-1 flex items-center justify-center"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {sidebarLinks.map((link, idx) => {
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
                <span
                  className="material-symbols-outlined text-xl transition-colors"
                  style={link.active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {link.icon}
                </span>
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
            <span className="material-symbols-outlined text-xl">settings</span>
            <span>Cài đặt</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-[#434751] hover:bg-[#dce9ff]/50 hover:text-[#0b1c30] hover:scale-[0.98] rounded-lg font-body text-sm font-semibold transition-all"
          >
            <span className="material-symbols-outlined text-xl">help_outline</span>
            <span>Hỗ trợ</span>
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
              <p className="text-[#0b1c30] text-xs font-semibold truncate">Admin Hệ Thống</p>
              <p className="text-[#434751] text-[10px] truncate">admin@security.vn</p>
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
              className="md:hidden text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-container-low transition-colors flex items-center justify-center"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <div className="hidden sm:flex items-center bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant focus-within:border-secondary transition-colors w-full max-w-md">
              <span className="material-symbols-outlined text-on-surface-variant text-xl mr-2">search</span>
              <input
                type="text"
                placeholder="Tìm kiếm đăng ký, doanh nghiệp..."
                className="bg-transparent border-none outline-none text-sm text-on-surface w-full placeholder-on-surface-variant"
              />
            </div>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-primary transition-colors relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full" />
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-xl">history</span>
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-xl">apps</span>
            </button>
            <div className="h-6 w-[1px] bg-outline-variant mx-1"></div>
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
          <div className="flex-1">{children}</div>

          {/* Shared Admin Footer */}
          <footer className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
            <p className="text-on-surface-variant text-sm">
              © 2023 Security Operations Management System. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-on-surface-variant hover:text-primary text-sm transition-colors">
                Chính sách bảo mật
              </Link>
              <Link href="#" className="text-on-surface-variant hover:text-primary text-sm transition-colors">
                Điều khoản sử dụng
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
