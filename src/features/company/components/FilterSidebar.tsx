"use client";

import React, { useState } from "react";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";

interface FilterSidebarProps {
  location: string;
  setLocation: (val: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  minRating: number | "any";
  setMinRating: (val: number | "any") => void;
  onClearAll: () => void;
}

const ALL_SERVICE_TAGS = [
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
];

export default function FilterSidebar({
  location,
  setLocation,
  selectedTags,
  setSelectedTags,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  onClearAll,
}: FilterSidebarProps) {
  const [showAllTags, setShowAllTags] = useState(false);

  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    }
  };

  const visibleTags = showAllTags
    ? ALL_SERVICE_TAGS
    : ALL_SERVICE_TAGS.slice(0, 4);

  return (
    <aside className="w-[260px] bg-surface-container-low border border-outline-variant rounded-xl p-6 flex flex-col gap-6 sticky top-24 h-[calc(100vh-120px)] self-start shrink-0 overflow-y-auto hidden md:flex">
      {/* Filter Header */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-2">
        <h2 className="text-base font-bold text-on-surface">Bộ lọc</h2>
        <button
          onClick={onClearAll}
          className="text-xs font-semibold text-primary hover:text-primary-container transition-colors cursor-pointer"
        >
          Xóa tất cả
        </button>
      </div>

      {/* Filter: Location */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
          Địa điểm
        </label>
        <div className="relative">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline w-4.5 h-4.5" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-surface-container-lowest border border-outline-variant rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline-variant"
            placeholder="Thành phố hoặc Zip"
            type="text"
          />
        </div>
      </div>

      {/* Filter: Service Type */}
      <div className="flex flex-col gap-2 mt-2">
        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
          Loại dịch vụ
        </label>
        <div className="flex flex-col gap-2">
          {visibleTags.map((tag) => {
            const isChecked = selectedTags.includes(tag);
            return (
              <label
                key={tag}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleTagChange(tag, e.target.checked)}
                  className="w-4 h-4 border-outline-variant rounded text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container-lowest cursor-pointer accent-primary"
                />
                <span className="text-sm text-on-surface group-hover:text-primary transition-colors">
                  {tag}
                </span>
              </label>
            );
          })}
          <button
            onClick={() => setShowAllTags(!showAllTags)}
            className="text-left text-xs font-semibold text-primary mt-1 flex items-center gap-1 hover:text-primary-container cursor-pointer transition-colors"
          >
            {showAllTags ? (
              <>
                Thu gọn <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Xem thêm <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter: Price Range */}
      <div className="flex flex-col gap-2 mt-2">
        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
          Giá mỗi giờ ($)
        </label>
        <div className="flex items-center gap-2">
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full h-9 px-2 bg-surface-container-lowest border border-outline-variant rounded text-sm text-center focus:border-primary outline-none transition-all"
            placeholder="Tối thiểu"
            type="number"
            min="0"
          />
          <span className="text-outline-variant">-</span>
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full h-9 px-2 bg-surface-container-lowest border border-outline-variant rounded text-sm text-center focus:border-primary outline-none transition-all"
            placeholder="Tối đa"
            type="number"
            min="0"
          />
        </div>
      </div>

      {/* Filter: Rating */}
      <div className="flex flex-col gap-2 mt-2">
        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
          Đánh giá tối thiểu
        </label>
        <div className="flex gap-1">
          <button
            onClick={() => setMinRating(4)}
            className={`flex-1 h-9 border rounded text-sm font-medium transition-all cursor-pointer ${
              minRating === 4
                ? "border-primary bg-primary-fixed text-primary font-bold shadow-sm"
                : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-outline"
            }`}
          >
            4+
          </button>
          <button
            onClick={() => setMinRating(3)}
            className={`flex-1 h-9 border rounded text-sm font-medium transition-all cursor-pointer ${
              minRating === 3
                ? "border-primary bg-primary-fixed text-primary font-bold shadow-sm"
                : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-outline"
            }`}
          >
            3+
          </button>
          <button
            onClick={() => setMinRating("any")}
            className={`flex-1 h-9 border rounded text-sm font-medium transition-all cursor-pointer ${
              minRating === "any"
                ? "border-primary bg-primary-fixed text-primary font-bold shadow-sm"
                : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-outline"
            }`}
          >
            Bất kỳ
          </button>
        </div>
      </div>
    </aside>
  );
}
