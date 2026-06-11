"use client";

import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import FilterSidebar from "./FilterSidebar";
import CompanyCard from "./CompanyCard";
import { MarketplaceCompany } from "../types";

const MOCK_COMPANIES: MarketplaceCompany[] = [
  {
    id: "1",
    name: "Tập đoàn Bảo vệ Aegis",
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrVw3DeiFc28mZDp1wh-qXLSQEz5ZuiC1lWDWCKEguwUbgFpDQrK-WdlouEzFEdoxIfqjCTbJgL6KQfkbscNNnAxSGdPM1Xs_0gsfMef3bdu9E_7hBuWia-KBSv4CDT3mwbj2ECzma_NLFwtam33gO2Mp4mLMkYF_lUOGG908Or3SV7vg8_-Tvjjsx1gVJnVtGRWezy_uOnNHSxBe8GIpgQjIXwpMTvO89H0PP2eCtaIQKYkeUNY5CzQZvCm1Rru4Zhkz_Xe6Iu1U1",
    initials: "AG",
    rating: 4.9,
    location: "New York, NY",
    tags: ["Vũ trang", "Không vũ trang", "Sự kiện"],
    pricePerHour: 35,
    description: "Cung cấp dịch vụ bảo vệ chuyên nghiệp với hơn 10 năm kinh nghiệm."
  },
  {
    id: "2",
    name: "Đội Tiền Phong",
    initials: "SV",
    rating: 4.7,
    location: "Newark, NJ",
    tags: ["Doanh nghiệp", "Không vũ trang"],
    pricePerHour: 28,
    description: "Đội ngũ bảo vệ trẻ trung, năng động, phản ứng nhanh."
  },
  {
    id: "3",
    name: "Hậu cần Thép",
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXw4rtEEFnQTuJLAmJ83m3AFwNgYMteDTAYOCYy22csBQ2vTVKyTVwVR1HtC4ccyx7RoukGTTsLyXORyBMmS76oozUAHpvS_6aFUwz1Hb7pS7IcBNEZzdOyV5BfXhckfTgZty8UNy2kc36iS9kyPY0hp9ov7_6I26g2FexYMgdKPnIYPDhhUnwna0qaWaxpWYdJNgUJxCkwWtI279wMKY9b0fpYkK8a9dfK3KkLu35EwYGvuzD7T9R4eUgWvSr_BI8n5CF83m5o0VH",
    initials: "HC",
    rating: 4.9,
    location: "Brooklyn, NY",
    tags: ["Vũ trang", "Vận tải", "VIP"],
    pricePerHour: 55,
    description: "Bảo vệ các chuyến hàng giá trị và yếu nhân chuyên nghiệp."
  },
  {
    id: "4",
    name: "Gác Đêm Sec",
    initials: "NS",
    rating: null,
    location: "Queens, NY",
    tags: ["Tuần tra", "Khu dân cư"],
    pricePerHour: 25,
    description: "Dịch vụ tuần tra ban đêm bảo vệ trật tự an ninh khu dân cư."
  },
  {
    id: "5",
    name: "Giám Sát Đỉnh Cao",
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNvGdFc09qyUa-LqSj9F36x6cLuwEqwI9LTU39Lb8Bi30PxL9FANNnIgj8muV-PWV5yfECO7jB0EDS6So705UWeGxUXnie-9fLKSjujYTkAIaBZXaaXrFg7r-ImzNkmMYrKp-ICiiK-E_jp9Urjkg19HiqS6qo4SraVg2MhKqYY5TeNDob9nGpLptkuiI_SYUkoKxySeB4IA_3aZx9a1OM018Q95WTeeYp4njgr_qTTbzKtEfo6Ku23UJLyeubawn1LwvgfsZ2Brtt",
    initials: "GS",
    rating: 4.8,
    location: "Manhattan, NY",
    tags: ["Không gian mạng", "Doanh nghiệp"],
    pricePerHour: 80,
    description: "Giải pháp an ninh kỹ thuật số kết hợp tuần tra thực địa."
  },
  {
    id: "6",
    name: "Chiến Thuật Toàn Cầu",
    initials: "GT",
    rating: 4.6,
    location: "Jersey City, NJ",
    tags: ["Vũ trang", "Vận chuyển"],
    pricePerHour: 45,
    description: "Hoạt động tác chiến và hỗ trợ vận tải an ninh."
  },
  {
    id: "7",
    name: "Bảo vệ Thiết Giáp",
    initials: "TG",
    rating: 4.8,
    location: "Brooklyn, NY",
    tags: ["Vũ trang", "VIP", "Vận tải"],
    pricePerHour: 60,
    description: "Bảo vệ yếu nhân có vũ trang và xe chở tiền chuyên dụng."
  },
  {
    id: "8",
    name: "Phòng thủ Sentinel",
    initials: "SE",
    rating: 4.5,
    location: "New York, NY",
    tags: ["Không vũ trang", "Tuần tra", "Khu dân cư"],
    pricePerHour: 30,
    description: "Dịch vụ bảo vệ khu phố và tuần tra kiểm soát ra vào."
  },
  {
    id: "9",
    name: "An ninh Đỉnh Phong",
    initials: "DP",
    rating: null,
    location: "Queens, NY",
    tags: ["Sự kiện", "Doanh nghiệp"],
    pricePerHour: 32,
    description: "Nhà cung cấp mới nổi với dịch vụ an ninh sự kiện chất lượng cao."
  },
  {
    id: "10",
    name: "Bảo vệ Khiên Vàng",
    initials: "KV",
    rating: 4.4,
    location: "Newark, NJ",
    tags: ["Tuần tra", "Khu dân cư"],
    pricePerHour: 22,
    description: "Phương án bảo vệ tiết kiệm chi phí cho các khu dân sinh."
  },
  {
    id: "11",
    name: "Thiên Thần Hộ Vệ",
    initials: "TT",
    rating: 4.9,
    location: "Manhattan, NY",
    tags: ["VIP", "Vũ trang", "Sự kiện"],
    pricePerHour: 75,
    description: "Vệ sĩ VIP đẳng cấp quốc tế cho doanh nhân và nghệ sĩ."
  },
  {
    id: "12",
    name: "Bảo vệ Chân Trời",
    initials: "CT",
    rating: 4.3,
    location: "Jersey City, NJ",
    tags: ["Không gian mạng", "Doanh nghiệp"],
    pricePerHour: 40,
    description: "Đơn vị bảo vệ tích hợp công nghệ AI giám sát camera."
  },
  {
    id: "13",
    name: "An Ninh Sao Mai",
    initials: "SM",
    rating: 4.7,
    location: "Brooklyn, NY",
    tags: ["Không vũ trang", "Sự kiện"],
    pricePerHour: 29,
    description: "Cung cấp nhân sự sự kiện chuyên nghiệp và lịch sự."
  },
  {
    id: "14",
    name: "Bảo vệ Cảng Đông",
    initials: "CD",
    rating: 4.5,
    location: "New York, NY",
    tags: ["Vận tải", "Doanh nghiệp"],
    pricePerHour: 34,
    description: "Đơn vị bảo vệ kho bãi và giám sát cảng vận chuyển hàng hải."
  }
];

