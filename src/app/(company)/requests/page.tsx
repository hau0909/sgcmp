"use client";

import React, { useState, useMemo, useEffect } from "react";
import { BookingHeader } from "@/features/booking/components/BookingHeader";
import { BookingFilters } from "@/features/booking/components/BookingFilters";
import { BookingTable } from "@/features/booking/components/BookingTable";
import { Booking } from "@/features/booking/types";
import { requestGetBookings } from "@/features/booking/api/booking.api";

export default function BookingsPage() {
  // Bookings list state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 8;

  // Fetch bookings from API
  useEffect(() => {
    let active = true;
    const companyId = "9b9da580-1a8b-4394-87c4-ebcba555ffe5"; // Demo company ID
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const res = await requestGetBookings(companyId, page, limit);
        if (active) {
          setBookings(res.bookings || []);
          setTotalCount(res.totalCount || 0);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách yêu cầu đặt lịch:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchBookings();

    return () => {
      active = false;
    };
  }, [page]);

  // Filters state (UI only, no filtering is performed)
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Change handlers for filters (so inputs remain interactive)
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
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
      `danh_sach_yeu_cau_${new Date().toISOString().slice(0, 10)}.json`,
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
          alert("Chức năng tạo yêu cầu trực tiếp đang được xây dựng!")
        }
      />

      {/* Filters Bar */}
      <BookingFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        startDate={startDate}
        onStartDateChange={handleStartDateChange}
        endDate={endDate}
        onEndDateChange={handleEndDateChange}
      />

      {/* Data Table */}
      {isLoading ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
          <p className="text-xs text-on-surface-variant/80 font-medium">
            Đang tải danh sách yêu cầu...
          </p>
        </div>
      ) : (
        <BookingTable
          bookings={bookings}
          totalCount={totalCount}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onViewDetails={() => {}}
        />
      )}
    </div>
  );
}
