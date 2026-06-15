"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import FilterSidebar from "./FilterSidebar";
import CompanyCard from "./CompanyCard";
import { MarketplaceCompany, City, Ward, Service } from "../types";
import { requestGetCompanies, requestGetCompanyFilters } from "../api/company.api";

function CompanyCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded bg-surface-container-high border border-outline-variant flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="h-4 bg-surface-container-high rounded w-3/4" />
            <div className="h-4 bg-surface-container-high rounded w-8" />
          </div>
          <div className="h-3 bg-surface-container-high rounded w-1/2 mt-2" />
        </div>
      </div>
      <div className="flex gap-1.5 mt-2">
        <div className="h-5 bg-surface-container-high rounded w-16" />
        <div className="h-5 bg-surface-container-high rounded w-20" />
        <div className="h-5 bg-surface-container-high rounded w-14" />
      </div>
      <div className="flex justify-between items-end mt-4 pt-3 border-t border-outline-variant/50">
        <div>
          <div className="h-2 bg-surface-container-high rounded w-12 mb-1" />
          <div className="h-4 bg-surface-container-high rounded w-16" />
        </div>
        <div className="h-8 bg-surface-container-high rounded w-20" />
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 6;

export default function SearchCompanies() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Đề xuất");
  const [currentPage, setCurrentPage] = useState(1);

  // Available filter options from database
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [availableWards, setAvailableWards] = useState<Ward[]>([]);

  // Fetching states
  const [companies, setCompanies] = useState<MarketplaceCompany[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPagesState, setTotalPagesState] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Mobile filter drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load available filters on mount
  useEffect(() => {
    async function loadFilters() {
      try {
        const filters = await requestGetCompanyFilters();
        setAvailableServices(filters.services || []);
        setAvailableCities(filters.cities || []);
        setAvailableWards(filters.wards || []);
      } catch (error) {
        console.error("Failed to load company filters:", error);
      }
    }
    loadFilters();
  }, []);

  // Clear all filters
  const handleClearAll = () => {
    setSearchQuery("");
    setLocation("");
    setSelectedTags([]);
    setCurrentPage(1);
  };

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch companies from backend
  useEffect(() => {
    let isMounted = true;

    async function fetchCompanies() {
      setIsLoading(true);
      try {
        const hasFilters =
          debouncedSearchQuery.trim() !== "" ||
          location.trim() !== "" ||
          selectedTags.length > 0 ||
          sortBy !== "Đề xuất";

        const response = hasFilters
          ? await requestGetCompanyFilters({
              search: debouncedSearchQuery,
              location: location,
              tags: selectedTags,
              sortBy,
              page: currentPage,
              limit: ITEMS_PER_PAGE,
            })
          : await requestGetCompanies({
              page: currentPage,
              limit: ITEMS_PER_PAGE,
            });

        if (isMounted && response) {
          setCompanies(response.companies || []);
          setTotalCount(response.totalCount || 0);
          setTotalPagesState(response.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchCompanies();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearchQuery, location, selectedTags, sortBy, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

  // Handle page changes
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPagesState) {
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
        onClearAll={handleClearAll}
        availableServices={availableServices}
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
                  placeholder="Thành phố hoặc Quận/Huyện"
                  type="text"
                />
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Loại dịch vụ
                </label>
                <div className="flex flex-col gap-2">
                  {availableServices.map((service) => {
                    const isChecked = selectedTags.includes(service.name);
                    return (
                      <label key={service.service_id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags([...selectedTags, service.name]);
                            } else {
                              setSelectedTags(selectedTags.filter((t) => t !== service.name));
                            }
                            setCurrentPage(1);
                          }}
                          className="w-4 h-4 text-primary rounded bg-surface-container-low cursor-pointer accent-primary"
                        />
                        <span className="text-sm text-on-surface">{service.name}</span>
                      </label>
                    );
                  })}
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
              {isLoading ? (
                <span>Đang tải danh sách nhà cung cấp...</span>
              ) : totalCount > 0 ? (
                <>
                  Đang hiển thị {startIndex + 1}-{endIndex} trong số{" "}
                  <span className="text-primary font-bold">{totalCount}</span> nhà cung cấp đã được xác minh trong khu vực của bạn.
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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <CompanyCardSkeleton />
            <CompanyCardSkeleton />
            <CompanyCardSkeleton />
          </div>
        ) : companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {companies.map((company) => (
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
        {!isLoading && totalPagesState > 1 && (
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
              {Array.from({ length: totalPagesState }, (_, i) => i + 1).map((page) => (
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
              disabled={currentPage === totalPagesState}
              className={`px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold bg-surface-container-lowest shadow-sm transition-all ${
                currentPage === totalPagesState
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
