"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/store/auth.store";
import { useSubscriptionStore } from "@/store/subscription.store";
import { requestGetCompanyById } from "@/features/company/api/company.api";
import { requestGetUserProfile, requestLogout } from "@/features/auth/api/auth.api";
import { useTranslation } from "@/components/providers/LanguageProvider";
import {
  Shield,
  HelpCircle,
  Menu,
  X,
  Gauge,
  BookOpen,
  ShieldUser,
  CalendarDays,
  FileText,
  FileSignature,
  Archive,
  Copy,
  ShieldAlert,
  ClipboardCheck,
  LayoutDashboard,
  ArrowRightLeft,
  UserCircle,
  LogOut,
  Loader2,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";

export default function CoordinatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { dict } = useTranslation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name: string | null; email: string | null; avatar_url: string | null } | null>(null);

  const companyId = useAuthStore((state) => state.company_id);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const fetchSubscription = useSubscriptionStore((state) => state.fetchSubscription);
  const { isActive, isLoading } = useSubscriptionStore();
  const isSubscriptionExpired = !isLoading && !isActive && !!companyId;

  const [companyInfo, setCompanyInfo] = useState<{
    name: string;
    ownerName?: string;
  } | null>(null);

  useEffect(() => {
    if (companyId) {
      fetchSubscription(companyId);
    }
  }, [companyId, fetchSubscription]);

  useEffect(() => {
    requestGetUserProfile().then((res) => {
      if (res?.success && res.data) {
        setUserProfile({
          full_name: res.data.full_name ?? null,
          email: res.data.email ?? null,
          avatar_url: res.data.avatar_url ?? null,
        });
      }
    });
  }, []);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    try {
      setLoggingOut(true);
      await requestLogout();
    } finally {
      clearAuth();
      setUserDropdownOpen(false);
      router.replace("/");
      router.refresh();
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    if (!companyId) return;
    let active = true;
    const fetchCompany = async () => {
      try {
        const data = await requestGetCompanyById(companyId);
        if (active && data) {
          setCompanyInfo({
            name: data.name,
            ownerName: data.ownerName,
          });
        }
      } catch (err) {
        console.error(
          "Lỗi khi tải thông tin công ty trong Coordinator layout:",
          err,
        );
      }
    };
    fetchCompany();
    return () => {
      active = false;
    };
  }, [companyId]);

  // Sidebar Items
  const sidebarLinks = [
    {
      name: dict.layout_coordinator.dashboard || "Bảng điều khiển",
      href: "/coor-dashboard",
      icon: LayoutDashboard,
      active: pathname === "/coor-dashboard" || pathname.startsWith("/coor-dashboard"),
    },
    {
      name: dict.layout_coordinator.guard_performance || "Hiệu suất bảo vệ",
      href: "/guard-performance",
      icon: Gauge,
      active: pathname === "/guard-performance" || pathname.startsWith("/guard-performance"),
    },
    {
      name: dict.layout_coordinator.shift,
      href: "/schedules",
      icon: CalendarDays,
      active: pathname === "/schedules" || pathname.startsWith("/schedules/"),
    },
    {
      name: dict.layout_coordinator.bookings,
      href: "/bookings",
      icon: FileText,
      active: pathname === "/bookings" || pathname.startsWith("/bookings/"),
    },
    {
      name: dict.layout_coordinator.verifications,
      href: "/coor-verifications",
      icon: ClipboardCheck,
      active: pathname === "/coor-verifications" || pathname.startsWith("/coor-verifications/"),
    },
    {
      name: dict.layout_coordinator.guards,
      href: "/guards",
      icon: ShieldUser,
      active: pathname === "/guards" || pathname.startsWith("/guards/"),
    },
    {
      name: dict.layout_coordinator.reports,
      href: "/coor-reports",
      icon: ShieldAlert,
      active: pathname === "/coor-reports" || pathname.startsWith("/coor-reports/"),
    },
  ];

  return (
    <RoleGuard allowedRoles={["coordinator", "company-admin"]}>
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
          <div className="flex items-center justify-between mb-6 px-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-on-primary shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-on-surface tracking-tight leading-tight">
                  SGCMP
                </h2>
                <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-widest mt-1">
                  {role === "company-admin"
                    ? (dict.layout_coordinator.director || "Giám đốc")
                    : dict.layout_coordinator.role}
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
            {isSubscriptionExpired && (
              <div className="mx-1 mb-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{dict.layout_coordinator?.subscription_expired_badge || "Gói dịch vụ đã hết hạn"}</span>
              </div>
            )}
            {sidebarLinks.map((link, idx) => {
              const Icon = link.icon;
              if (isSubscriptionExpired) {
                return (
                  <div
                    key={idx}
                    title={dict.layout_coordinator?.subscription_expired_tooltip || "Gói dịch vụ công ty đã hết hạn. Tính năng bị khóa."}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg font-body text-sm font-semibold text-on-surface-variant/40 bg-surface-container/30 opacity-50 cursor-not-allowed select-none"
                  >
                    <Icon className="w-5 h-5 text-on-surface-variant/40 shrink-0" />
                    <span>{link.name}</span>
                  </div>
                );
              }
              return (
                <Link
                  key={idx}
                  href={link.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg font-body text-sm font-semibold transition-all duration-150 group
                  ${link.active
                      ? "bg-secondary-container text-on-secondary-container"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors
                    ${link.active
                        ? "text-on-secondary-container"
                        : "text-on-surface-variant group-hover:text-primary"
                      }`}
                  />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer (Copyright inside left sidebar) */}
          <div className="pt-3 mt-auto border-t border-outline-variant/30 text-center text-[11px] text-on-surface-variant/60 shrink-0">
            &copy; {new Date().getFullYear()}{" "}
            {dict.layout_company.copyright_text}
          </div>
        </aside>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col md:ml-64 h-screen overflow-hidden">
          {/* Subscription Expired Alert Banner */}
          {isSubscriptionExpired && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-amber-800 text-xs font-semibold shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {dict.layout_coordinator?.subscription_expired_banner || "Gói dịch vụ của công ty đã hết hạn. Vui lòng liên hệ Giám đốc / Quản trị viên công ty để gia hạn gói dịch vụ."}
              </span>
            </div>
          )}

          {/* Top Header matching (company) structure exactly */}
          <header className="bg-surface-container-lowest border-b border-outline-variant w-full h-16 px-6 flex justify-between items-center z-30 shrink-0">
            {/* Brand & Mobile Toggle */}
            <div className="flex items-center gap-4">
              <button
                className="md:hidden text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-container-low transition-colors"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="md:flex flex-col items-start gap-0.5 hidden">
                <h1 className="text-sm font-bold text-on-surface tracking-tight leading-tight truncate max-w-[280px]" title={companyInfo?.name || ""}>
                  {companyInfo ? companyInfo.name : dict.common.loading}
                </h1>
                {companyInfo?.ownerName && (
                  <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-widest">
                    {dict.layout_coordinator.director}: {companyInfo.ownerName}
                  </p>
                )}
              </div>
            </div>

            {/* Right Header Options */}
            <div className="flex items-center gap-4 relative">
              {role === "company-admin" && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-on-primary hover:bg-primary/90 transition-colors mr-2"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  {dict.layout_coordinator.switch_to_management || "Qua quản lý"}
                </Link>
              )}
              {/* User Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-outline-variant hover:border-primary hover:bg-surface-container-low transition-all duration-200 cursor-pointer ml-2"
              >
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt="avatar"
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <UserCircle className="w-7 h-7 text-on-surface-variant shrink-0" />
                )}
                <div className="hidden sm:flex flex-col items-start leading-tight max-w-[140px]">
                  <span className="text-xs font-semibold text-on-surface truncate w-full">
                    {userProfile?.full_name || dict.common.loading}
                  </span>
                  <span className="text-[10px] text-on-surface-variant truncate w-full">
                    {userProfile?.email || ""}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-on-surface-variant transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-xl overflow-hidden">
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-on-surface hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>{dict.common.profile}</span>
                    </Link>
                    <div className="border-t border-outline-variant/30" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loggingOut ? (
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      ) : (
                        <LogOut className="w-4 h-4 shrink-0" />
                      )}
                      <span>{dict.common.logout}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Page Content Viewport */}
          <main className="flex-1 overflow-y-auto bg-surface-bright">
            <Suspense fallback={<div className="p-6 text-center text-sm text-on-surface-variant">{dict.common.loading}</div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
