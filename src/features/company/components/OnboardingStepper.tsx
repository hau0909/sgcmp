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
    <div className="flex flex-col gap-0.5">
      {ONBOARDING_STEPS.map((step) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <div
            key={step.id}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-body ${
              isActive
                ? "bg-secondary-container/20 border border-primary-fixed"
                : "border border-transparent"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                isCompleted || isActive
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant"
              }`}
            >
              {isCompleted ? <Check className="w-4 h-4" strokeWidth={2.5} /> : step.id}
            </div>
            <span
              className={`text-sm font-semibold leading-tight ${
                isActive
                  ? "text-primary"
                  : isCompleted
                    ? "text-on-surface"
                    : "text-on-surface-variant"
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
