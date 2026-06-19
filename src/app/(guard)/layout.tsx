"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import RoleGuard from "@/components/auth/RoleGuard";
import { createClient } from "@/lib/supabase/client";
import { requestGetUserProfile } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import {
  Menu,
  X,
  LayoutDashboard,
  ClipboardCheck,
  CalendarDays,
  ShieldCheck,
  UserRound,
  LogOut,
  Bell,
  UserCircle,
} from "lucide-react";

type UserRole =
  | "customer"
  | "guard"
  | "Coordinator"
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

  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const userId = useAuthStore((state) => state.user_id);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const isAuthenticated = !!userId;
  const shouldShowCheckingAuth = checkingAuth && !userId;

  const bottomLinks = [
    {
      name: "Bảng điều khiển",
      href: "/overview",
      icon: LayoutDashboard,
      active: pathname === "/overview" || pathname.startsWith("/overview"),
    },
    {
      name: "Lịch trình",
      href: "/guard-schedule",
      icon: CalendarDays,
      active:
        pathname === "/guard-schedule" ||
        pathname.startsWith("/guard-schedule"),
    },
    {
      name: "Ca trực",
      href: "/guard-shift",
      icon: ClipboardCheck,
      active:
        pathname === "/guard-shift" || pathname.startsWith("/guard-shift"),
    },
  ];

  const menuLinks = [
    ...bottomLinks,
    {
      name: "Hồ sơ",
      href: "/profile",
      icon: UserRound,
      active: pathname === "/profile" || pathname.startsWith("/profile/"),
    },
  ];

  const closeMenus = () => {
    setMenuOpen(false);
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

  const handleLogout = async () => {
    const supabase = createClient();

    try {
      await supabase.auth.signOut();
    } finally {
      clearAuth();
      setProfile(null);
      setCheckingAuth(false);
      closeMenus();

      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <RoleGuard allowedRoles={["guard"]}>
      <div className="min-h-screen bg-[#202124] text-slate-900 antialiased">
        <div className="min-h-screen flex justify-center bg-[radial-gradient(circle_at_1px_1px,#3b3b3b_1px,transparent_0)] [background-size:16px_16px] px-3 py-5">
          <div className="relative flex h-[calc(100vh-40px)] w-full max-w-[390px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Overlay khi mở menu */}
            {menuOpen && (
              <div
                className="absolute inset-0 z-40 bg-black/40"
                onClick={() => setMenuOpen(false)}
              />
            )}

            {/* Burger Menu Drawer */}
            <aside
              className={`absolute left-0 top-0 z-50 h-full w-[270px] bg-white shadow-2xl transition-transform duration-300 ${
                menuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="h-16 border-b border-slate-200 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0b4f9c] font-extrabold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  <span>BẢO VỆ</span>
                </div>

                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User info trong drawer */}
              <div className="border-b border-slate-200 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 overflow-hidden rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-500">
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
                      {profile?.full_name ?? "Nhân viên bảo vệ"}
                    </p>
                    <p className="truncate text-xs font-medium text-slate-500">
                      {profile?.email ?? "Đang kiểm tra tài khoản"}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="p-4 flex flex-col gap-2">
                {menuLinks.map((link) => {
                  const Icon = link.icon;

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
                      <Icon className="w-5 h-5" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </aside>

            {/* Top Header */}
            <header className="h-16 shrink-0 border-b border-slate-200 bg-white px-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link
                href="/guard"
                className="flex items-center gap-2 text-[#0b4f9c] font-extrabold text-sm tracking-wide"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>CỔNG THÔNG TIN BẢO VỆ</span>
              </Link>

              <button
                type="button"
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
              </button>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto bg-[#f7f8fb] px-4 py-4 pb-24">
              {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="absolute bottom-0 left-0 right-0 h-16 border-t border-slate-200 bg-white px-3 flex items-center justify-between">
              {bottomLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex h-12 min-w-[95px] flex-col items-center justify-center rounded-xl text-[11px] font-bold transition-all ${
                      link.active
                        ? "bg-blue-100 text-[#0b4f9c]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#0b4f9c]"
                    }`}
                  >
                    <Icon
                      className={`mb-1 h-5 w-5 ${
                        link.active ? "text-[#0b4f9c]" : "text-slate-600"
                      }`}
                    />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
