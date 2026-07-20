"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "../providers/LanguageProvider";
import { Globe, Check } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "floating" | "inline";
}

export default function LanguageSwitcher({
  variant = "floating",
}: LanguageSwitcherProps) {
  const { locale, setLocale, dict } = useTranslation();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Ẩn nút floating ở các trang Auth (login, register, verify)
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify");

  if (isAuthPage && variant === "floating") {
    return null;
  }

  const toggleDropdown = () => setIsOpen(!isOpen);

  const switchLanguage = (lang: "vi" | "en") => {
    setLocale(lang);
    setIsOpen(false);
  };

  const currentLangLabel = locale === "vi" ? "VI" : "EN";

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => switchLanguage("vi")}
          className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
            locale === "vi"
              ? "bg-primary text-white"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          VI
        </button>
        <button
          onClick={() => switchLanguage("en")}
          className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
            locale === "en"
              ? "bg-primary text-white"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          EN
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="w-14 h-14 bg-primary hover:bg-primary/90 text-on-primary rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          aria-label="Switch Language"
        >
          <Globe className="w-6 h-6" />
          <span className="absolute top-0 right-0 bg-white text-primary border border-outline-variant/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
            {currentLangLabel}
          </span>
        </button>

        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-surface-container-lowest border border-outline-variant shadow-xl rounded-xl w-36 overflow-hidden animate-slide-up origin-bottom-right">
            <button
              onClick={() => switchLanguage("vi")}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                locale === "vi"
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface hover:bg-surface-container-low"
              }`}
            >
              Tiếng Việt
              {locale === "vi" && <Check className="w-4 h-4" />}
            </button>
            <button
              onClick={() => switchLanguage("en")}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                locale === "en"
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface hover:bg-surface-container-low"
              }`}
            >
              English
              {locale === "en" && <Check className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
