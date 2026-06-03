"use client";

import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

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

  return (
    <>
      <header
        className="fixed top-0 w-full z-50 transition-all duration-300 
         bg-surface-container-lowest/90 backdrop-blur-md shadow-md py-3 border-b border-outline-variant/30"
      >
        <div className="flex justify-between items-center h-14 px-8 max-w-7xl mx-auto">
          {/* Brand Logo */}
          <a
            className="font-sans text-[22px] font-bold text-primary flex items-center gap-2 hover:scale-[1.02] transition-transform duration-200"
            href="#"
          >
            <Image
              src={"/logo.png"}
              width={30}
              height={30}
              alt="logo image"
              className="drop-shadow-sm/20 shadow-secondary"
            />
            SGCMP
          </a>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.href}
                  className={`text-[14px] font-medium transition-all duration-200 relative py-1 hover:text-primary ${
                    isActive
                      ? "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
                      : "text-on-surface-variant hover:-translate-y-px"
                  }`}
                  href={link.href}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a
              className="text-[14px] text-primary font-semibold hover:text-primary/80 transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-primary/5"
              href="#"
            >
              Đăng nhập
            </a>
            <a
              className="bg-primary hover:bg-primary-container text-on-primary font-semibold px-6 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.03] text-[13px] h-9 flex items-center justify-center"
              href="#"
            >
              Đăng kí ngay
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center p-2 rounded-lg text-primary hover:bg-primary/5 transition-colors focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[26px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-70 bg-surface-container-lowest z-50 shadow-2xl transition-transform duration-300 ease-out transform ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
          <a
            className="font-sans text-[20px] font-bold text-primary flex items-center gap-2"
            href="#"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Image
              src={"/logo.png"}
              width={30}
              height={30}
              alt="logo image"
              className="drop-shadow-sm/20 shadow-secondary"
            />
            SGCMP
          </a>
          <button
            className="flex items-center justify-center p-2 rounded-lg text-primary hover:bg-primary/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">Đóng</span>
          </button>
        </div>

        <nav className="flex flex-col gap-2 p-6 flex-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <a
                key={link.href}
                className={`text-[15px] font-medium p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                }`}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="p-6 border-t border-outline-variant/30 flex flex-col gap-3">
          <a
            className="text-[15px] text-primary font-semibold text-center py-3 rounded-xl hover:bg-primary/5 transition-colors"
            href="#"
            onClick={() => setMobileMenuOpen(false)}
          >
            Đăng nhập
          </a>
          <a
            className="bg-primary hover:bg-primary-container text-on-primary font-semibold py-3 px-6 rounded-xl w-full text-center transition-all h-11 flex items-center justify-center"
            href="#"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dùng thử miễn phí
          </a>
        </div>
      </div>
    </>
  );
}
