"use client";

import React, { useState } from "react";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Service } from "../types";

interface FilterSidebarProps {
  location: string;
  setLocation: (val: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  onClearAll: () => void;
  availableServices: Service[];
}

export default function FilterSidebar({
  location,
  setLocation,
  selectedTags,
  setSelectedTags,
  onClearAll,
  availableServices,
}: FilterSidebarProps) {
  const [showAllTags, setShowAllTags] = useState(false);

  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    }
  };

  const visibleServices = showAllTags
    ? availableServices
    : availableServices.slice(0, 4);

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
            placeholder="Thành phố hoặc Quận/Huyện"
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
          {visibleServices.map((service) => {
            const isChecked = selectedTags.includes(service.name);
            return (
              <label
                key={service.service_id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleTagChange(service.name, e.target.checked)}
                  className="w-4 h-4 border-outline-variant rounded text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container-lowest cursor-pointer accent-primary"
                />
                <span className="text-sm text-on-surface group-hover:text-primary transition-colors">
                  {service.name}
                </span>
              </label>
            );
          })}
          {availableServices.length > 4 && (
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
          )}
        </div>
      </div>
    </aside>
  );
}

