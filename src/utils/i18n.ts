// Trigger reload
import vi from "../locales/vi.json";
import en from "../locales/en.json";

export type Locale = "vi" | "en";

function hoist(dict: any) {
  // Merge pages if present, and maintain explicit fallbacks
  const pages = dict.pages || {};
  return {
    ...pages,
    ...dict,
    booking: dict.booking || pages.booking,
    contract: dict.contract || pages.contract,
    report: dict.report || pages.report,
    company_contracts: dict.company_contracts || pages.company_contracts,
    contract_detail: dict.contract_detail || pages.contract_detail,
    contract_guards: dict.contract_guards || pages.contract_guards,
    chat: dict.chat || pages.chat,
    billing: dict.billing || pages.billing,
    payment: dict.payment || pages.payment,
    payment_success: dict.payment_success || pages.payment_success,
    coordinator: dict.coordinator || pages.coordinator,
    reviews: dict.reviews || pages.reviews,
  };
}

const viHoisted = hoist(vi);
const enHoisted = hoist(en);

export type Dictionary = typeof viHoisted;

export const defaultLocale: Locale = "vi";

export function getDictionary(locale: string): Dictionary {
  return locale === "en" ? (enHoisted as Dictionary) : viHoisted;
}
