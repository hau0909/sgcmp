"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OnboardingFooterProps {
  backHref?: string;
  onBack?: () => void;
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
  onBack,
  nextHref,
  nextLabel = "Tiếp theo",
  onNext,
  skipHref,
  onSkip,
  skipLabel = "Bỏ qua bước này",
  nextDisabled = false,
}: OnboardingFooterProps) {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant px-6 py-4 shrink-0">
      <div className="flex items-center justify-between max-w-[1440px] mx-auto">
        <div>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </button>
          ) : backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </Link>
          ) : null}
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs text-on-surface-variant">
          <a href="#" className="hover:text-primary transition-colors">
            Chính sách bảo mật
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Điều khoản dịch vụ
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Trung tâm tuân thủ
          </a>
        </div>

        <div className="flex items-center gap-3">
          {onSkip ? (
            <button
              type="button"
              onClick={onSkip}
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              {skipLabel}
            </button>
          ) : skipHref ? (
            <Link
              href={skipHref}
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              {skipLabel}
            </Link>
          ) : null}
          {onNext ? (
            <button
              type="button"
              onClick={onNext}
              disabled={nextDisabled}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {nextLabel}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : nextHref ? (
            <Link
              href={nextHref}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary text-sm font-semibold transition-colors ${
                nextDisabled ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {nextLabel}
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
