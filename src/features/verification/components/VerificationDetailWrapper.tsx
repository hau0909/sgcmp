"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { VerificationDetail } from "./VerificationDetail";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface VerificationDetailWrapperProps {
  id: string;
}

export function VerificationDetailWrapper({
  id,
}: VerificationDetailWrapperProps) {
  const { dict } = useTranslation();
  const displayCode = `#REQ-${id.slice(0, 5).toUpperCase()}`;

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Breadcrumbs Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-medium text-on-surface-variant mb-2">
        <Link
          href="/verifications"
          className="hover:text-primary transition-colors cursor-pointer"
        >
          {dict.verification_detail?.admin_title
            ? dict.verification_detail.admin_title.replace(" Chi tiết", "")
            : "Khảo sát"}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/60 shrink-0" />
        <span className="text-on-surface font-semibold">
          {dict.company_verifications?.view_detail
            ? dict.company_verifications.view_detail.replace("Xem ", "")
            : "Chi tiết"}{" "}
          {displayCode}
        </span>
      </nav>

      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-outline-variant/60 pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex flex-wrap items-center gap-3">
            <span>
              {dict.verification_detail?.admin_title || "Chi tiết Khảo sát"}
            </span>
            <span className="font-mono text-primary bg-primary-fixed px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-tight border border-primary-fixed-dim shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              {displayCode}
            </span>
          </h2>
        </div>
        <Link
          href={`/requests/${id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded-lg text-sm font-semibold text-on-surface transition-all active:scale-95 shadow-sm"
        >
          {dict.company_verifications?.view_detail || "Xem chi tiết yêu cầu"}{" "}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* VerificationDetail renders in isCompanyAdmin mode */}
      <VerificationDetail bookingId={id} isCompanyAdmin={true} />
    </div>
  );
}
