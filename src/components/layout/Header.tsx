"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";
import Link from "next/link";
import { requestLogout } from "@/features/auth/api/auth.api";
import { createClient } from "@/lib/supabase/client";
import { requestGetUserProfile } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import CompanySearchBar from "@/features/company/components/CompanySearchBar";
import { useTranslation } from "@/components/providers/LanguageProvider";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

interface NavLink {
  label: string;
  href: string;
}

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

export default function Header() {
  const { dict } = useTranslation();
  
  const navLinks: NavLink[] = [
    { label: dict.nav.about, href: "/" },
    { label: dict.nav.hireGuard, href: "/companies" },
  ];

  const pathname = usePathname() || "/";
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const userId = useAuthStore((state) => state.user_id);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const isAuthenticated = !!userId;
  const shouldShowCheckingAuth = checkingAuth && !userId;

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  }, [userId, setAuth, clearAuth]);

  const handleLogout = async () => {
    try {
      await requestLogout();
    } finally {
      clearAuth();
      setProfile(null);
      setCheckingAuth(false);
      closeMenus();
      router.replace("/");
      router.refresh();
    }
  };

  const isCompaniesPage = pathname === "/companies";
  const showStickySearch = isScrolled && isCompaniesPage;

  return (
    <>
      <header
        className="fixed top-0 w-full z-50 transition-all duration-300 
         bg-surface-container-lowest/90 backdrop-blur-md shadow-md py-3 border-b border-outline-variant/30"
      >
        <div className="flex justify-between items-center h-14 px-8 max-w-7xl mx-auto w-full">
          {/* Logo and Nav links (on left when scrolled down) */}
          <div className="flex items-center gap-6">
            <Link
              className="font-sans text-[22px] font-bold text-primary flex items-center gap-2 hover:scale-[1.02] transition-transform duration-200 shrink-0"
              href="/"
              onClick={closeMenus}
            >
              <Image
                src="/logo.png"
                width={30}
                height={30}
                alt="logo image"
                className="drop-shadow-sm/20 shadow-secondary"
              />
              SGCMP
            </Link>

            {/* Nav links on left when scrolled on /companies */}
            <nav
              className={`hidden md:flex items-center gap-6 transition-all duration-300 origin-left ${showStickySearch
                ? "opacity-100 scale-100 w-auto"
                : "opacity-0 scale-95 w-0 overflow-hidden pointer-events-none"
                }`}
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenus}
                    className={`text-[14px] font-semibold transition-all duration-200 py-1 hover:text-primary whitespace-nowrap ${isActive ? "text-primary font-bold" : "text-on-surface-variant"
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Area: Default Nav links or Mini Search bar */}
          <div className="hidden md:flex flex-1 justify-center items-center px-4 max-w-lg">
            {!showStickySearch ? (
              <nav className="flex items-center gap-8 transition-all duration-300">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenus}
                      className={`text-[14px] font-medium transition-all duration-200 relative py-1 hover:text-primary ${isActive
                        ? "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
                        : "text-on-surface-variant hover:-translate-y-px"
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            ) : (
              <div className="w-full transition-all duration-300">
                <Suspense fallback={<div className="h-10 w-full max-w-sm bg-slate-100 rounded-full animate-pulse" />}>
                  <CompanySearchBar variant="mini" />
                </Suspense>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {shouldShowCheckingAuth ? (
              <div className="h-9 w-28 animate-pulse rounded-full bg-slate-200" />
            ) : isAuthenticated ? (
              <div className="relative flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary transition-all duration-300 hover:bg-primary/10 hover:scale-[1.03]"
                >
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      width={40}
                      height={40}
                      alt="avatar"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="h-6 w-6" />
                  )}
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 top-12 w-44 overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-lg z-50">
                    <Link
                      href="/profile"
                      onClick={closeMenus}
                      className="block px-4 py-3 text-sm font-medium text-on-surface hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      {dict.common.profile}
                    </Link>

                    {profile?.role === "customer" && (
                      <Link
                        href="/my-requests"
                        onClick={closeMenus}
                        className="block px-4 py-3 text-sm font-medium text-on-surface hover:bg-primary/5 hover:text-primary transition-colors font-semibold"
                      >
                        {dict.common.myRequests}
                      </Link>
                    )}

                    <Link
                      href="/my-contracts"
                      onClick={closeMenus}
                      className="block px-4 py-3 text-sm font-medium text-on-surface hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      {dict.common.myContracts}
                    </Link>

                    <Link
                      href="/my-reports"
                      onClick={closeMenus}
                      className="block px-4 py-3 text-sm font-medium text-on-surface hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      {dict.common.myReports}
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      {dict.common.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  className="text-[14px] text-primary font-semibold hover:text-primary/80 transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-primary/5"
                  href="/login"
                >
                  {dict.common.login}
                </Link>

                <Link
                  className="bg-primary hover:bg-primary-container text-on-primary font-semibold px-6 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.03] text-[13px] h-9 flex items-center justify-center"
                  href="/register-company"
                >
                  {dict.common.getStarted}
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden flex items-center justify-center p-2 rounded-lg text-primary hover:bg-primary/5 transition-colors focus:outline-none"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[26px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={closeMenus}
        />
      )}

      <div
        className={`md:hidden fixed top-0 right-0 h-full w-70 bg-surface-container-lowest z-50 shadow-2xl transition-transform duration-300 ease-out transform ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } flex flex-col`}
      >
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
          <Link
            className="font-sans text-[20px] font-bold text-primary flex items-center gap-2"
            href="/"
            onClick={closeMenus}
          >
            <Image
              src="/logo.png"
              width={30}
              height={30}
              alt="logo image"
              className="drop-shadow-sm/20 shadow-secondary"
            />
            SGCMP
          </Link>

          <button
            type="button"
            className="flex items-center justify-center p-2 rounded-lg text-primary hover:bg-primary/5 transition-colors"
            onClick={closeMenus}
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex flex-col gap-2 p-6 flex-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenus}
                className={`text-[15px] font-medium p-3 rounded-xl transition-all duration-200 ${isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-outline-variant/30 flex flex-col gap-3">
          <LanguageSwitcher variant="inline" />
          {shouldShowCheckingAuth ? (
            <div className="h-11 w-full animate-pulse rounded-xl bg-slate-200" />
          ) : isAuthenticated ? (
            <>
              <Link
                className="text-[15px] text-primary font-semibold text-center py-3 rounded-xl hover:bg-primary/5 transition-colors"
                href="/profile"
                onClick={closeMenus}
              >
                {dict.common.profile}
              </Link>


              {profile?.role === "customer" && (
                <Link
                  className="text-[15px] text-primary font-semibold text-center py-3 rounded-xl hover:bg-primary/5 transition-colors"
                  href="/my-requests"
                  onClick={closeMenus}
                >
                  {dict.common.myRequests}
                </Link>
              )}

              <Link
                className="text-[15px] text-primary font-semibold text-center py-3 rounded-xl hover:bg-primary/5 transition-colors"
                href="/my-contracts"
                onClick={closeMenus}
              >
                {dict.common.myContracts}
              </Link>

              <Link
                className="text-[15px] text-primary font-semibold text-center py-3 rounded-xl hover:bg-primary/5 transition-colors"
                href="/my-reports"
                onClick={closeMenus}
              >
                {dict.common.myReports}
              </Link>

              <button
                type="button"
                className="text-[15px] text-red-600 font-semibold text-center py-3 rounded-xl hover:bg-red-50 transition-colors"
                onClick={handleLogout}
              >
                {dict.common.logout}
              </button>
            </>
          ) : (
            <>
              <Link
                className="text-[15px] text-primary font-semibold text-center py-3 rounded-xl hover:bg-primary/5 transition-colors"
                href="/login"
                onClick={closeMenus}
              >
                {dict.common.login}
              </Link>

              <Link
                className="bg-primary hover:bg-primary-container text-on-primary font-semibold py-3 px-6 rounded-xl w-full text-center transition-all h-11 flex items-center justify-center"
                href="/register-company"
                onClick={closeMenus}
              >
                {dict.common.getStarted}
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
