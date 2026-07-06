"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import {
  Search,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MarketplaceCompany } from "../types";
import { requestGetCompanies, requestGetCompanyFilters } from "../api/company.api";
import CompanySearchBar from "./CompanySearchBar";

// ─── Price Display Helper ─────────────────────────────────────────────────────
function PriceDisplay({ company, className = "" }: { company: MarketplaceCompany; className?: string }) {
  if (company.pricePerHour === 0) {
    return <span className={`text-on-surface-variant font-semibold ${className}`}>Liên hệ</span>;
  }
  if (company.serviceCount && company.serviceCount > 1 && company.maxPrice && company.maxPrice > company.pricePerHour) {
    return (
      <span className={className}>
        {company.pricePerHour.toLocaleString("vi-VN")} – {company.maxPrice.toLocaleString("vi-VN")}
        <span className="text-[10px] font-normal text-on-surface-variant ml-0.5">/vnđ</span>
      </span>
    );
  }
  return (
    <span className={className}>
      {company.pricePerHour.toLocaleString("vi-VN")}
      <span className="text-[10px] font-normal text-on-surface-variant ml-0.5">/vnđ</span>
    </span>
  );
}

// ─── Explore Card (compact) ───────────────────────────────────────────────────
function ExploreCompanyCard({ company }: { company: MarketplaceCompany }) {
  const isNew = company.rating === null;
  return (
    <Link
      href={`/companies/${company.id}`}
      className="group bg-surface-container-lowest border border-outline-variant/40 rounded-xl overflow-hidden flex flex-col hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-28 bg-surface-container-high overflow-hidden">
        {company.logoUrl ? (
          <img
            src={company.logoUrl}
            alt={company.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400 opacity-90"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 to-secondary/15">
            <span className="text-3xl font-black text-primary/25 uppercase">
              {company.initials}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Rating pill */}
        <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 shadow-sm">
          <Star className="w-2.5 h-2.5 fill-amber-400" />
          <span>{isNew ? "Mới" : company.rating?.toFixed(1)}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug" title={company.name}>
          {company.name}
        </h3>
        <p className="text-[10px] text-on-surface-variant flex items-center gap-0.5">
          <MapPin className="w-2.5 h-2.5 text-primary shrink-0" />
          <span className="truncate">{company.location}</span>
        </p>
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {company.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="bg-primary/8 text-primary text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
          {company.tags.length > 2 && (
            <span className="bg-surface-container text-on-surface-variant text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
              +{company.tags.length - 2}
            </span>
          )}
        </div>

        {/* Price + Details button */}
        <div className="mt-auto pt-2 border-t border-outline-variant/30 flex items-end justify-between gap-1">
          <div>
            <p className="text-[8px] font-bold text-outline uppercase tracking-wider mb-0.5">Giá dịch vụ</p>
            <PriceDisplay company={company} className="text-[11px] font-extrabold text-primary" />
          </div>
          <span className="shrink-0 h-6 px-2.5 bg-primary/8 text-primary text-[10px] font-bold rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-150 flex items-center justify-center whitespace-nowrap">
            Xem chi tiết
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────
function ExploreSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl overflow-hidden animate-pulse">
      <div className="h-28 bg-surface-container-high" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-3 bg-surface-container-high rounded w-3/4" />
        <div className="h-2.5 bg-surface-container-high rounded w-1/2" />
        <div className="h-2 bg-surface-container-high rounded w-full mt-1" />
        <div className="h-4 bg-surface-container-high rounded w-16 mt-1" />
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 20; // 5 rows × 4 cols

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SearchCompanies() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const location = searchParams.get("location") || "";
  const selectedService = searchParams.get("service") || "";
  const minPriceParam = searchParams.get("minPrice");
  const minPrice = minPriceParam ? parseInt(minPriceParam, 10) : undefined;
  const maxPriceParam = searchParams.get("maxPrice");
  const maxPrice = maxPriceParam ? parseInt(maxPriceParam, 10) : undefined;

  const [sortBy, setSortBy] = useState("Đề xuất");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Data
  const [exploreCompanies, setExploreCompanies] = useState<MarketplaceCompany[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPagesState, setTotalPagesState] = useState(1);
  const [isLoadingExplore, setIsLoadingExplore] = useState(true);

  // Close sort dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load explore companies
  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoadingExplore(true);
      try {
        const tags = selectedService ? selectedService.split(",") : [];
        const hasFilters =
          location.trim() !== "" ||
          tags.length > 0 ||
          minPrice !== undefined ||
          maxPrice !== undefined ||
          (sortBy !== "Đề xuất" && sortBy !== "verified" && sortBy !== "recent");

        const res = hasFilters
          ? await requestGetCompanyFilters({
              search: "",
              location,
              tags,
              sortBy: sortBy === "verified" || sortBy === "recent" ? "Đề xuất" : sortBy,
              minPrice,
              maxPrice,
              page: currentPage,
              limit: ITEMS_PER_PAGE,
            })
          : await requestGetCompanies({ page: currentPage, limit: ITEMS_PER_PAGE });

        if (mounted && res) {
          setExploreCompanies(res.companies || []);
          setTotalCount(res.totalCount || 0);
          setTotalPagesState(res.totalPages || 1);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setIsLoadingExplore(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [location, selectedService, sortBy, currentPage, minPrice, maxPrice]);

  const handleClearAll = () => {
    router.push("/companies");
    setSortBy("Đề xuất");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPagesState) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Pagination helper — show max 7 page buttons with ellipsis
  const getPageNumbers = () => {
    const total = totalPagesState;
    const cur = currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (cur <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", total);
    } else if (cur >= total - 3) {
      pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, "...", cur - 1, cur, cur + 1, "...", total);
    }
    return pages;
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

  return (
    <div className="min-h-screen pt-20 pb-20 bg-surface text-on-surface antialiased">
      {/* ── Hero Search Bar ─────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-8">
        <Suspense fallback={<div className="h-14 w-full bg-slate-100 rounded-2xl animate-pulse" />}>
          <CompanySearchBar variant="large" />
        </Suspense>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* ── Explore Section ───────────────────────────────────── */}
        <section>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-on-surface">Khám phá dịch vụ</h2>
              {!isLoadingExplore && totalCount > 0 && (
                <p className="text-xs text-on-surface-variant mt-0.5 font-medium">
                  Đang hiển thị {startIndex + 1}–{endIndex} trong{" "}
                  <span className="text-primary font-bold">{totalCount}</span> nhà cung cấp
                </p>
              )}
            </div>

            {/* Sort dropdown */}
            <div ref={sortRef} className="relative">
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border bg-white text-on-surface border-outline-variant hover:border-primary/40 hover:text-primary transition-all shadow-sm cursor-pointer"
              >
                <span>
                  {sortBy === "Đề xuất" ? "Đề xuất: Tất cả"
                    : sortBy === "Đánh giá cao nhất" ? "Đề xuất: Cao nhất"
                    : sortBy === "Đánh giá thấp nhất" ? "Đề xuất: Thấp nhất"
                    : "Đề xuất: Tất cả"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-outline" />
              </button>
              {sortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant/40 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  {[
                    { label: "Tất cả", value: "Đề xuất" },
                    { label: "Đánh giá cao nhất", value: "Đánh giá cao nhất" },
                    { label: "Đánh giá thấp nhất", value: "Đánh giá thấp nhất" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setCurrentPage(1); setSortDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-surface-container-low transition-colors ${
                        sortBy === opt.value ? "text-primary font-bold" : "text-on-surface font-medium"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid — 4 cols × 5 rows = 20 cards */}
          {isLoadingExplore ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 20 }).map((_, i) => <ExploreSkeleton key={i} />)}
            </div>
          ) : exploreCompanies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {exploreCompanies.map((c) => (
                <ExploreCompanyCard key={c.id} company={c} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
              <Search className="w-10 h-10 text-outline-variant" />
              <div className="text-center">
                <p className="text-sm font-bold text-on-surface">Không tìm thấy công ty phù hợp</p>
                <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
                  Hãy thử giảm bớt tiêu chí lọc hoặc thay đổi từ khóa tìm kiếm.
                </p>
              </div>
              <button
                onClick={handleClearAll}
                className="h-9 px-5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary/90 transition-all"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Pagination */}
          {!isLoadingExplore && totalPagesState > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-10">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center text-xs font-semibold transition-all ${
                  currentPage === 1
                    ? "opacity-30 cursor-not-allowed border-outline-variant bg-surface-container-lowest"
                    : "bg-white border-outline-variant hover:border-primary hover:text-primary cursor-pointer shadow-sm"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((page, i) =>
                page === "..." ? (
                  <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-xs text-outline">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-primary text-white shadow-md"
                        : "bg-white border border-outline-variant text-on-surface hover:border-primary hover:text-primary"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPagesState}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center text-xs font-semibold transition-all ${
                  currentPage === totalPagesState
                    ? "opacity-30 cursor-not-allowed border-outline-variant bg-surface-container-lowest"
                    : "bg-white border-outline-variant hover:border-primary hover:text-primary cursor-pointer shadow-sm"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
