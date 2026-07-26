"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Camera } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CompanyDetailGalleryProps {
  images?: string[];
  companyName: string;
}

export default function CompanyDetailGallery({
  images = [],
  companyName,
}: CompanyDetailGalleryProps) {
  const { dict } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const displayImages = images || [];

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev === 0 ? displayImages.length - 1 : prev - 1) : null
    );
  }, [displayImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev === displayImages.length - 1 ? 0 : prev + 1) : null
    );
  }, [displayImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setSelectedIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handlePrev, handleNext]);

  if (displayImages.length === 0) {
    return null;
  }

  // Slice at most 3 images for the Bento Grid layout
  const visibleImages = displayImages.slice(0, 3);
  const remainingCount = displayImages.length - 3;

  const t = dict.customer?.company_detail || {};

  return (
    <section className="py-8 border-b border-outline-variant/60">
      <div className="text-[11px] font-bold tracking-widest text-primary uppercase mb-1">
        {t.gallery_eyebrow || "Hình ảnh hoạt động"}
      </div>
      <h2 className="text-2xl font-bold text-on-surface mb-4">
        {t.gallery_title || "Xem thêm"}
      </h2>

      {/* Bento Grid Layout: 1 Featured Left (col-span-2) + 2 Stacked Right (col-span-1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Left Side: Featured Image 1 */}
        {visibleImages[0] && (
          <div
            onClick={() => setSelectedIndex(0)}
            className="md:col-span-2 relative h-56 sm:h-64 md:h-[312px] rounded-2xl overflow-hidden group cursor-pointer bg-surface-container-high shadow-xs"
          >
            <img
              src={visibleImages[0]}
              alt={`${companyName} - ${t.gallery_photo_index || "Hình ảnh"} 1`}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            />
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end">
              <span className="text-white text-xs sm:text-sm font-medium tracking-wide drop-shadow-xs truncate">
                {companyName} - {t.gallery_photo_index || "Hình ảnh"} 1
              </span>
            </div>
          </div>
        )}

        {/* Right Side: Stack of 2 Images */}
        <div className="md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-3.5">
          {/* Card 2 */}
          {visibleImages[1] && (
            <div
              onClick={() => setSelectedIndex(1)}
              className="relative h-36 sm:h-40 md:h-[149px] rounded-xl overflow-hidden group cursor-pointer bg-surface-container-high shadow-xs"
            >
              <img
                src={visibleImages[1]}
                alt={`${companyName} - ${t.gallery_photo_index || "Hình ảnh"} 2`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                <span className="text-white text-[11px] font-medium tracking-wide drop-shadow-xs truncate">
                  {companyName} - {t.gallery_photo_index || "Hình ảnh"} 2
                </span>
              </div>
            </div>
          )}

          {/* Card 3 (with +N overlay if remainingCount > 0) */}
          {visibleImages[2] && (
            <div
              onClick={() => setSelectedIndex(2)}
              className="relative h-36 sm:h-40 md:h-[149px] rounded-xl overflow-hidden group cursor-pointer bg-surface-container-high shadow-xs"
            >
              <img
                src={visibleImages[2]}
                alt={`${companyName} - ${t.gallery_photo_index || "Hình ảnh"} 3`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {remainingCount > 0 ? (
                /* +N Overlay */
                <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition-colors group-hover:bg-black/80 p-2 text-center">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-none">
                    +{remainingCount}
                  </span>
                  <span className="text-[11px] font-semibold text-white/90 mt-1">
                    {t.gallery_see_all || "Xem tất cả"} {displayImages.length} {t.gallery_photos || "ảnh"}
                  </span>
                </div>
              ) : (
                /* Normal Caption */
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                  <span className="text-white text-[11px] font-medium tracking-wide drop-shadow-xs truncate">
                    {companyName} - {t.gallery_photo_index || "Hình ảnh"} 3
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Carousel Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          onClick={() => setSelectedIndex(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Header row */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl flex items-center justify-between text-white/90 py-2"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15">
              <Camera className="w-4 h-4 text-amber-300" />
              <span>
                {t.gallery_photo_index || "Hình ảnh"} {selectedIndex + 1} / {displayImages.length}
              </span>
            </div>
            <button
              onClick={() => setSelectedIndex(null)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer border border-white/15"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Image Stage with Nav Buttons */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-2"
          >
            {/* Prev Button */}
            {displayImages.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-lg transition-transform active:scale-90 cursor-pointer"
                title="Ảnh trước"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Main Active Image */}
            <div className="relative max-h-[70vh] max-w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center">
              <img
                src={displayImages[selectedIndex]}
                alt={`${companyName} - ${t.gallery_photo_index || "Hình ảnh"} ${selectedIndex + 1}`}
                className="max-h-[70vh] max-w-full object-contain rounded-xl select-none"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-center">
                <span className="text-white text-xs sm:text-sm font-medium tracking-wide">
                  {companyName} - {t.gallery_photo_index || "Hình ảnh"} {selectedIndex + 1}
                </span>
              </div>
            </div>

            {/* Next Button */}
            {displayImages.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-lg transition-transform active:scale-90 cursor-pointer"
                title="Ảnh tiếp theo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Thumbnail Bar */}
          {displayImages.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl flex items-center justify-center gap-2 py-2 overflow-x-auto"
            >
              {displayImages.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 transition-all border-2 cursor-pointer ${
                    i === selectedIndex
                      ? "border-amber-400 scale-105 shadow-md opacity-100"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
