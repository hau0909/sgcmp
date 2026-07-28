"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

export default function LoadingFallback() {
  const { dict } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-[400px] gap-2.5 text-on-surface-variant font-medium">
      <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
      <span className="text-sm">{dict.common.loading}</span>
    </div>
  );
}
