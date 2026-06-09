"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/provider/authContext";
import { UserCircle } from "lucide-react";
import Link from "next/link";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Giới thiệu", href: "/" },
  { label: "Thuê bảo vệ", href: "/rent" },
];

export default function Header() {
  const pathname = usePathname() || "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { loading, isAuthenticated, refreshAuth } = useAuthContext();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncAuth = async () => {
      try {
        await refreshAuth();
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    };

    syncAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshAuth]);

  return (
    <>
      <header
        className="fixed top-0 w-full z-50 transition-all duration-300 
         bg-surface-container-lowest/90 backdrop-blur-md shadow-md py-3 border-b border-outline-variant/30"
      >
        <div className="flex justify-between items-center h-14 px-8 max-w-7xl mx-auto">
          <Link
            className="font-sans text-[22px] font-bold text-primary flex items-center gap-2 hover:scale-[1.02] transition-transform duration-200"
            href="/"
          >
            <Image
              src={"/logo.png"}
              width={30}
              height={30}
              alt="logo image"
              className="drop-shadow-sm/20 shadow-secondary"
            />
            SGCMP
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  className={`text-[14px] font-medium transition-all duration-200 relative py-1 hover:text-primary ${
                    isActive
                      ? "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
                      : "text-on-surface-variant hover:-translate-y-px"
                  }`}
                  href={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {(loading || checkingAuth) && !isAuthenticated ? (
              <div className="h-9 w-28 animate-pulse rounded-full bg-slate-200" />
            ) : isAuthenticated ? (
              <div className="relative flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary transition-all duration-300 hover:bg-primary/10 hover:scale-[1.03]"
                >
                  <UserCircle className="h-6 w-6" />
                </button>
                <Link
                  className="bg-primary hover:bg-primary-container text-on-primary font-semibold px-6 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.03] text-[13px] h-9 flex items-center justify-center"
                  href="/sign-up"
                >
                  Đăng kí ngay
                </Link>
                {userDropdownOpen && (
                  <div className="absolute right-0 top-12 w-44 overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-lg z-50">
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-on-surface hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      Xem hồ sơ
                    </Link>

                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Đăng xuất
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
                  Đăng nhập
                </Link>

                <Link
                  className="bg-primary hover:bg-primary-container text-on-primary font-semibold px-6 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.03] text-[13px] h-9 flex items-center justify-center"
                  href="/sign-up"
                >
                  Đăng kí ngay
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* phần mobile giữ nguyên, nhưng nên đổi a href="#" thành Link */}
    </>
  );
}
