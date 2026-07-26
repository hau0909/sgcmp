"use client";

import React from "react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CompanyDetailAboutProps {
  description: string;
}

export default function CompanyDetailAbout({ description }: CompanyDetailAboutProps) {
  const { dict } = useTranslation();

  const paragraphs = (description || "")
    .split("\n")
    .filter((p) => p.trim().length > 0);

  const t = dict.customer?.company_detail || {};

  return (
    <section className="py-8 border-b border-outline-variant/60">
      <div className="text-[11px] font-bold tracking-widest text-primary uppercase mb-2">
        {t.about_title || "Về chúng tôi"}
      </div>

      <div className="space-y-3.5 text-on-surface-variant text-sm sm:text-base font-normal leading-relaxed text-justify">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, idx) => <p key={idx}>{p}</p>)
        ) : (
          <p>{t.about_sub || "Chưa có thông tin giới thiệu chi tiết."}</p>
        )}
      </div>
    </section>
  );
}


