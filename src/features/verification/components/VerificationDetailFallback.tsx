"use client";

import React from "react";
import { useTranslation } from "@/components/providers/LanguageProvider";

export function VerificationDetailFallback() {
  const { dict } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center p-12 h-[70vh]">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3" />
      <p className="text-sm text-on-surface-variant font-medium">
        {dict.verification_detail?.loading || "Đang tải khảo sát..."}
      </p>
    </div>
  );
}
