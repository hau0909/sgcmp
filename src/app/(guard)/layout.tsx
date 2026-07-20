"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import RoleGuard from "@/components/auth/RoleGuard";
import { createClient } from "@/lib/supabase/client";
import { requestGetUserProfile } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "@/components/providers/LanguageProvider";
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const userId = useAuthStore((state) => state.user_id);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const bottomLinks = [
    {
      name: dict.layout_guard.dashboard,
      href: "/overview",
      icon: LayoutDashboard,
      active: pathname === "/overview" || pathname.startsWith("/overview"),
    },
    {
      name: dict.layout_guard.schedule,
      href: "/guard-schedule",
      icon: CalendarDays,
      active:
        pathname === "/guard-schedule" ||
        pathname.startsWith("/guard-schedule"),
    },
    {
      name: dict.layout_guard.shift,
      href: "/guard-shift",
      icon: ClipboardCheck,
      active:
        pathname === "/guard-shift" || pathname.startsWith("/guard-shift"),
    },
  ];

  const menuLinks = [
    ...bottomLinks,
    {
      name: dict.layout_guard.profile,
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
            className={`fixed left-0 top-0 z-50 h-dvh w-[82vw] max-w-[320px] bg-white shadow-2xl transition-transform duration-300 sm:w-[320px] ${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#0b4f9c]">
                <ShieldCheck className="h-5 w-5" />
                <span>{dict.layout_guard.role}</span>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User info trong drawer */}
            <div className="border-b border-slate-200 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-500">
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

            <nav className="flex flex-col gap-2 p-4">
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
                    <Icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>{dict.layout_guard.logout}</span>
              </button>
            </div>
          </aside>

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

            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto bg-[#f7f8fb] px-4 py-4 pb-24 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-none">{children}</div>
          </main>

          {/* Bottom Navigation */}
          <nav className="z-30 flex h-16 shrink-0 items-center justify-around border-t border-slate-200 bg-white px-2 sm:px-6 lg:px-8">
            {bottomLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex h-12 min-w-[92px] flex-1 flex-col items-center justify-center rounded-xl text-[11px] font-bold transition-all sm:max-w-[180px] sm:text-xs ${
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
                  <span className="truncate">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </RoleGuard>
  );
}
