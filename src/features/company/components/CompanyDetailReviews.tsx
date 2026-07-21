"use client";

import React from "react";
import { Star, MessageSquareQuote } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface Review {
  id: string;
  clientName: string;
  clientRole: string;
  rating: number;
  content: string;
  avatarBg: string;
}

const mockReviews: Review[] = [
  {
    id: "r1",
    clientName: "Phạm Minh Tuấn",
    clientRole: "Giám đốc Vận hành, Vingroup",
    rating: 5,
    content: "Dịch vụ của Sentinel Prime cực kỳ chuyên nghiệp. Đội ngũ vệ sĩ phản ứng nhanh, tác phong chuẩn mực và tính kỷ luật cao. Rất yên tâm khi hợp tác.",
    avatarBg: "bg-primary/10 text-primary",
  },
  {
    id: "r2",
    clientName: "Lê Hoài Nam",
    clientRole: "Trưởng ban An ninh, Lotte Mall",
    rating: 5,
    content: "Chúng tôi đã hợp tác hơn 3 năm cho các sự kiện quốc tế lớn. Sentinel Prime luôn hoàn thành xuất sắc phương án bảo vệ và kiểm soát an ninh tối ưu.",
    avatarBg: "bg-secondary/10 text-secondary",
  },
];

export default function CompanyDetailReviews() {
  const { dict } = useTranslation();
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
      <h3 className="text-[12px] font-semibold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
        <MessageSquareQuote className="w-4.5 h-4.5 text-primary" /> {dict.customer.company_detail.reviews_title}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ReviewCards()}
      </div>
    </div>
  );

  function ReviewCards() {
    return mockReviews.map((review) => (
      <div
        key={review.id}
        className="bg-surface-bright/50 border border-outline-variant/60 rounded-lg p-4 hover:border-primary/30 transition-all flex flex-col justify-between"
      >
        <p className="text-body-sm text-on-surface-variant leading-relaxed text-justify mb-4 italic">
          "{review.content}"
        </p>

        <div className="flex items-center justify-between gap-2 border-t border-outline-variant/30 pt-3 mt-auto">
          <div className="flex items-center gap-2.5">
            {/* Initials Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${review.avatarBg}`}>
              {review.clientName.split(" ").slice(-2).map((n) => n[0]).join("")}
            </div>
            <div>
              <h4 className="text-xs font-bold text-on-surface leading-tight">
                {review.clientName}
              </h4>
              <p className="text-[10px] text-on-surface-variant/80 mt-0.5 leading-none">
                {review.clientRole}
              </p>
            </div>
          </div>

          {/* Star Rating display */}
          <div className="flex items-center text-[#f59e0b] shrink-0">
            {Array.from({ length: review.rating }).map((_, idx) => (
              <Star key={idx} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
        </div>
      </div>
    ));
  }
}
