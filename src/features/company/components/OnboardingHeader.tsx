"use client";

import { Bell, CircleHelp, FileText, Headphones, Shield } from "lucide-react";

export default function OnboardingHeader() {
  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant h-16 px-6 flex justify-between items-center shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
          <Shield className="w-5 h-5" />
        </div>
        <h1 className="text-base font-bold text-on-surface tracking-tight font-headline">
          SGCMP Business Onboarding
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button type="button" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors font-body">
          <Headphones className="w-4 h-4" />
          <span>Hỗ trợ</span>
        </button>
        <button type="button" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors font-body">
          <FileText className="w-4 h-4" />
          <span>Tài liệu</span>
        </button>
        <button type="button" className="text-on-surface-variant hover:text-primary w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors">
          <CircleHelp className="w-5 h-5" />
        </button>
        <button type="button" className="text-on-surface-variant hover:text-primary w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface-container-lowest" />
        </button>
        <div className="w-8 h-8 rounded-full border border-outline-variant overflow-hidden cursor-pointer hover:border-primary transition-colors ml-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
