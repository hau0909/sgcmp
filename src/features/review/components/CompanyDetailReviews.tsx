"use client";

import React, { useState } from "react";
import { Star, MessageSquareQuote } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface CompanyReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface CompanyDetailReviewsProps {
  companyId?: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockReviews: CompanyReview[] = [
  {
    id: "r1",
    customerName: "Phạm Minh Tuấn",
    rating: 5,
    comment:
      "Dịch vụ của công ty cực kỳ chuyên nghiệp. Đội ngũ vệ sĩ phản ứng nhanh, tác phong chuẩn mực và tính kỷ luật cao. Tôi chưa bao giờ thấy yên tâm đến thế khi giao phó công tác an ninh cho một đơn vị. Mọi thứ đều được lên kế hoạch và thực hiện rất bài bản, từ việc tuần tra định kỳ đến kiểm soát ra vào.",
    createdAt: "2025-12-15T10:30:00Z",
  },
  {
    id: "r2",
    customerName: "Lê Hoài Nam",
    rating: 5,
    comment:
      "Chúng tôi đã hợp tác hơn 3 năm cho các sự kiện quốc tế lớn. Luôn hoàn thành xuất sắc phương án bảo vệ và kiểm soát an ninh tối ưu. Không có gì để chê trách, nhân viên luôn có mặt đúng giờ và xử lý tình huống cực kỳ khéo léo.",
    createdAt: "2025-11-20T08:00:00Z",
  },
  {
    id: "r3",
    customerName: "Trần Thị Hương",
    rating: 4,
    comment:
      "Đội ngũ bảo vệ rất nhiệt tình và chu đáo. Quy trình giao ca rõ ràng, báo cáo định kỳ chi tiết. Chỉ cần cải thiện thêm về thời gian phản hồi khi có sự cố ngoài giờ hành chính thì sẽ tuyệt vời hơn nữa.",
    createdAt: "2025-10-05T14:20:00Z",
  },
  {
    id: "r4",
    customerName: "Nguyễn Văn Đức",
    rating: 5,
    comment:
      "Dịch vụ vận chuyển hàng quý giá được bảo vệ tuyệt đối. Đội ngũ lái xe và bảo vệ phối hợp rất ăn ý, đảm bảo an toàn 100% cho mọi chuyến hàng. Rất đáng đồng tiền bát gạo, sẽ giới thiệu cho các đối tác khác.",
    createdAt: "2025-09-18T09:45:00Z",
  },
  {
    id: "r5",
    customerName: "Đặng Quốc Bảo",
    rating: 3,
    comment:
      "Nhìn chung dịch vụ ổn, nhân viên lễ phép. Tuy nhiên, có đôi lần bảo vệ trực ca không đúng vị trí. Cần quản lý giám sát chặt chẽ hơn trong tương lai.",
    createdAt: "2025-08-10T16:00:00Z",
  },
  {
    id: "r6",
    customerName: "Võ Thanh Sơn",
    rating: 4,
    comment:
      "Hợp tác tốt, đáp ứng nhanh các yêu cầu thay đổi ca trực. Bảo vệ có thái độ phục vụ tốt, đồng phục chỉn chu. Đề xuất bổ sung thêm báo cáo bằng hình ảnh hàng tuần để khách hàng dễ theo dõi hơn.",
    createdAt: "2025-07-22T11:30:00Z",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTimeAgo(dateStr: string) {
  const diffTime = Math.abs(new Date().getTime() - new Date(dateStr).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7) return "1 tuần trước";
  if (diffDays <= 14) return "2 tuần trước";
  if (diffDays <= 21) return "3 tuần trước";
  if (diffDays <= 30) return "1 tháng trước";
  if (diffDays <= 60) return "2 tháng trước";
  if (diffDays <= 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return `${Math.floor(diffDays / 365)} năm trước`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(-2)
    .map((n) => n[0])
    .join("");
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function CompanyDetailReviews({
  companyId,
}: CompanyDetailReviewsProps) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_DISPLAY = 4;

  const displayedReviews = showAll
    ? mockReviews
    : mockReviews.slice(0, INITIAL_DISPLAY);

  const avgRating = "4,8"; // Mock average rating

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 md:p-12 shadow-xs w-full">
      {/* ─── Section Header ────────────────────────────────────────── */}
      <div className="mb-6">
        <h3 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider flex items-center gap-2">
          <MessageSquareQuote className="w-4.5 h-4.5 text-primary" />
          Đánh giá từ khách hàng
        </h3>
      </div>

      {/* ─── Rating Summary Box ──────────────────────────────────── */}
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        
        {/* Overall Score */}
        <div className="flex flex-col items-center shrink-0">
          <div className="text-[56px] font-bold text-on-surface leading-none tracking-tight mb-2">
            4.8
          </div>
          <div className="flex items-center gap-1 text-amber-500 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-4 h-4 ${s === 5 ? "fill-transparent" : "fill-amber-500"}`} />
            ))}
          </div>
          <p className="text-[13px] text-on-surface-variant font-medium">
            {mockReviews.length} bài đánh giá
          </p>
        </div>

        {/* Vertical Divider (Desktop) */}
        <div className="hidden md:block w-px h-24 bg-outline-variant/40"></div>

        {/* Distribution Bars */}
        <div className="flex-1 w-full flex flex-col gap-2.5">
          {[
            { level: 5, percent: 70 },
            { level: 4, percent: 20 },
            { level: 3, percent: 10 },
            { level: 2, percent: 0 },
            { level: 1, percent: 0 },
          ].map((item) => (
            <div key={item.level} className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-on-surface-variant w-3 shrink-0">
                {item.level}
              </span>
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              <div className="flex-1 h-[6px] bg-outline-variant/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Review Cards Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-10">
        {displayedReviews.map((review, idx) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Show All / Collapse Reviews Button */}
      {mockReviews.length > INITIAL_DISPLAY && (
        <div className="mt-12 flex justify-center">
          {!showAll ? (
            <button
              onClick={() => setShowAll(true)}
              className="px-6 py-3 border border-outline-variant text-on-surface rounded-xl font-semibold text-[15px] hover:bg-surface-container hover:border-outline transition-colors"
            >
              Hiển thị tất cả {mockReviews.length} đánh giá
            </button>
          ) : (
            <button
              onClick={() => setShowAll(false)}
              className="px-6 py-3 border border-outline-variant text-on-surface rounded-xl font-semibold text-[15px] hover:bg-surface-container hover:border-outline transition-colors"
            >
              Thu gọn danh sách
            </button>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Review Card Sub-component ───────────────────────────────────────────────
function ReviewCard({ review }: { review: CompanyReview }) {
  const [expanded, setExpanded] = useState(false);

  // Check if text is long enough to need "Show more"
  const isLong = review.comment.length > 250;

  return (
    <div className="flex flex-col group">
      {/* Author Header */}
      <div className="flex items-center gap-3.5 mb-3">
        {/* Avatar using project colors */}
        <div className="w-[48px] h-[48px] bg-surface-container-highest text-on-surface-variant rounded-full flex items-center justify-center font-bold text-[16px] shrink-0">
          {getInitials(review.customerName)}
        </div>
        <div>
          <h4 className="text-[16px] font-semibold text-on-surface leading-tight">
            {review.customerName}
          </h4>
        </div>
      </div>

      {/* Rating & Date Row */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <div className="flex items-center gap-0.5 text-amber-500">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-[12px] h-[12px] ${s <= review.rating ? "fill-amber-500" : "fill-transparent text-outline-variant"}`}
            />
          ))}
        </div>
        <span className="text-[13px] font-semibold text-on-surface ml-1">·</span>
        <span className="text-[13px] font-medium text-on-surface">
          {getTimeAgo(review.createdAt)}
        </span>
      </div>

      {/* Review Text */}
      <p className={`text-[15px] text-on-surface leading-[1.6] text-justify ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
        {review.comment}
      </p>

      {/* Show more toggle */}
      {isLong && !expanded && (
        <button 
          onClick={() => setExpanded(true)}
          className="underline font-semibold text-[15px] text-on-surface mt-2 text-left w-fit hover:text-on-surface-variant transition-colors"
        >
          Hiển thị thêm
        </button>
      )}
      {isLong && expanded && (
        <button 
          onClick={() => setExpanded(false)}
          className="underline font-semibold text-[15px] text-on-surface mt-2 text-left w-fit hover:text-on-surface-variant transition-colors"
        >
          Thu gọn
        </button>
      )}
    </div>
  );
}
