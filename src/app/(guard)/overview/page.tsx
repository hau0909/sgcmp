"use client";

import React from "react";
import { useTranslation } from "@/components/providers/LanguageProvider";

const OverviewPage = () => {
  const { dict } = useTranslation();

  return (
    <div className="flex justify-center items-center py-10 text-lg font-semibold text-slate-800">
      {dict.layout_guard.welcome}
    </div>
  );
};

export default OverviewPage;
