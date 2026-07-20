import { cookies } from "next/headers";
import { Locale, defaultLocale } from "./i18n";

export async function getLocaleServer(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const savedLocale = cookieStore.get("NEXT_LOCALE")?.value as Locale;
    if (savedLocale === "vi" || savedLocale === "en") {
      return savedLocale;
    }
  } catch {
    // Fallback if cookies() fails or is called outside request context
  }
  return defaultLocale;
}