const TAG_MAPPING: Record<string, string> = {
  "Bảo vệ có vũ trang": "Vũ trang",
  "Tuần tra không vũ trang": "Không vũ trang",
  "Bảo vệ sự kiện": "Sự kiện",
  "An ninh mạng": "Không gian mạng",
};

const ITEMS_PER_PAGE = 6;

export default function SearchCompanies() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState<number | "any">("any");
  const [sortBy, setSortBy] = useState("Đề xuất");
  const [currentPage, setCurrentPage] = useState(1);

  // Mobile filter drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Clear all filters
  const handleClearAll = () => {
    setSearchQuery("");
    setLocation("");
    setSelectedTags([]);
    setMinPrice("");
    setMaxPrice("");
    setMinRating("any");
    setCurrentPage(1);
  };

  // Filtered & Sorted list
  const filteredCompanies = useMemo(() => {
    let result = [...MOCK_COMPANIES];

    // 1. Search query (name or tags)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // 2. Location filter
    if (location.trim()) {
      const loc = location.toLowerCase().trim();
      result = result.filter((c) => c.location.toLowerCase().includes(loc));
    }

    // 3. Service tags filter (ALL selected tags must match)
    if (selectedTags.length > 0) {
      result = result.filter((c) =>
        selectedTags.every((selectedTag) => {
          const mappedTag = TAG_MAPPING[selectedTag] || selectedTag;
          return c.tags.includes(mappedTag);
        })
      );
    }

    // 4. Price range filter
    if (minPrice) {
      result = result.filter((c) => c.pricePerHour >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter((c) => c.pricePerHour <= Number(maxPrice));
    }

    // 5. Rating filter
    if (minRating !== "any") {
      result = result.filter(
        (c) => c.rating !== null && c.rating >= minRating
      );
    }

    // Sort operations
    if (sortBy === "Đánh giá cao nhất") {
      result.sort((a, b) => {
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return b.rating - a.rating;
      });
    } else if (sortBy === "Giá thấp nhất") {
      result.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else {
      // "Đề xuất" (Recommended - rating descending, then price descending)
      result.sort((a, b) => {
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        if (ratingA !== ratingB) return ratingB - ratingA;
        return a.pricePerHour - b.pricePerHour;
      });
    }

    return result;
  }, [searchQuery, location, selectedTags, minPrice, maxPrice, minRating, sortBy]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE) || 1;
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCompanies, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredCompanies.length);

  // Handle page changes
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of listings smoothly
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 text-on-surface antialiased bg-surface">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-8 pt-4">
      {/* 1. Desktop Sidebar Filter */}
      <FilterSidebar
        location={location}
        setLocation={setLocation}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        minRating={minRating}
        setMinRating={setMinRating}
        onClearAll={handleClearAll}
      />

      {/* 2. Mobile Filter Overlay Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative flex flex-col w-full max-w-xs bg-surface p-6 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
              <h3 className="text-base font-bold text-on-surface">Bộ lọc</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-high"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Embed layout of Filters */}
            <div className="flex flex-col gap-6">
              {/* Location */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Địa điểm
                </label>
                <input
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 px-3 bg-surface-container-low border border-outline-variant rounded text-sm outline-none focus:border-primary"
                  placeholder="Thành phố hoặc Zip"
                  type="text"
                />
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Loại dịch vụ
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    "Bảo vệ có vũ trang",
                    "Tuần tra không vũ trang",
                    "Bảo vệ sự kiện",
                    "An ninh mạng",
                    "Doanh nghiệp",
                    "Vận tải",
                    "VIP",
                    "Tuần tra",
                    "Khu dân cư",
                    "Vận chuyển",
                  ].map((tag) => {
                    const isChecked = selectedTags.includes(tag);
                    return (
                      <label key={tag} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags([...selectedTags, tag]);
                            } else {
                              setSelectedTags(selectedTags.filter((t) => t !== tag));
                            }
                            setCurrentPage(1);
                          }}
                          className="w-4 h-4 text-primary rounded bg-surface-container-low cursor-pointer accent-primary"
                        />
                        <span className="text-sm text-on-surface">{tag}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Giá mỗi giờ ($)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-9 px-2 bg-surface-container-low border border-outline-variant rounded text-sm text-center outline-none"
                    placeholder="Tối thiểu"
                    type="number"
                  />
                  <span className="text-outline-variant">-</span>
                  <input
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-9 px-2 bg-surface-container-low border border-outline-variant rounded text-sm text-center outline-none"
                    placeholder="Tối đa"
                    type="number"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Đánh giá tối thiểu
                </label>
                <div className="flex gap-1">
                  {[4, 3, "any"].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setMinRating(r as number | "any");
                        setCurrentPage(1);
                      }}
                      className={`flex-1 h-9 border rounded text-xs font-semibold ${
                        minRating === r
                          ? "border-primary bg-primary-fixed text-primary"
                          : "border-outline-variant bg-surface-container-low text-on-surface-variant"
                      }`}
                    >
                      {r === "any" ? "Bất kỳ" : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-outline-variant">
                <button
                  onClick={handleClearAll}
                  className="flex-1 h-10 border border-outline-variant rounded text-sm font-semibold text-on-surface hover:bg-surface-container-high"
                >
                  Xóa bộ lọc
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 h-10 bg-primary text-on-primary rounded text-sm font-semibold hover:bg-primary-container"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Content Canvas */}
      <main className="flex-1 flex flex-col gap-6 py-2 min-h-[calc(100vh-80px)]">
        {/* Search Input Box Area (Integrate within page top header) */}
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-12 pl-11 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-medium shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
            placeholder="Tìm kiếm công ty bảo vệ hoặc dịch vụ (ví dụ: Vũ trang, Sự kiện...)"
            type="text"
          />
        </div>

        {/* Content Header (Title, Count & Sorting options) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant pb-4">
          <div>
            <h1 className="text-xl font-bold text-on-surface">Các công ty bảo vệ</h1>
            <p className="text-xs text-on-surface-variant mt-1.5 font-medium">
              {filteredCompanies.length > 0 ? (
                <>
                  Đang hiển thị {startIndex + 1}-{endIndex} trong số{" "}
                  <span className="text-primary font-bold">{filteredCompanies.length}</span> nhà cung cấp đã được xác minh trong khu vực của bạn.
                </>
              ) : (
                "Không tìm thấy nhà cung cấp nào phù hợp với bộ lọc."
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden h-9 px-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-semibold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              Bộ lọc
            </button>

            <div className="flex items-center gap-2">
              <label className="text-xs text-on-surface-variant font-semibold shrink-0">Sắp xếp theo:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 pl-3 pr-8 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold text-on-surface outline-none focus:border-primary cursor-pointer shadow-sm transition-all"
              >
                <option>Đề xuất</option>
                <option>Đánh giá cao nhất</option>
                <option>Giá thấp nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dense Grid of Cards */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-16 bg-surface-container-lowest border border-dashed border-outline-variant rounded-2xl gap-4 shadow-inner">
            <div className="p-4 rounded-full bg-surface-container-low text-outline-variant">
              <SlidersHorizontal className="w-8 h-8 text-outline" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-on-surface">Không tìm thấy công ty bảo vệ phù hợp</p>
              <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
                Hãy thử giảm bớt tiêu chí lọc hoặc thay đổi từ khóa tìm kiếm của bạn.
              </p>
            </div>
            <button
              onClick={handleClearAll}
              className="h-9 px-4 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container hover:shadow transition-all cursor-pointer"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-outline-variant">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold bg-surface-container-lowest shadow-sm transition-all ${
                currentPage === 1
                  ? "opacity-40 cursor-not-allowed"
                  : "text-on-surface hover:bg-surface cursor-pointer active:scale-95"
              }`}
            >
              Trước
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold bg-surface-container-lowest shadow-sm transition-all ${
                currentPage === totalPages
                  ? "opacity-40 cursor-not-allowed"
                  : "text-on-surface hover:bg-surface cursor-pointer active:scale-95"
              }`}
            >
              Tiếp theo
            </button>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
