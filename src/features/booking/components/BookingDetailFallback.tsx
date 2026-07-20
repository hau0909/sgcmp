"use client";

import React from "react";
import { useTranslation } from "@/components/providers/LanguageProvider";

export function BookingDetailFallback() {
  const { dict } = useTranslation();
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[70vh]">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
      <p className="text-sm text-on-surface-variant font-medium">
        {dict.booking.form.loading_detail || "Đang tải chi tiết yêu cầu..."}
      </p>
    </div>
  );
}
