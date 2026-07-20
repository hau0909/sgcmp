"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookingFilters } from "@/features/booking/components/BookingFilters";
import { BookingTable } from "@/features/booking/components/BookingTable";
import { Booking } from "@/features/booking/types";
import { requestGetCustomerBookings } from "@/features/booking/api/booking.api";
import { useAuthStore } from "@/store/auth.store";
import { Calendar } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

export default function MyRequestsPage() {
  const router = useRouter();
  const customerId = useAuthStore((state) => state.user_id);
  const { dict } = useTranslation();

  // Bookings list state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 8;

  // Fetch bookings from API
  useEffect(() => {
    if (!customerId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const res = await requestGetCustomerBookings(customerId, page, limit);
        if (active) {
          setBookings(res.bookings || []);
          setTotalCount(res.totalCount || 0);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách yêu cầu dịch vụ của tôi:", error);
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
  }, [page, customerId]);

  // Filters state (UI only)
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-2xs">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-on-surface font-headline leading-tight">
              {dict.customer.my_requests.title}
            </h1>
            <p className="text-xs text-on-surface-variant/80 font-body">
              {dict.customer.my_requests.desc}
            </p>
          </div>
        </div>
      </div>

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
            {dict.customer.my_requests.loading}
          </p>
        </div>
      ) : (
        <BookingTable
          bookings={bookings}
          totalCount={totalCount}
          page={page}
          limit={limit}
          onPageChange={setPage}
          viewMode="customer"
          onViewDetails={(id) => router.push(`/my-requests/${id}`)}
        />
      )}
    </div>
  );
}
