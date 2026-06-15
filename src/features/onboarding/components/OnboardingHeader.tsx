"use client";

import { Bell, CircleHelp, FileText, Headphones, Shield } from "lucide-react";

export default function OnboardingHeader() {
  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant h-16 px-6 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Shield className="w-5 h-5 text-on-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold text-on-surface tracking-tight">
            SGCMP Business Onboarding
          </h1>
          <p className="text-[11px] text-on-surface-variant font-medium">
            Đăng ký doanh nghiệp
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
          <Headphones className="w-4 h-4" />
          <span>Hỗ trợ</span>
        </button>
        <button className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
          <FileText className="w-4 h-4" />
          <span>Tài liệu</span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low">
          <CircleHelp className="w-5 h-5" />
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full border border-outline-variant overflow-hidden cursor-pointer hover:border-primary transition-colors">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCObcfnyW9yatcX9gZtb5sRZ7mBWagdDK-hgW8GPIz8FAFVTZpYtfKoX1OmaNJ106xfVUOfRq2CxN9PDfbfcrv1rq6BTTZIwE1lOl8lOrYN8Lvwm2te3DnzO0Eg-tCUz1cjbAKDywgccnGkqvmTdP_QV2OJT8v4v-DZKBXlYRE0te4DjZpoEH7pDTWSTo44Y3zS9NddyIN6lWxqEndynE4cBdkDLl3g96Seo_AFZqWVvI6RZYYMksQez1VNREY018LTsE1-YzlHOi4N"
            alt="User profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
