"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Star,
} from "lucide-react";
import {
  requestGetAllReviewByCompanyId,
  requestGetAverageRatingByCompanyId,
  requestGetRatingDistributionByCompanyId,
} from "@/features/review/api/review.api";
import {
  GetAllReviewByCompanyIdResult,
  RatingDistributionItem,
} from "@/features/review/types";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "@/components/providers/LanguageProvider";

const PAGE_SIZE = 10;

const DEFAULT_RATING_DISTRIBUTION: RatingDistributionItem[] = [
  { star: 5, count: 0, percent: 0 },
  { star: 4, count: 0, percent: 0 },
  { star: 3, count: 0, percent: 0 },
  { star: 2, count: 0, percent: 0 },
  { star: 1, count: 0, percent: 0 },
];

const StarRating = ({
  rating,
  sizeClassName = "h-4 w-4",
  colorClassName = "fill-blue-600 text-blue-600",
}: {
  rating: number;
  sizeClassName?: string;
  colorClassName?: string;
}) => {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const starNumber = index + 1;

        const isFull = safeRating >= starNumber;
        const isHalf = !isFull && safeRating > index;
        const fillPercent = isFull ? 100 : isHalf ? 50 : 0;

        return (
          <div key={index} className={`relative ${sizeClassName}`}>
            <Star
              className={`absolute inset-0 ${sizeClassName} fill-slate-200 text-slate-300`}
            />

            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star className={`${sizeClassName} ${colorClassName}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ReviewTableSkeleton = () => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-36 rounded bg-slate-200" />
                <div className="h-3 w-28 rounded bg-slate-200" />
              </div>
            </div>
          </td>

          <td className="px-5 py-5">
            <div className="h-4 w-24 rounded bg-slate-200" />
          </td>

          <td className="px-5 py-5">
            <div className="h-4 w-[420px] max-w-full rounded bg-slate-200" />
          </td>

          <td className="px-5 py-5 text-center">
            <div className="mx-auto h-4 w-20 rounded bg-slate-200" />
          </td>
        </tr>
      ))}
    </>
  );
};

export default function ServiceReviewPage() {
  const companyId = useAuthStore((state) => state.company_id);
  const { dict, locale } = useTranslation();
  const numberLocale = locale === "en" ? "en-US" : "vi-VN";

  const [reviewData, setReviewData] =
    useState<GetAllReviewByCompanyIdResult | null>(null);

  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<
    RatingDistributionItem[]
  >(DEFAULT_RATING_DISTRIBUTION);

  const [searchValue, setSearchValue] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchReviewSummary = async () => {
      if (!companyId) {
        setErrorMessage("error_no_company");
        return;
      }

      try {
        setIsSummaryLoading(true);
        setErrorMessage("");

        const [averageRatingResponse, ratingDistributionResponse] =
          await Promise.all([
            requestGetAverageRatingByCompanyId(companyId),
            requestGetRatingDistributionByCompanyId(companyId),
          ]);

        setAverageRating(
          Number(averageRatingResponse.data.average_rating ?? 0),
        );
        setTotalReviews(ratingDistributionResponse.data.total_reviews ?? 0);
        setRatingDistribution(
          ratingDistributionResponse.data.rating_distribution ??
          DEFAULT_RATING_DISTRIBUTION,
        );
      } catch (error) {
        setErrorMessage("error_summary");
      } finally {
        setIsSummaryLoading(false);
      }
    };

    fetchReviewSummary();
  }, [companyId]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!companyId) {
        setErrorMessage("error_no_company_list");
        return;
      }

      try {
        setIsReviewLoading(true);
        setErrorMessage("");

        const response = await requestGetAllReviewByCompanyId({
          companyId,
          page,
        });

        setReviewData(response.data);
      } catch (error) {
        setErrorMessage("error_list");
      } finally {
        setIsReviewLoading(false);
      }
    };

    fetchReviews();
  }, [companyId, page]);

  const reviews = reviewData?.reviews ?? [];
  const pagination = reviewData?.pagination;

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const keyword = searchValue.toLowerCase().trim();

      const customerName = review.customer?.full_name ?? "";
      const email = review.customer?.email ?? "";
      const comment = review.comment ?? "";

      const matchSearch =
        keyword.length === 0 ||
        customerName.toLowerCase().includes(keyword) ||
        email.toLowerCase().includes(keyword) ||
        comment.toLowerCase().includes(keyword);

      const selectedRating = Number(ratingFilter);
      const reviewRating = Number(review.rating);

      const matchRating =
        ratingFilter === "all" ||
        (selectedRating === 5
          ? reviewRating === 5
          : reviewRating >= selectedRating &&
          reviewRating < selectedRating + 1);

      return matchSearch && matchRating;
    });
  }, [reviews, searchValue, ratingFilter]);

  const totalItems = pagination?.total_items ?? 0;
  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.total_pages ?? 0;

  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const toItem =
    totalItems === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, totalItems);

  const handlePreviousPage = () => {
    if (pagination?.has_previous_page) {
      setPage((prevPage) => Math.max(prevPage - 1, 1));
    }
  };

  const handleNextPage = () => {
    if (pagination?.has_next_page) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {dict.reviews?.page_title || "Danh sách đánh giá dịch vụ"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {dict.reviews?.page_desc || "Theo dõi và quản lý phản hồi từ khách hàng về chất lượng dịch vụ bảo vệ."}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {errorMessage === "error_no_company" && (dict.reviews?.error_no_company || "Không tìm thấy công ty để lấy dữ liệu đánh giá.")}
            {errorMessage === "error_summary" && (dict.reviews?.error_summary || "Không thể lấy tổng quan đánh giá.")}
            {errorMessage === "error_no_company_list" && (dict.reviews?.error_no_company_list || "Không tìm thấy công ty để lấy danh sách đánh giá.")}
            {errorMessage === "error_list" && (dict.reviews?.error_list || "Không thể lấy danh sách đánh giá.")}
            {!["error_no_company", "error_summary", "error_no_company_list", "error_list"].includes(errorMessage) && errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[330px_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-600">
                {dict.reviews?.avg_rating_title || "Điểm đánh giá trung bình"}
              </p>

              <div className="mt-4 text-6xl font-bold text-blue-800">
                {isSummaryLoading ? "..." : averageRating.toFixed(1)}
                <span className="text-5xl font-semibold text-slate-800">
                  /5
                </span>
              </div>

              <div className="mt-3">
                <StarRating
                  rating={averageRating}
                  sizeClassName="h-6 w-6"
                  colorClassName="fill-blue-800 text-blue-800"
                />
              </div>

              <p className="mt-4 text-sm text-slate-600">
                {(dict.reviews?.avg_rating_based || "Dựa trên {0} đánh giá tổng cộng").replace("{0}", totalReviews.toLocaleString(numberLocale))}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
              {dict.reviews?.distribution_title || "Phân bố đánh giá"}
            </h2>

            <div className="mt-6 space-y-5">
              {ratingDistribution.map((item) => (
                <div
                  key={item.star}
                  className="grid grid-cols-[50px_1fr_60px] items-center gap-5"
                >
                  <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                    {item.star}
                    <Star className="h-4 w-4 fill-blue-800 text-blue-800" />
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-blue-100">
                    <div
                      className="h-full rounded-full bg-blue-800"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>

                  <p className="text-right text-sm font-medium text-slate-600">
                    {item.count}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-[280px]">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={dict.reviews?.search_placeholder || "Tìm kiếm đánh giá..."}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                value={ratingFilter}
                onChange={(event) => setRatingFilter(event.target.value)}
                className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">{dict.reviews?.filter_all_stars || "Tất cả số sao"}</option>
                {[5, 4, 3, 2, 1].map((s) => (
                  <option key={s} value={String(s)}>
                    {(dict.reviews?.filter_stars || "{0} sao").replace("{0}", String(s))}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-4 text-sm text-slate-600">
              <span>
                <span className="font-semibold text-slate-900">
                  {fromItem}-{toItem}
                </span>{" "}
                {dict.reviews?.of_total || "trong"} {totalItems.toLocaleString(numberLocale)}
              </span>

              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={!pagination?.has_previous_page || isReviewLoading}
                className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={!pagination?.has_next_page || isReviewLoading}
                className="rounded-md p-2 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <span className="text-xs font-semibold text-slate-500">
                {(dict.reviews?.page_info || "Trang {0}/{1}")
                  .replace("{0}", String(currentPage))
                  .replace("{1}", String(totalPages || 1))}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="bg-blue-100">
                  <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-900">
                    {dict.reviews?.col_customer || "Khách hàng"}
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-900">
                    {dict.reviews?.col_rating || "Đánh giá"}
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-900">
                    {dict.reviews?.col_content || "Nội dung"}
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-bold uppercase tracking-wider text-slate-900">
                    {dict.reviews?.col_action || "Thao tác"}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {isReviewLoading ? (
                  <ReviewTableSkeleton />
                ) : (
                  filteredReviews.map((review) => {
                    const customerName =
                      review.customer?.full_name ?? (dict.reviews?.customer_fallback || "Khách hàng");
                    const customerEmail =
                      review.customer?.email ?? (dict.reviews?.email_fallback || "Chưa có email");
                    const avatarUrl = review.customer?.avatar_url;
                    const avatarFallback = customerName.charAt(0).toUpperCase();

                    return (
                      <tr
                        key={review.review_id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={customerName}
                                className="h-10 w-10 shrink-0 rounded-md border border-slate-300 object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-100 text-sm font-bold text-slate-700">
                                {avatarFallback}
                              </div>
                            )}

                            <div>
                              <p className="max-w-[180px] font-bold text-slate-900">
                                {customerName}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {customerEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <StarRating rating={Number(review.rating)} />
                            <span className="text-xs font-semibold text-slate-500">
                              {Number(review.rating).toFixed(1)}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="max-w-[520px] truncate text-sm text-slate-600">
                            {review.comment ?? (dict.reviews?.no_comment || "Không có nội dung đánh giá.")}
                          </p>
                        </td>

                        <td className="px-5 py-5 text-center">
                          <button className="text-sm font-bold uppercase text-blue-600 transition hover:text-blue-800">
                            {dict.reviews?.view_detail || "Xem chi tiết"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}

                {!isReviewLoading && reviews.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-sm font-medium text-slate-500"
                    >
                      {dict.reviews?.no_feedback || "Không có phản hồi từ khách hàng."}
                    </td>
                  </tr>
                )}

                {!isReviewLoading && reviews.length > 0 && filteredReviews.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-sm font-medium text-slate-500"
                    >
                      {dict.reviews?.no_match || "Không tìm thấy đánh giá phù hợp."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
