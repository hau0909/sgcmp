"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Dictionary, Locale, getDictionary, defaultLocale } from "../../utils/i18n";

type LanguageContextType = {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
  dict: Dictionary;
};

const defaultDict = getDictionary(defaultLocale);

const defaultContextValue: LanguageContextType = {
  locale: defaultLocale,
  setLocale: () => {},
  dict: defaultDict,
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);
  const [dict, setDict] = useState<Dictionary>(getDictionary(initialLocale || defaultLocale));

  // Đồng bộ state khi initialLocale đổi từ Server
  useEffect(() => {
    setLocaleState(initialLocale || defaultLocale);
    setDict(getDictionary(initialLocale || defaultLocale));
  }, [initialLocale]);

  // Đồng bộ cookie và localStorage khi component mount
  useEffect(() => {
    const savedLocale = localStorage.getItem("NEXT_LOCALE") as Locale;
    if (savedLocale && (savedLocale === "vi" || savedLocale === "en")) {
      document.cookie = `NEXT_LOCALE=${savedLocale}; path=/; max-age=31536000; SameSite=Lax`;
      if (savedLocale !== locale) {
        setLocaleState(savedLocale);
        setDict(getDictionary(savedLocale));
      }
    } else {
      localStorage.setItem("NEXT_LOCALE", initialLocale || defaultLocale);
      document.cookie = `NEXT_LOCALE=${initialLocale || defaultLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = (newLocale: Locale) => {
    localStorage.setItem("NEXT_LOCALE", newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setLocaleState(newLocale);
    setDict(getDictionary(newLocale));
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, dict }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  return context || defaultContextValue;
}
