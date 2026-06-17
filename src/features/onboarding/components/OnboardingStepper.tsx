"use client";

import { Check } from "lucide-react";

export type OnboardingStep = {
  id: number;
  label: string;
  href: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 1, label: "Thông tin cơ bản", href: "/onboarding/basic-info" },
  { id: 2, label: "Hồ sơ Thành phần", href: "/onboarding/component-profile" },
  { id: 3, label: "Giấy phép Kinh doanh", href: "/onboarding/business-license" },
  { id: 4, label: "Xem lại & Gửi", href: "/onboarding/review" },
];

interface OnboardingStepperProps {
  currentStep: number;
}

export default function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  return (
    <div className="flex flex-col gap-1">
      {ONBOARDING_STEPS.map((step) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <div
            key={step.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                ? "bg-primary/10 border border-primary/20"
                : isCompleted
                  ? "opacity-80"
                  : "opacity-50"
              }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isCompleted
                  ? "bg-[#16a34a] text-white"
                  : isActive
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant border border-outline-variant"
                }`}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : step.id}
            </div>
            <span
              className={`text-sm font-semibold ${isActive ? "text-primary" : isCompleted ? "text-on-surface" : "text-on-surface-variant"
                }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
