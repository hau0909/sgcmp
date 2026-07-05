"use client";

import React, { useState } from "react";
import { Star, StarHalf } from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { requestGetReviewsByCompany, requestGetAverageRatingByCompanyId, requestGetRatingDistributionByCompanyId } from "../api/review.api";
import { RatingDistributionItem } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────
interface CompanyReview {
  id: string;
  customerId: string;
  customerName: string;
  avatarUrl?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

interface CompanyDetailReviewsProps {
  companyId?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  if (diffDays <= 14) return "1 tuần trước";
  if (diffDays <= 21) return "2 tuần trước";
  if (diffDays <= 30) return "3 tuần trước";
  if (diffDays <= 60) return "1 tháng trước";
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
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [avgRatingNumber, setAvgRatingNumber] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [distribution, setDistribution] = useState<RatingDistributionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const INITIAL_DISPLAY = 4;

  React.useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!companyId) return;
      setIsLoading(true);
      setError(null);
      try {
        // Fetch tất cả 3 API song song
        const [reviewsData, avgData, distData] = await Promise.all([
          requestGetReviewsByCompany(companyId),
          requestGetAverageRatingByCompanyId(companyId),
          requestGetRatingDistributionByCompanyId(companyId),
        ]);

        if (!isMounted) return;

        // Map danh sách reviews cho các card hiển thị
        if (reviewsData.reviews) {
          const mappedReviews: CompanyReview[] = reviewsData.reviews.map((r: any) => {
            const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
            const customerName = profile?.full_name || "Khách hàng";
            const avatarUrl = profile?.avatar_url || null;
            return {
              id: r.review_id,
              customerId: r.customer_id,
              customerName,
              avatarUrl,
              rating: r.rating,
              comment: r.comment || "",
              createdAt: r.created_at,
            };
          });
          setReviews(mappedReviews);
        }

        // Lấy điểm trung bình và phân bổ trực tiếp từ DB
        setAvgRatingNumber(avgData?.data?.average_rating ?? 0);
        setTotalReviews(distData?.data?.total_reviews ?? 0);
        // Sắp xếp distribution từ 5 sao xuống 1 sao
        const sortedDist = [...(distData?.data?.rating_distribution ?? [])].sort(
          (a, b) => b.star - a.star
        );
        setDistribution(sortedDist);

      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load reviews");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchData();
    
    const handleReviewSubmitted = () => {
      if (isMounted) fetchData();
    };
    window.addEventListener("reviewSubmitted", handleReviewSubmitted);
    
    return () => {
      isMounted = false;
      window.removeEventListener("reviewSubmitted", handleReviewSubmitted);
    };
  }, [companyId]);

  if (!companyId) return null;

  if (isLoading) {
     return (
       <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs w-full text-center py-12">
         <p className="text-on-surface-variant animate-pulse font-medium">Đang tải đánh giá...</p>
       </div>
     );
  }

  if (error) {
     return (
       <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs w-full text-center py-12">
         <p className="text-red-500 font-medium">{error}</p>
       </div>
     );
  }

  if (totalReviews === 0) {
    return (
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs w-full">
        <h2 className="text-headline-sm font-semibold text-on-surface mb-4 uppercase tracking-wider text-[12px] border-b border-outline-variant pb-2 text-left">
          Đánh giá từ khách hàng
        </h2>
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <p className="text-on-surface-variant font-medium">Chưa có đánh giá nào cho công ty này.</p>
        </div>
      </section>
    );
  }

  const displayedReviews = showAll
    ? reviews
    : reviews.slice(0, INITIAL_DISPLAY);

  const avgRating = avgRatingNumber.toFixed(1);

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs w-full">
      {/* ─── Section Header ────────────────────────────────────────── */}
      <h2 className="text-headline-sm font-semibold text-on-surface mb-4 uppercase tracking-wider text-[12px] border-b border-outline-variant pb-2">
        Đánh giá từ khách hàng
      </h2>

      {/* ─── Rating Summary Box ──────────────────────────────────── */}
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-6 mb-6 flex flex-col md:flex-row items-center gap-6 md:gap-10">
        
        {/* Overall Score */}
        <div className="flex flex-col items-center shrink-0 w-32">
          <div className="text-[48px] font-bold text-on-surface leading-none tracking-tight mb-2">
            {avgRating}
          </div>
          <div className="flex items-center gap-1 text-amber-500 mb-1">
            {[1, 2, 3, 4, 5].map((s) => {
              const diff = avgRatingNumber - s + 1;
              if (diff >= 0.75) {
                return (
                  <Star
                    key={s}
                    className="w-4 h-4 fill-amber-500"
                  />
                );
              } else if (diff >= 0.25) {
                return (
                  <div key={s} className="relative w-4 h-4">
                    <Star className="absolute top-0 left-0 w-4 h-4 fill-transparent" />
                    <StarHalf className="absolute top-0 left-0 w-4 h-4 fill-amber-500" />
                  </div>
                );
              } else {
                return (
                  <Star
                    key={s}
                    className="w-4 h-4 fill-transparent"
                  />
                );
              }
            })}
          </div>
          <p className="text-[13px] text-on-surface-variant font-medium">
            {totalReviews} bài đánh giá
          </p>
        </div>

        {/* Vertical Divider (Desktop) */}
        <div className="hidden md:block w-px h-24 bg-outline-variant/40"></div>

        {/* Distribution Bars */}
        <div className="flex-1 w-full flex flex-col gap-2.5">
          {distribution.map((item) => (
            <div key={item.star} className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-on-surface-variant w-3 shrink-0">
                {item.star}
              </span>
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              <div className="flex-1 h-[6px] bg-outline-variant/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
              <span className="text-[12px] font-medium text-on-surface-variant w-8 shrink-0 text-right">
                {item.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Review Cards Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-8">
        {displayedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Show All / Collapse Reviews Button */}
      {reviews.length > INITIAL_DISPLAY && (
        <div className="mt-12 flex justify-center">
          {!showAll ? (
            <button
              onClick={() => setShowAll(true)}
              className="px-6 py-3 border border-outline-variant text-on-surface rounded-xl font-semibold text-[15px] hover:bg-surface-container hover:border-outline transition-colors cursor-pointer"
            >
              Hiển thị tất cả {reviews.length} đánh giá
            </button>
          ) : (
            <button
              onClick={() => setShowAll(false)}
              className="px-6 py-3 border border-outline-variant text-on-surface rounded-xl font-semibold text-[15px] hover:bg-surface-container hover:border-outline transition-colors cursor-pointer"
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
  const { user_id } = useAuthStore();

  const isCurrentUser = user_id === review.customerId;
  const displayName = review.customerName;

  // Check if text is long enough to need "Show more"
  const isLong = review.comment.length > 250;

  return (
    <div className={`flex flex-col group ${isCurrentUser ? "p-5 bg-primary/5 rounded-2xl border border-primary/20" : ""}`}>
      {/* Author Header */}
      <div className="flex items-center gap-3.5 mb-3">
        {/* Avatar using project colors */}
        {review.avatarUrl ? (
          <img 
            src={review.avatarUrl} 
            alt={displayName}
            className="w-[48px] h-[48px] object-cover rounded-full shrink-0 border border-outline-variant/30"
          />
        ) : (
          <div className="w-[48px] h-[48px] bg-surface-container-highest text-on-surface-variant rounded-full flex items-center justify-center font-bold text-[16px] shrink-0">
            {getInitials(displayName)}
          </div>
        )}
        <div>
          <h4 className="text-[16px] font-semibold text-on-surface leading-tight flex items-center gap-2">
            {displayName}
            {isCurrentUser && (
              <span className="text-[11px] font-bold px-2 py-0.5 bg-primary text-on-primary rounded-full uppercase tracking-wider">
                Bạn
              </span>
            )}
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
