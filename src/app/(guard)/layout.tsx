"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import RoleGuard from "@/components/auth/RoleGuard";
import { createClient } from "@/lib/supabase/client";
import { requestGetUserProfile } from "@/features/auth/api/auth.api";
import { requestGetGuardMyProfile } from "@/features/guards/api/guard.api";
import { useAuthStore } from "@/store/auth.store";
import { useSubscriptionStore } from "@/store/subscription.store";
import { useTranslation } from "@/components/providers/LanguageProvider";
import {
  Menu,
  X,
  LayoutDashboard,
  ClipboardCheck,
  CalendarDays,
  ShieldCheck,
  LogOut,
  Loader2,
  UserCircle,
  ChevronDown,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { GuardSwapRequestModal } from "@/features/shift/components/GuardSwapRequestModal";

type UserRole =
  | "customer"
  | "guard"
  | "coordinator"
  | "admin"
  | "company-admin";

type UserProfile = {
  id?: string;
  user_id?: string;
  email: string | null;
  full_name: string | null;
  phone_number: string | null;
  role: UserRole;
  status: string;
  avatar_url: string | null;
  company_id?: string | null;
};

const getProfileUserId = (profile: UserProfile | null) => {
  return profile?.user_id ?? profile?.id ?? null;
};

export default function GuardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname() || "/guard";
  const router = useRouter();
  const { dict } = useTranslation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [guardApprovalStatus, setGuardApprovalStatus] = useState<string | null>(null);

  const userId = useAuthStore((state) => state.user_id);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const authCompanyId = useAuthStore((state) => state.company_id);
  const companyId = authCompanyId || profile?.company_id;

  const fetchSubscription = useSubscriptionStore((state) => state.fetchSubscription);
  const { isActive, isLoading } = useSubscriptionStore();
  const isSubscriptionExpired = !isLoading && !isActive && !!companyId;

  useEffect(() => {
    if (companyId) {
      fetchSubscription(companyId);
    }
  }, [companyId, fetchSubscription]);

  const isApproved = guardApprovalStatus === "approved";

  const bottomLinks = [
    {
      name: dict.layout_guard.dashboard,
      href: "/overview",
      icon: LayoutDashboard,
      active: pathname === "/overview" || pathname.startsWith("/overview"),
      requiresApproval: false,
    },
    {
      name: dict.layout_guard.schedule,
      href: "/guard-schedule",
      icon: CalendarDays,
      active:
        pathname === "/guard-schedule" ||
        pathname.startsWith("/guard-schedule"),
      requiresApproval: true,
    },
    {
      name: dict.layout_guard.shift,
      href: "/guard-shift",
      icon: ClipboardCheck,
      active:
        pathname === "/guard-shift" || pathname.startsWith("/guard-shift"),
      requiresApproval: true,
    },
    {
      name: dict.layout_guard?.complete_profile || "Hồ sơ",
      href: "/complete-profile",
      icon: ShieldCheck,
      active:
        pathname === "/complete-profile" || pathname.startsWith("/complete-profile"),
      requiresApproval: false,
    },
  ];

  const closeMenus = () => {
    setMenuOpen(false);
    setUserDropdownOpen(false);
  };

  useEffect(() => {
    let isMounted = true;

    const syncAuthAndProfile = async () => {
      try {
        const result = await requestGetUserProfile();

        if (!isMounted) return;

        if (result?.success && result?.data) {
          const fetchedProfile = result.data as UserProfile;
          const fetchedUserId = getProfileUserId(fetchedProfile);

          setProfile(fetchedProfile);

          if (fetchedUserId && fetchedProfile.role) {
            const currentCompanyId = useAuthStore.getState().company_id;

            setAuth({
              user_id: fetchedUserId,
              role: fetchedProfile.role,
              company_id: fetchedProfile.company_id ?? currentCompanyId ?? null,
            });
          }
        } else {
          setProfile(null);
          clearAuth();
        }

        // Fetch guard approval status
        try {
          const guardProfile = await requestGetGuardMyProfile();
          if (isMounted && guardProfile?.data?.guard?.approval_status) {
            setGuardApprovalStatus(guardProfile.data.guard.approval_status);
          }
        } catch {
          // Guard profile not found — treat as not approved
          if (isMounted) setGuardApprovalStatus(null);
        }
      } catch {
        if (!isMounted) return;

        setProfile(null);
        clearAuth();
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    };

    void syncAuthAndProfile();

    return () => {
      isMounted = false;
    };
  }, [setAuth, clearAuth]);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    const supabase = createClient();

    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
    } finally {
      clearAuth();
      setProfile(null);
      setCheckingAuth(false);
      closeMenus();

      router.replace("/login");
      router.refresh();
      setLoggingOut(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["guard"]}>
      <div className="h-dvh w-full overflow-hidden bg-[#f7f8fb] text-slate-900 antialiased">
        <div className="relative flex h-full w-full flex-col bg-[#f7f8fb]">
          {/* Overlay khi mở menu */}
          {menuOpen ? (
            <button
              type="button"
              aria-label="Đóng menu"
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setMenuOpen(false)}
            />
          ) : null}

          {/* Burger Menu Drawer */}
          <aside
            className={`fixed left-0 top-0 z-50 flex h-dvh w-[82vw] max-w-[320px] flex-col bg-white shadow-2xl transition-transform duration-300 sm:w-[320px] ${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#0b4f9c]">
                <ShieldCheck className="h-5 w-5" />
                <span>{dict.layout_guard.role}</span>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User info trong drawer */}
            <div className="shrink-0 border-b border-slate-200 px-4 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-500 shrink-0">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      width={44}
                      height={44}
                      alt={profile.full_name ?? "Avatar bảo vệ"}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="h-8 w-8" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-800">
                    {profile?.full_name ?? dict.layout_guard.default_name}
                  </p>

                  <p className="truncate text-xs font-medium text-slate-500">
                    {profile?.email ??
                      (checkingAuth
                        ? dict.layout_guard.checking_account
                        : dict.layout_guard.no_email)}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 overflow-y-auto flex flex-col gap-2 p-4">
              {isSubscriptionExpired && (
                <div className="mb-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{dict.layout_guard?.subscription_expired_badge || "Gói dịch vụ đã hết hạn"}</span>
                </div>
              )}
              {bottomLinks.map((link) => {
                const Icon = link.icon;

                if (isSubscriptionExpired) {
                  return (
                    <div
                      key={link.href}
                      title={dict.layout_guard?.subscription_expired_tooltip || "Gói dịch vụ công ty đã hết hạn. Tính năng bị khóa."}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 bg-slate-50 opacity-50 cursor-not-allowed select-none"
                    >
                      <Icon className="h-5 w-5 text-slate-400" />
                      <span>{link.name}</span>
                    </div>
                  );
                }

                if (link.requiresApproval && !isApproved) {
                  return (
                    <div
                      key={link.href}
                      title="Hồ sơ của bạn chưa được duyệt. Vui lòng hoàn thành hồ sơ và chờ phê duyệt."
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 bg-slate-50 opacity-50 cursor-not-allowed select-none"
                    >
                      <Icon className="h-5 w-5 text-slate-400" />
                      <span>{link.name}</span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                      link.active
                        ? "bg-blue-100 text-[#0b4f9c]"
                        : "text-slate-700 hover:bg-slate-100 hover:text-[#0b4f9c]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              {/* Button Đổi ca trong Sidebar */}
              {isSubscriptionExpired ? (
                <div
                  title={dict.layout_guard?.subscription_expired_tooltip || "Gói dịch vụ công ty đã hết hạn. Tính năng bị khóa."}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 bg-slate-50 opacity-50 cursor-not-allowed select-none mt-1"
                >
                  <RefreshCw className="h-5 w-5 text-slate-400 shrink-0" />
                  <span>{dict.layout_guard?.shift_swap_btn || "Đổi ca"}</span>
                </div>
              ) : !isApproved ? (
                <div
                  title={dict.layout_guard?.profile_not_approved || "Hồ sơ chưa được duyệt"}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 bg-slate-50 opacity-50 cursor-not-allowed select-none mt-1"
                >
                  <RefreshCw className="h-5 w-5 text-slate-400 shrink-0" />
                  <span>{dict.layout_guard?.shift_swap_btn || "Đổi ca"}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setSwapModalOpen(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100 hover:text-blue-900 border border-blue-100 transition-all cursor-pointer mt-1"
                >
                  <RefreshCw className="h-5 w-5 text-blue-600 shrink-0" />
                  <span>{dict.layout_guard?.shift_swap_btn || "Đổi ca"}</span>
                </button>
              )}
            </nav>

            {/* Logout ở dưới cùng sidebar */}
            <div className="shrink-0 border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loggingOut ? (
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                ) : (
                  <LogOut className="w-5 h-5 shrink-0" />
                )}
                <span>{dict.common.logout}</span>
              </button>
            </div>
          </aside>

          {/* Subscription Expired Alert Banner */}
          {isSubscriptionExpired && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-amber-800 text-xs font-semibold shrink-0 z-30">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{dict.layout_guard?.subscription_expired_banner || "Gói dịch vụ của công ty đã hết hạn. Vui lòng liên hệ công ty bảo vệ để gia hạn."}</span>
            </div>
          )}

          {/* Top Header */}
          <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              href="/guard"
              className="flex min-w-0 items-center justify-center gap-2 text-sm font-extrabold tracking-wide text-[#0b4f9c] sm:text-base"
            >
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span className="truncate">{dict.layout_guard.portal_title}</span>
            </Link>

            <div className="flex items-center gap-2 relative">
              <button
                type="button"
                onClick={() => setSwapModalOpen(true)}
                disabled={!isApproved || isSubscriptionExpired}
                title={
                  !isApproved
                    ? (dict.layout_guard.profile_not_approved || "Hồ sơ chưa được duyệt")
                    : (dict.guard_swap_modal?.title || "Yêu cầu đổi ca làm")
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">
                  {dict.layout_guard.shift_swap_btn || "Đổi ca"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="avatar"
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <UserCircle className="w-7 h-7 text-slate-600 shrink-0" />
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {userDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-xl overflow-hidden">
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

          {/* Content */}
          <main className="flex-1 overflow-y-auto bg-[#f7f8fb] px-4 py-4 pb-24 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-none">{children}</div>
          </main>

          {/* Bottom Navigation */}
          <nav className="z-30 flex h-16 shrink-0 items-center justify-around border-t border-slate-200 bg-white px-2 sm:px-6 lg:px-8">
            {bottomLinks.map((link) => {
              const Icon = link.icon;

              if (isSubscriptionExpired) {
                return (
                  <div
                    key={link.href}
                    title={dict.layout_guard?.subscription_expired_tooltip || "Gói dịch vụ công ty đã hết hạn. Tính năng bị khóa."}
                    className="flex h-12 min-w-[92px] flex-1 flex-col items-center justify-center rounded-xl text-[11px] font-bold text-slate-400 opacity-50 cursor-not-allowed select-none sm:max-w-[180px] sm:text-xs"
                  >
                    <Icon className="mb-1 h-5 w-5 text-slate-400" />
                    <span className="truncate">{link.name}</span>
                  </div>
                );
              }

              if (link.requiresApproval && !isApproved) {
                return (
                  <div
                    key={link.href}
                    title="Hồ sơ của bạn chưa được duyệt. Vui lòng hoàn thành hồ sơ và chờ phê duyệt."
                    className="flex h-12 min-w-[92px] flex-1 flex-col items-center justify-center rounded-xl text-[11px] font-bold text-slate-400 opacity-50 cursor-not-allowed select-none sm:max-w-[180px] sm:text-xs"
                  >
                    <Icon className="mb-1 h-5 w-5 text-slate-400" />
                    <span className="truncate">{link.name}</span>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex h-12 min-w-[92px] flex-1 flex-col items-center justify-center rounded-xl text-[11px] font-bold transition-all sm:max-w-[180px] sm:text-xs ${link.active
                      ? "bg-blue-100 text-[#0b4f9c]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#0b4f9c]"
                    }`}
                >
                  <Icon
                    className={`mb-1 h-5 w-5 ${link.active ? "text-[#0b4f9c]" : "text-slate-600"
                      }`}
                  />
                  <span className="truncate">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <GuardSwapRequestModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
      />
    </RoleGuard>
  );
}
