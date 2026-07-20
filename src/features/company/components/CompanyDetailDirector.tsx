"use client";

import React from "react";
import { Quote, Award } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

export default function CompanyDetailDirector() {
  const { dict } = useTranslation();
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
      <h3 className="text-[12px] font-semibold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
        <Award className="w-4.5 h-4.5 text-primary" /> {dict.customer.company_detail.director_title}
      </h3>
      
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Avatar with decorative ring */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-[2px] scale-105" />
          <img
            alt="Giám đốc Trần Thế Hùng"
            className="w-18 h-18 rounded-full border-2 border-primary object-cover relative z-10 shadow-xs"
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120&h=120"
          />
        </div>

        {/* Director Info */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div>
            <h4 className="text-body-lg font-bold text-on-surface">
              Trần Thế Hùng
            </h4>
            <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mt-0.5">
              Tổng Giám đốc / Cựu Sĩ quan Đặc công
            </p>
          </div>
          
          <p className="text-body-sm text-on-surface-variant leading-relaxed text-justify">
            Hơn 20 năm kinh nghiệm chỉ huy và huấn luyện lực lượng an ninh đặc nhiệm. Sáng lập Sentinel Prime với sứ mệnh mang đến giải pháp bảo vệ chuyên nghiệp chuẩn quân đội cho các doanh nghiệp thời đại mới.
          </p>

          {/* Elegant Quote */}
          <div className="pt-2 flex items-start gap-2 text-outline-variant italic text-body-sm bg-surface-bright/50 p-3 rounded-lg border border-outline-variant/30">
            <Quote className="w-4 h-4 shrink-0 text-primary/40 rotate-180" />
            <p className="text-on-surface-variant/80">
              Sự an toàn của quý khách hàng là thước đo duy nhất cho năng lực và uy tín của tập thể Sentinel Prime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
