"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { onboardingBtnOutline, onboardingBtnPrimary } from "./onboardingStyles";

interface OnboardingFooterProps {
  backHref?: string;
  nextHref?: string;
  nextLabel?: string;
  onNext?: () => void;
  skipHref?: string;
  onSkip?: () => void;
  skipLabel?: string;
  nextDisabled?: boolean;
}

export default function OnboardingFooter({
  backHref,
  nextHref,
  nextLabel = "Tiếp theo",
  onNext,
  skipHref,
  onSkip,
  skipLabel = "Bỏ qua bước này",
  nextDisabled = false,
}: OnboardingFooterProps) {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant px-6 lg:px-8 py-4 shrink-0 mt-auto">
      <div className="flex items-center justify-between max-w-[1440px] mx-auto gap-4">
        <div className="shrink-0">
          {backHref && (
            <Link href={backHref} className={onboardingBtnOutline}>
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </Link>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-6 text-xs text-on-surface-variant font-body">
          <a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a>
          <a href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</a>
          <a href="#" className="hover:text-primary transition-colors">Trung tâm tuân thủ</a>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {onSkip ? (
            <button type="button" onClick={onSkip} className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap font-body">
              {skipLabel}
            </button>
          ) : skipHref ? (
            <Link href={skipHref} className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap font-body">
              {skipLabel}
            </Link>
          ) : null}
          {onNext ? (
            <button type="button" onClick={onNext} disabled={nextDisabled} className={`${onboardingBtnPrimary} px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed`}>
              {nextLabel}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : nextHref ? (
            <Link href={nextHref} className={`${onboardingBtnPrimary} px-6 py-2.5 ${nextDisabled ? "pointer-events-none opacity-50" : ""}`}>
              {nextLabel}
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
