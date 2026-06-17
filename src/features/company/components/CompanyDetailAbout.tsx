"use client";

import React from "react";

interface CompanyDetailAboutProps {
  description: string;
}

export default function CompanyDetailAbout({ description }: CompanyDetailAboutProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs">
      <h2 className="text-headline-sm font-semibold text-on-surface mb-4 uppercase tracking-wider text-[12px] border-b border-outline-variant pb-2">
        Về chúng tôi
      </h2>
      <p className="text-body-md text-on-surface-variant leading-relaxed text-justify whitespace-pre-line">
        {description}
      </p>
    </section>
  );
}
