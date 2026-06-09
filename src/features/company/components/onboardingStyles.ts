/**
 * Onboarding styles — dùng chung token MD3 với company/admin layout (origin/dev).
 * Không hardcode màu; map qua semantic tokens trong globals.css.
 */

export const onboardingPageBg = "bg-surface";
export const onboardingCard =
  "bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm";
export const onboardingCardTitle =
  "text-[15px] font-bold text-on-surface mb-5 pb-4 border-b border-outline-variant font-headline";
export const onboardingInput =
  "w-full rounded-lg border border-outline-variant px-4 py-2.5 text-sm outline-none transition bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-1 focus:ring-primary";
export const onboardingInputError =
  "w-full rounded-lg border border-error px-4 py-2.5 text-sm outline-none transition bg-surface-container-lowest text-on-surface focus:border-error focus:ring-1 focus:ring-error";
export const onboardingLabel = "mb-1.5 block text-sm font-semibold text-on-surface";
export const onboardingPageTitle =
  "text-2xl font-bold text-on-surface tracking-tight font-headline";
export const onboardingPageSubtitle = "text-sm text-on-surface-variant mt-1 font-body leading-relaxed";
export const onboardingBreadcrumb =
  "flex items-center gap-2 text-on-surface-variant text-sm font-medium";
export const onboardingBreadcrumbActive = "text-primary font-semibold";
export const onboardingBtnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-on-primary text-sm font-semibold transition-colors";
export const onboardingBtnOutline =
  "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors";
export const onboardingBtnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary text-sm font-semibold transition-colors";
export const onboardingInfoBox =
  "flex items-start gap-3 rounded-lg bg-primary-fixed/40 border border-primary-fixed px-4 py-3";
export const onboardingInfoText = "text-xs text-on-primary-fixed-variant leading-relaxed";
export const onboardingTableHead = "bg-primary-fixed";
export const onboardingSidebar = "bg-[#eff4ff] border-r border-outline-variant";
