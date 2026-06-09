"use client";

import { Check } from "lucide-react";
import { onboardingBtnPrimary } from "./onboardingStyles";

interface CompanySuccessModalProps {
  open: boolean;
  onConfirm: () => void;
}

export default function CompanySuccessModal({ open, onConfirm }: CompanySuccessModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-success-title"
        className="relative w-full max-w-[420px] bg-surface-container-lowest rounded-2xl shadow-xl px-8 pt-10 pb-8 text-center border border-outline-variant"
      >
        <div className="relative mx-auto w-28 h-28 mb-6">
          <div className="absolute inset-0 rounded-full bg-primary-fixed/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#22c55e] flex items-center justify-center shadow-md">
              <Check className="w-8 h-8 text-white stroke-[3]" />
            </div>
          </div>
        </div>
        <h2 id="company-success-title" className="text-xl font-bold text-on-surface mb-3 font-headline">
          Đăng ký dịch vụ thành công
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-8 px-2 font-body">
          Hồ sơ đăng ký của bạn đã được gửi thành công. Admin sẽ xét duyệt trong vòng 1–2 ngày làm việc và thông báo kết quả qua email.
        </p>
        <button type="button" onClick={onConfirm} className={`${onboardingBtnPrimary} w-full py-3`}>
          Đã hiểu
        </button>
      </div>
    </div>
  );
}
