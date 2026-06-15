import React from "react";
import OnboardingFlowContainer from "@/features/onboarding/components/OnboardingFlowContainer";

export default function OnboardingPage() {
  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
            Đăng ký Thông tin Doanh nghiệp
          </h2>
          <p className="text-sm text-on-surface-variant mt-1 font-body">
            Hoàn thành các bước đăng ký để bắt đầu sử dụng đầy đủ tính năng của SGCMP.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <OnboardingFlowContainer />

      {/* Footer spacing */}
      <div className="h-8" />
    </div>
  );
}
