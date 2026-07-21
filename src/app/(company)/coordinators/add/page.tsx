"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddCoordinatorForm } from "@/features/coordinator/components/AddCoordinatorForm";
import { useTranslation } from "@/components/providers/LanguageProvider";

export default function AddCoordinatorPage() {
  const { dict } = useTranslation();

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-1 border-b border-outline-variant/60 pb-4">
        <Link
          href="/coordinators"
          className="inline-flex items-center gap-1.5 text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors w-fit mb-1"
        >
          <ArrowLeft className="w-[15px] h-[15px]" />
          {dict.add_coordinator.back_to_list}
        </Link>
        <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
          {dict.add_coordinator.page_title}
        </h2>
        <p className="text-sm text-on-surface-variant mt-0.5 font-body">
          {dict.add_coordinator.page_desc}
        </p>
      </div>

      {/* Form */}
      <AddCoordinatorForm />

      <div className="h-8" />
    </div>
  );
}
