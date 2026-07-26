"use client";

import React, { useState } from "react";
import { Star, StarHalf } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import {
  requestGetReviewsByCompany,
  requestGetAverageRatingByCompanyId,
  requestGetRatingDistributionByCompanyId,
} from "../api/review.api";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CompanyReview {
  id: string;
  customerId: string;
  customerName: string;
  avatarUrl?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  role?: string;
  contractTag?: string | null;
}

interface CompanyDetailReviewsProps {
  companyId?: string;
  completedContracts?: number;
}

function renderLucideStars(rating: number) {
  const fullStars = Math.floor(rating);
  const decimal = rating - fullStars;
  const hasHalfStar = decimal >= 0.3 && decimal <= 0.8;
  const totalCount = 5;

  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={`full-${i}`} className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
    );
  }

  if (hasHalfStar && stars.length < totalCount) {
    stars.push(
      <StarHalf key="half" className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
    );
  }

  const remaining = totalCount - stars.length;
  for (let i = 0; i < remaining; i++) {
    stars.push(
      <Star key={`empty-${i}`} className="w-4 h-4 text-outline-variant shrink-0" />
    );
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}

function getInitials(name: string) {
  if (!name) return "KH";
  return name
    .split(" ")
    .slice(-2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function CompanyDetailReviews({
  companyId,
  completedContracts = 0,
}: CompanyDetailReviewsProps) {
  const { dict } = useTranslation();
  const [displayLimit, setDisplayLimit] = useState(6);
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [avgRatingNumber, setAvgRatingNumber] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!companyId) return;
      setIsLoading(true);
      try {
        const [reviewsData, avgData, distData] = await Promise.all([
          requestGetReviewsByCompany(companyId).catch(() => ({ reviews: [] })),
          requestGetAverageRatingByCompanyId(companyId).catch(() => null),
          requestGetRatingDistributionByCompanyId(companyId).catch(() => null),
        ]);

        if (!isMounted) return;

        if (reviewsData && reviewsData.reviews && reviewsData.reviews.length > 0) {
          const mappedReviews: CompanyReview[] = reviewsData.reviews.map((r: any, idx: number) => {
            const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
            const customerName = profile?.full_name || r.customerName || "Khách hàng";
            const avatarUrl = profile?.avatar_url || null;

            const contract = Array.isArray(r.contracts) ? r.contracts[0] : r.contracts;
            const booking = Array.isArray(contract?.bookings) ? contract.bookings[0] : contract?.bookings;
            const service = Array.isArray(booking?.services) ? booking.services[0] : booking?.services;
            const serviceName = service?.name;
            const contractTag = serviceName ? `✓ ${serviceName}` : null;

            return {
              id: r.review_id || `rev-${idx}`,
              customerId: r.customer_id,
              customerName,
              avatarUrl,
              rating: r.rating || 5,
              comment: r.comment || "",
              createdAt: r.created_at,
              contractTag,
            };
          });
          setReviews(mappedReviews);
        } else {
          setReviews([]);
        }

        if (avgData?.data?.average_rating) {
          setAvgRatingNumber(avgData.data.average_rating);
        } else if (reviewsData?.reviews?.length > 0) {
          const sum = reviewsData.reviews.reduce((acc: number, item: any) => acc + (item.rating || 0), 0);
          setAvgRatingNumber(sum / reviewsData.reviews.length);
        } else {
          setAvgRatingNumber(0);
        }

        if (distData?.data?.total_reviews !== undefined) {
          setTotalReviews(distData.data.total_reviews);
        } else {
          setTotalReviews(reviewsData?.reviews?.length || 0);
        }
      } catch (err) {
        if (isMounted) {
          setReviews([]);
          setAvgRatingNumber(0);
          setTotalReviews(0);
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

  const displayedReviews = reviews.slice(0, displayLimit);
  const avgRating = avgRatingNumber > 0 ? avgRatingNumber.toFixed(1) : "0.0";
  const hasMore = reviews.length > displayLimit;

  const t = dict.customer?.company_detail || {};

  return (
    <section className="py-8 border-b border-outline-variant/60">
      {/* ─── Section Header ────────────────────────────────────────── */}
      <div className="text-[11px] font-bold tracking-widest text-primary uppercase mb-1">
        {t.reviews_eyebrow || "Phản hồi thực tế"}
      </div>
      <h2 className="text-2xl font-bold text-on-surface mb-3">
        {t.reviews_client_title || "Đánh giá từ khách thuê"}
      </h2>

      {/* ─── Rating Summary Line (Real Data + Lucide Stars) ────── */}
      <div className="flex flex-wrap items-center gap-2.5 mb-6 text-sm">
        <span className="text-2xl sm:text-3xl font-bold text-on-surface leading-none">{avgRating}</span>
        <div className="flex items-center">
          {renderLucideStars(avgRatingNumber)}
        </div>
        <span className="text-on-surface-variant text-xs sm:text-sm">
          {totalReviews} {t.reviews_count || "đánh giá"} · {completedContracts} {t.completed_contracts || "hợp đồng đã hoàn thành"}
        </span>
      </div>

      {/* ─── Editorial Testimonial 2-Column Grid Layout ───────────── */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {displayedReviews.map((review, idx) => (
            <ReviewCard key={review.id || idx} review={review} dict={dict} index={idx} />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-on-surface-variant text-sm bg-surface-container-lowest/50 rounded-xl border border-dashed border-outline-variant/60 my-4">
          <p className="font-medium text-on-surface mb-1">
            {t.no_reviews || "Chưa có đánh giá"}
          </p>
          <p className="text-xs text-on-surface-variant">
            {t.no_reviews_desc || "Công ty chưa nhận được đánh giá nào từ khách hàng."}
          </p>
        </div>
      )}

      {/* Load More (6 per batch) / Collapse Button */}
      {reviews.length > 6 && (
        <div className="mt-8 flex justify-center">
          {hasMore ? (
            <button
              onClick={() => setDisplayLimit((prev) => prev + 6)}
              className="px-6 py-2.5 border border-outline-variant text-on-surface rounded-lg font-medium text-xs hover:bg-surface-container transition-colors cursor-pointer shadow-2xs"
            >
              {t.see_more_reviews || "Xem thêm đánh giá"} ({reviews.length - displayLimit})
            </button>
          ) : (
            <button
              onClick={() => setDisplayLimit(6)}
              className="px-6 py-2.5 border border-outline-variant text-on-surface rounded-lg font-medium text-xs hover:bg-surface-container transition-colors cursor-pointer shadow-2xs"
            >
              {t.collapse_reviews || "Thu gọn"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Editorial Review Card Sub-component ──────────────────────────────────
function ReviewCard({ review, dict, index }: { review: CompanyReview; dict: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { user_id } = useAuthStore();
  const t = dict.customer?.company_detail || {};

  const isCurrentUser = user_id === review.customerId;
  const displayName = review.customerName;
  const displayAvatarUrl = review.avatarUrl || null;

  const serviceTag = review.contractTag || null;

  let completionText = t.reviewed_by_customer || "Đánh giá từ khách hàng";
  if (review.createdAt) {
    const d = new Date(review.createdAt);
    if (!isNaN(d.getTime())) {
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      completionText = `${t.reviewed_in_month || "Tháng"} ${month}/${year}`;
    }
  }

  const isLong = review.comment.length > 250;

  return (
    <div className="py-5 flex flex-col group border-b border-outline-variant/40 md:border-b-0">
      {/* Star Rating Line with Star / StarHalf lucide icons */}
      <div className="flex items-center gap-1.5 mb-2">
        {renderLucideStars(review.rating || 5)}
        <span className="text-xs font-bold text-on-surface ml-0.5">{(review.rating || 5).toFixed(1)}</span>
      </div>

      {/* Review Text */}
      <p className={`text-base text-on-surface leading-relaxed text-justify font-normal ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
        {review.comment}
      </p>

      {/* Show more toggle */}
      {isLong && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="underline font-semibold text-xs text-primary mt-1 text-left w-fit cursor-pointer"
        >
          {t.gallery_see_more || "Xem thêm"}
        </button>
      )}

      {/* Testimonial Meta Row */}
      <div className="flex flex-wrap items-end justify-between gap-3 mt-auto pt-3">
        <div className="flex items-center gap-2.5">
          {displayAvatarUrl ? (
            <img
              src={displayAvatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-outline-variant/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center shrink-0 border border-outline-variant/30">
              {getInitials(displayName)}
            </div>
          )}
          <div>
            <div className="text-xs font-bold text-on-surface leading-tight flex items-center gap-1.5">
              <span>{displayName}</span>
              {isCurrentUser && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-primary text-on-primary rounded-full uppercase">
                  {t.current_user_tag || "Bạn"}
                </span>
              )}
            </div>
            <div className="text-[11.5px] text-on-surface-variant mt-1 leading-none">
              {completionText}
            </div>
          </div>
        </div>

        {/* Right side: Only hired service name if available */}
        {serviceTag && (
          <div className="text-xs font-medium text-emerald-700 sm:text-right shrink-0 leading-none">
            {serviceTag}
          </div>
        )}
      </div>
    </div>
  );
}
