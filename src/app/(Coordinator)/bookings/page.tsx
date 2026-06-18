"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { BookingHeader } from "@/features/booking/components/BookingHeader";
import { BookingTable } from "@/features/booking/components/BookingTable";
import { Booking } from "@/features/booking/types";
import { requestGetBookings } from "@/features/booking/api/booking.api";
import { useAuthStore } from "@/store/auth.store";

export default function CoordinatorBookingsPage() {
  const router = useRouter();
  const storeCompanyId = useAuthStore((state) => state.company_id);

  // Fallback to demo company ID if none is active in store
  const companyId = storeCompanyId || "9b9da580-1a8b-4394-87c4-ebcba555ffe5";

  // Data and loading states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Local state for pagination and filtering
  const [page, setPage] = useState(1);
  const limit = 8;

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch approved bookings (accepted status) from API
  useEffect(() => {
    let active = true;
    const fetchApprovedBookings = async () => {
      setIsLoading(true);
      try {
        const result = await requestGetBookings(
          companyId,
          page,
          limit,
          "accepted", // Booking status must be accepted
          "active"    // Contract status must be active
        );

        if (active) {
          setBookings(result.bookings || []);
          setTotalCount(result.totalCount || 0);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách đơn đặt lịch từ API:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchApprovedBookings();

    return () => {
      active = false;
    };
  }, [page, companyId]);

  // Handler for filter changes
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setPage(1);
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    setPage(1);
  };

  // Export report handler
  const handleExport = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(bookings, null, 2),
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute(
      "download",
      `don_yeu_cau_dieu_phoi_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <BookingHeader
        onExport={handleExport}
        onCreateNew={() =>
          alert("Điều phối viên không có quyền trực tiếp tạo đơn mới! Vui lòng liên hệ Admin hoặc Khách hàng.")
        }
      />

      {/* Filters Bar (No status dropdown) */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search */}
          <div className="md:col-span-7 flex flex-col">
            <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-[16px] h-[16px]" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm theo khách hàng, dịch vụ, địa chỉ..."
                className="w-full pl-9 pr-3 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="md:col-span-5 flex gap-3">
            <div className="flex-1 flex flex-col">
              <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                Từ ngày gửi
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                Đến ngày gửi
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-3 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
          <p className="text-xs text-on-surface-variant/80 font-medium">
            Đang tải danh sách đơn đặt lịch...
          </p>
        </div>
      ) : (
        <BookingTable
          bookings={bookings}
          totalCount={totalCount}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onViewDetails={(id) => router.push(`/bookings/${id}`)}
        />
      )}
    </div>
  );
}
