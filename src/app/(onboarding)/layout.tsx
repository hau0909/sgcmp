"use client";

import { usePathname } from "next/navigation";
import { Save } from "lucide-react";
import OnboardingHeader from "@/features/company/components/OnboardingHeader";
import OnboardingStepper, { ONBOARDING_STEPS } from "@/features/company/components/OnboardingStepper";
import { useOnboardingData } from "@/features/company/hooks/useOnboardingData";
import { onboardingBtnOutline, onboardingSidebar } from "@/features/company/components/onboardingStyles";

function getCurrentStep(pathname: string): number {
  const step = ONBOARDING_STEPS.find((s) => pathname.startsWith(s.href));
  return step?.id ?? 1;
}

export default function OnboardingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const currentStep = getCurrentStep(pathname);
  const { saveProgress } = useOnboardingData();

  return (
    <div className="min-h-screen bg-surface flex flex-col text-on-surface antialiased">
      <OnboardingHeader />

      <div className="flex flex-1 min-h-0">
        <aside className={`hidden lg:flex w-[280px] ${onboardingSidebar} flex-col px-5 py-6 shrink-0`}>
          <div className="mb-8 px-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant font-body">
              Company
            </p>
            <p className="text-sm font-semibold text-on-surface mt-1.5 font-headline">
              Bước {currentStep} / {ONBOARDING_STEPS.length}
            </p>
          </div>

          <OnboardingStepper currentStep={currentStep} />

          <button type="button" onClick={saveProgress} className={`mt-auto w-full justify-center ${onboardingBtnOutline}`}>
            <Save className="w-4 h-4 text-on-surface-variant" />
            Lưu tiến trình
          </button>
        </aside>

        <div className="lg:hidden fixed bottom-20 left-0 right-0 z-10 px-4 pointer-events-none">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-full px-4 py-2 text-center text-xs font-semibold shadow-sm mx-auto max-w-xs font-body">
            Bước {currentStep}/{ONBOARDING_STEPS.length}: {ONBOARDING_STEPS.find((s) => s.id === currentStep)?.label}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 min-w-0">{children}</div>
      </div>
    </div>
  );
}
