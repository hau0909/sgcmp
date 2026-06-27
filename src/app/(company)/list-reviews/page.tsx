"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Star,
} from "lucide-react";

type ReviewItem = {
  id: string;
  customerName: string;
  email: string;
  customerAvatar?: string;
  rating: number;
  content: string;
};

const reviews: ReviewItem[] = [
  {
    id: "1",
    customerName: "Ngân hàng TMCP ACB",
    email: "hcm@gmail.com",
    customerAvatar: "🏦",
    rating: 5,
    content:
      "Đội ngũ bảo vệ rất chuyên nghiệp, đúng giờ và xử lý tình huống tốt. Đội ngũ bảo vệ rất chuyên nghiệp, đúng giờ và xử lý tình huống tốt. Đội ngũ bảo vệ rất chuyên nghiệp, đúng giờ và xử lý tình huống tốt. Đội ngũ bảo vệ rất chuyên nghiệp, đúng giờ và xử lý tình huống tốt. Đội ngũ bảo vệ rất chuyên nghiệp, đúng giờ và xử lý tình huống tốt.",
  },
  {
    id: "2",
    customerName: "VinGroup Plaza",
    email: "vincom@gmail.com",
    customerAvatar: "V",
    rating: 4,
    content:
      "Nhân viên nhiệt tình, tuy nhiên ca đêm cần cải thiện việc báo cáo.",
  },
  {
    id: "3",
    customerName: "TechFest Vietnam",
    email: "techFest@gmail.com",
    customerAvatar: "💻",
    rating: 5,
    content:
      "Bảo vệ kiểm soát khu vực rất tốt, hỗ trợ khách tham dự nhanh chóng.",
  },
];

const ratingDistribution = [
  { star: 5, count: 934, percent: 76 },
  { star: 4, count: 186, percent: 15 },
  { star: 3, count: 62, percent: 5 },
  { star: 2, count: 25, percent: 2 },
  { star: 1, count: 38, percent: 3 },
];

const totalReviews = 1245;
const averageRating = 4.8;

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const active = index < rating;

        return (
          <Star
            key={index}
            className={`h-4 w-4 ${
              active
                ? "fill-blue-600 text-blue-600"
                : "fill-slate-200 text-slate-300"
            }`}
          />
        );
      })}
    </div>
  );
};

export default function ServiceReviewPage() {
  const [searchValue, setSearchValue] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const keyword = searchValue.toLowerCase().trim();

      const matchSearch =
        review.customerName.toLowerCase().includes(keyword) ||
        review.email.toLowerCase().includes(keyword) ||
        review.content.toLowerCase().includes(keyword);

      const matchRating =
        ratingFilter === "all" || review.rating === Number(ratingFilter);

      return matchSearch && matchRating;
    });
  }, [searchValue, ratingFilter]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Danh sách đánh giá dịch vụ
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Theo dõi và quản lý phản hồi từ khách hàng về chất lượng dịch vụ
              bảo vệ.
            </p>
          </div>

          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100">
            <Download className="h-4 w-4" />
            XUẤT BÁO CÁO
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[330px_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-600">
                Điểm đánh giá trung bình
              </p>

              <div className="mt-4 text-6xl font-bold text-blue-800">
                {averageRating}
                <span className="text-5xl font-semibold text-slate-800">
                  /5
                </span>
              </div>

              <div className="mt-3 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-6 w-6 fill-blue-800 text-blue-800"
                  />
                ))}
              </div>

              <p className="mt-4 text-sm text-slate-600">
                Dựa trên{" "}
                <span className="font-bold text-slate-900">
                  {totalReviews.toLocaleString("en-US")}
                </span>{" "}
                đánh giá tổng cộng
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
              Phân bố đánh giá
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

        {/* Filter + Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-[280px]">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Tìm kiếm đánh giá..."
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                value={ratingFilter}
                onChange={(event) => setRatingFilter(event.target.value)}
                className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">Tất cả số sao</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-4 text-sm text-slate-600">
              <span>
                <span className="font-semibold text-slate-900">1-10</span> of{" "}
                {totalReviews.toLocaleString("en-US")}
              </span>

              <button className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button className="rounded-md p-2 text-slate-700 transition hover:bg-slate-100">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="bg-blue-100">
                  <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-900">
                    Khách hàng
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-900">
                    Đánh giá
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-900">
                    Nội dung
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-bold uppercase tracking-wider text-slate-900">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-100 text-sm font-bold text-slate-700">
                          {review.customerAvatar}
                        </div>

                        <div>
                          <p className="max-w-[180px] font-bold text-slate-900">
                            {review.customerName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {review.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <StarRating rating={review.rating} />
                    </td>

                    <td className="px-5 py-5">
                      <p className="max-w-[520px] truncate text-sm text-slate-600">
                        {review.content}
                      </p>
                    </td>

                    <td className="px-5 py-5 text-center">
                      <button className="text-sm font-bold uppercase text-blue-600 transition hover:text-blue-800">
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredReviews.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-sm font-medium text-slate-500"
                    >
                      Không tìm thấy đánh giá phù hợp.
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
